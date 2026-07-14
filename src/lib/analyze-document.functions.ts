// Server function: analyze a document with Qwen and persist structured knowledge.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { qwenChat, QwenError, QwenAccessDeniedError } from "@/lib/qwen.server";
import { extractText, chunkText } from "@/lib/text-extraction.server";
import {
  validateKnowledge,
  mergeKnowledge,
  EMPTY_KNOWLEDGE,
  type ExtractedKnowledge,
} from "@/lib/knowledge-schema";

const SYSTEM_PROMPT = `You are the CortexOS Knowledge Extractor.
You receive a chunk of a company document. Extract structured organizational knowledge as strict JSON.

Return ONLY a JSON object with this exact shape (arrays may be empty, never omit keys):
{
  "summary": string,
  "organization": { "mission"?: string, "vision"?: string, "values"?: string[] },
  "departments": [{ "name": string, "description"?: string, "confidence"?: number }],
  "roles": [{ "title": string, "department"?: string, "description"?: string, "responsibilities"?: string[], "confidence"?: number }],
  "policies": [{ "title": string, "description"?: string, "category"?: string, "rules"?: string[], "confidence"?: number }],
  "processes": [{ "name": string, "description"?: string, "steps"?: string[], "triggers"?: string[], "outputs"?: string[], "confidence"?: number }],
  "approval_chains": [{ "name": string, "description"?: string, "steps"?: [{ "role"?: string, "approver"?: string, "condition"?: string }], "confidence"?: number }],
  "decision_points": string[],
  "important_dates": [{ "label": string, "date"?: string }],
  "contacts": [{ "name"?: string, "role"?: string, "contact"?: string }],
  "tools": string[],
  "risks": string[],
  "compliance": string[],
  "terms": string[],
  "unknowns": string[],
  "confidence": number
}
Rules: no free-form prose, no markdown, no code fences. Confidence values are 0..1.
If a field is not present in the text, use an empty array or omit an optional key.`;

async function extractChunk(chunk: string): Promise<ExtractedKnowledge> {
  const res = await qwenChat(
    [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: chunk },
    ],
    { jsonMode: true, temperature: 0.1 },
  );
  let parsed: unknown;
  try {
    parsed = JSON.parse(res.content);
  } catch {
    // Attempt to salvage the first JSON object in the response
    const match = res.content.match(/\{[\s\S]*\}/);
    if (!match) throw new QwenError("Model returned non-JSON output", 502, false);
    parsed = JSON.parse(match[0]);
  }
  return validateKnowledge(parsed);
}

type LogFn = (level: "info" | "warn" | "error", stage: string, message: string) => Promise<void>;

async function persistKnowledge(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  orgId: string,
  documentId: string,
  knowledge: ExtractedKnowledge,
) {
  // Clear prior extractions for this document
  await Promise.all([
    supabase.from("policies").delete().eq("organization_id", orgId).eq("source_document_id", documentId),
    supabase.from("roles").delete().eq("organization_id", orgId).eq("source_document_id", documentId),
    supabase.from("processes").delete().eq("organization_id", orgId).eq("source_document_id", documentId),
    supabase.from("approval_chains").delete().eq("organization_id", orgId).eq("source_document_id", documentId),
    supabase.from("knowledge_entities").delete().eq("organization_id", orgId).eq("source_document_id", documentId),
  ]);

  if (knowledge.departments.length) {
    // Upsert departments by (org, name)
    for (const d of knowledge.departments) {
      const { data: existing } = await supabase
        .from("departments")
        .select("id")
        .eq("organization_id", orgId)
        .ilike("name", d.name)
        .maybeSingle();
      if (!existing) {
        await supabase
          .from("departments")
          .insert({ organization_id: orgId, name: d.name, description: d.description ?? null });
      }
    }
  }

  if (knowledge.policies.length) {
    await supabase.from("policies").insert(
      knowledge.policies.map((p) => ({
        organization_id: orgId,
        source_document_id: documentId,
        title: p.title,
        description: p.description ?? null,
        category: p.category ?? null,
        rules: p.rules ?? [],
        confidence: p.confidence ?? null,
      })),
    );
  }
  if (knowledge.roles.length) {
    await supabase.from("roles").insert(
      knowledge.roles.map((r) => ({
        organization_id: orgId,
        source_document_id: documentId,
        title: r.title,
        description: r.description ?? null,
        responsibilities: r.responsibilities ?? [],
        confidence: r.confidence ?? null,
      })),
    );
  }
  if (knowledge.processes.length) {
    await supabase.from("processes").insert(
      knowledge.processes.map((p) => ({
        organization_id: orgId,
        source_document_id: documentId,
        name: p.name,
        description: p.description ?? null,
        steps: p.steps ?? [],
        triggers: p.triggers ?? [],
        outputs: p.outputs ?? [],
        confidence: p.confidence ?? null,
      })),
    );
  }
  if (knowledge.approval_chains.length) {
    await supabase.from("approval_chains").insert(
      knowledge.approval_chains.map((a) => ({
        organization_id: orgId,
        source_document_id: documentId,
        name: a.name,
        description: a.description ?? null,
        steps: a.steps ?? [],
        confidence: a.confidence ?? null,
      })),
    );
  }

  // Generic entities for the graph view
  const entities: {
    entity_type: string;
    name: string;
    description?: string | null;
  }[] = [
    ...knowledge.departments.map((d) => ({
      entity_type: "department",
      name: d.name,
      description: d.description ?? null,
    })),
    ...knowledge.roles.map((r) => ({
      entity_type: "role",
      name: r.title,
      description: r.description ?? null,
    })),
    ...knowledge.policies.map((p) => ({
      entity_type: "policy",
      name: p.title,
      description: p.description ?? null,
    })),
    ...knowledge.processes.map((p) => ({
      entity_type: "process",
      name: p.name,
      description: p.description ?? null,
    })),
    ...knowledge.tools.map((t) => ({ entity_type: "tool", name: t })),
    ...knowledge.risks.map((t) => ({ entity_type: "risk", name: t })),
    ...knowledge.compliance.map((t) => ({ entity_type: "compliance", name: t })),
    ...knowledge.terms.map((t) => ({ entity_type: "term", name: t })),
  ];
  if (entities.length) {
    await supabase.from("knowledge_entities").insert(
      entities.map((e) => ({
        organization_id: orgId,
        source_document_id: documentId,
        entity_type: e.entity_type,
        name: e.name,
        description: e.description ?? null,
      })),
    );
  }
}

export const analyzeDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ documentId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as unknown as {
      supabase: any;
      userId: string;
    };
    void userId;

    // 1. Load document (RLS restricts to org)
    const { data: doc, error: docErr } = await supabase
      .from("documents")
      .select("id, organization_id, title, storage_path, mime_type, file_size")
      .eq("id", data.documentId)
      .maybeSingle();
    if (docErr || !doc) throw new Error("Document not found or not accessible");

    // 2. Create/reset analysis row
    const { data: existing } = await supabase
      .from("document_analysis")
      .select("id")
      .eq("document_id", doc.id)
      .maybeSingle();

    let analysisId: string;
    if (existing?.id) {
      analysisId = existing.id;
      await supabase
        .from("document_analysis")
        .update({
          status: "running",
          stage: "Reading document",
          progress: 5,
          error: null,
          warnings: [],
          result: null,
        })
        .eq("id", analysisId);
    } else {
      const { data: created, error: createErr } = await supabase
        .from("document_analysis")
        .insert({
          organization_id: doc.organization_id,
          document_id: doc.id,
          status: "running",
          stage: "Reading document",
          progress: 5,
        })
        .select("id")
        .single();
      if (createErr || !created) throw new Error(createErr?.message ?? "Failed to create analysis");
      analysisId = created.id;
    }

    const log: LogFn = async (level, stage, message) => {
      await supabase.from("analysis_logs").insert({
        organization_id: doc.organization_id,
        analysis_id: analysisId,
        level,
        stage,
        message,
      });
    };

    const setProgress = async (progress: number, stage: string) => {
      await supabase
        .from("document_analysis")
        .update({ progress, stage })
        .eq("id", analysisId);
    };

    try {
      await log("info", "read", `Starting analysis of ${doc.title}`);

      // 3. Download file bytes
      if (!doc.storage_path) throw new Error("Document has no storage path");
      const { data: file, error: dlErr } = await supabase.storage
        .from("company-documents")
        .download(doc.storage_path);
      if (dlErr || !file) throw new Error(`Download failed: ${dlErr?.message ?? "unknown"}`);

      const bytes = await file.arrayBuffer();
      if (bytes.byteLength === 0) throw new Error("File is empty");

      await setProgress(15, "Understanding organization");
      const extracted = await extractText(bytes, doc.mime_type ?? null, doc.title);
      const warnings = [...extracted.warnings];

      if (!extracted.supported || extracted.text.length < 40) {
        await supabase
          .from("document_analysis")
          .update({
            status: "failed",
            stage: "Text extraction",
            progress: 100,
            warnings,
            error:
              extracted.warnings[0] ??
              "Could not extract enough text from this document.",
          })
          .eq("id", analysisId);
        await log("error", "read", "Text extraction produced no usable content");
        return { ok: false, analysisId, warnings };
      }

      await setProgress(30, "Finding departments");
      const chunks = chunkText(extracted.text);
      await log("info", "chunk", `Split into ${chunks.length} chunk(s)`);

      const partials: ExtractedKnowledge[] = [];
      let tokens = 0;
      let modelUsed = "";
      const stages = ["Extracting policies", "Mapping workflows", "Building knowledge"];
      for (let i = 0; i < chunks.length; i++) {
        const stage = stages[Math.min(i, stages.length - 1)];
        await setProgress(30 + Math.round(((i + 1) / chunks.length) * 55), stage);
        try {
          const part = await extractChunk(chunks[i]);
          partials.push(part);
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          warnings.push(`Chunk ${i + 1}: ${msg}`);
          await log("warn", "extract", `Chunk ${i + 1} failed: ${msg}`);
        }
      }

      const merged = partials.length ? mergeKnowledge(partials) : { ...EMPTY_KNOWLEDGE };

      await setProgress(90, "Finalizing results");
      await persistKnowledge(supabase, doc.organization_id, doc.id, merged);

      await supabase
        .from("document_analysis")
        .update({
          status: partials.length ? "completed" : "failed",
          stage: partials.length ? "Complete" : "Failed",
          progress: 100,
          summary: merged.summary,
          confidence: merged.confidence,
          model: modelUsed || undefined,
          tokens_used: tokens || null,
          warnings,
          result: merged as unknown as Record<string, unknown>,
          error: partials.length ? null : "All chunks failed to extract",
        })
        .eq("id", analysisId);

      // Update knowledge_sources status
      await supabase
        .from("knowledge_sources")
        .update({ status: partials.length ? "ready" : "pending" })
        .eq("organization_id", doc.organization_id)
        .eq("reference_id", doc.id);

      await log("info", "done", `Analysis finished with confidence ${merged.confidence}`);
      return { ok: partials.length > 0, analysisId, warnings };
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      await supabase
        .from("document_analysis")
        .update({
          status: "failed",
          stage: "Failed",
          progress: 100,
          error: message,
        })
        .eq("id", analysisId);
      await log("error", "pipeline", message);
      return { ok: false, analysisId, warnings: [message] };
    }
  });

export const qwenHealth = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const { qwenHealthCheck } = await import("@/lib/qwen.server");
    return qwenHealthCheck();
  });
