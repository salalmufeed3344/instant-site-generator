// Client-callable memory server functions (Phase 5).
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  computeInsights,
  linkMemories,
  recordTimelineEvent,
  upsertMemory,
} from "@/lib/memory.server";

async function orgOf(supabase: any, userId: string): Promise<string> {
  const { data } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", userId)
    .maybeSingle();
  if (!data?.organization_id) throw new Error("No organization for current user");
  return data.organization_id as string;
}

/** Memory Indexer — build memory items from existing org knowledge. */
export const indexOrganizationMemory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as unknown as { supabase: any; userId: string };
    const orgId = await orgOf(supabase, userId);

    const stats = { organization: 0, departments: 0, policies: 0, processes: 0, documents: 0, links: 0 };
    const policyIdToMem = new Map<string, string>();
    const deptNameToMem = new Map<string, string>();

    // Organization
    const { data: org } = await supabase
      .from("organizations")
      .select("id, name, mission, vision")
      .eq("id", orgId)
      .maybeSingle();
    let orgMemId: string | null = null;
    if (org) {
      orgMemId = await upsertMemory(supabase, {
        organization_id: orgId,
        category: "organization",
        title: org.name ?? "Organization",
        summary: org.mission ?? org.vision ?? "Organization profile",
        source_type: "organization",
        source_id: org.id,
        importance: 0.95,
        confidence: 0.9,
        tags: ["organization"],
      });
      stats.organization++;
    }

    // AI Departments
    const { data: deps } = await supabase
      .from("ai_departments")
      .select("id, name, purpose, description, confidence")
      .eq("organization_id", orgId);
    for (const d of (deps ?? []) as any[]) {
      const id = await upsertMemory(supabase, {
        organization_id: orgId,
        category: "department",
        title: d.name,
        summary: d.purpose ?? d.description ?? null,
        source_type: "ai_department",
        source_id: d.id,
        importance: 0.7,
        confidence: d.confidence ?? 0.6,
        tags: ["department"],
      });
      deptNameToMem.set(d.name.toLowerCase(), id);
      if (orgMemId) {
        await linkMemories(supabase, orgId, orgMemId, id, "has_department");
        stats.links++;
      }
      stats.departments++;
    }

    // Policies
    const { data: policies } = await supabase
      .from("policies")
      .select("id, title, description, category")
      .eq("organization_id", orgId);
    for (const p of (policies ?? []) as any[]) {
      const id = await upsertMemory(supabase, {
        organization_id: orgId,
        category: "policy",
        title: p.title,
        summary: p.description ?? null,
        source_type: "policy",
        source_id: p.id,
        importance: 0.6,
        confidence: 0.7,
        tags: p.category ? ["policy", p.category] : ["policy"],
      });
      policyIdToMem.set(p.id, id);
      if (orgMemId) {
        await linkMemories(supabase, orgId, orgMemId, id, "has_policy");
        stats.links++;
      }
      stats.policies++;
    }

    // Processes
    const { data: procs } = await supabase
      .from("processes")
      .select("id, name, description")
      .eq("organization_id", orgId);
    for (const p of (procs ?? []) as any[]) {
      const id = await upsertMemory(supabase, {
        organization_id: orgId,
        category: "process",
        title: p.name,
        summary: p.description ?? null,
        source_type: "process",
        source_id: p.id,
        importance: 0.55,
        confidence: 0.7,
        tags: ["process"],
      });
      if (orgMemId) {
        await linkMemories(supabase, orgId, orgMemId, id, "has_process");
        stats.links++;
      }
      stats.processes++;
    }

    // Documents
    const { data: docs } = await supabase
      .from("documents")
      .select("id, title")
      .eq("organization_id", orgId);
    for (const d of (docs ?? []) as any[]) {
      const id = await upsertMemory(supabase, {
        organization_id: orgId,
        category: "document",
        title: d.title,
        summary: "Source document",
        source_type: "document",
        source_id: d.id,
        importance: 0.5,
        confidence: 0.65,
        tags: ["document"],
      });
      if (orgMemId) {
        await linkMemories(supabase, orgId, orgMemId, id, "derived_from", 0.7);
        stats.links++;
      }
      stats.documents++;
    }

    await recordTimelineEvent(supabase, orgId, {
      event_type: "memory_indexed",
      title: "Organization memory indexed",
      description: `Indexed ${stats.organization + stats.departments + stats.policies + stats.processes + stats.documents} memory items`,
    });

    return stats;
  });

/** Search across memory + core knowledge. */
export const searchMemory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        query: z.string().min(1).max(200),
        scope: z.enum(["all", "policy", "department", "process", "decision", "document"]).default("all"),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as unknown as { supabase: any; userId: string };
    const orgId = await orgOf(supabase, userId);
    const q = data.query.trim();
    const like = `%${q}%`;

    let query = supabase
      .from("memory_items")
      .select("id, category, title, summary, importance, confidence, tags, updated_at")
      .eq("organization_id", orgId)
      .or(`title.ilike.${like},summary.ilike.${like}`)
      .order("importance", { ascending: false })
      .limit(50);
    if (data.scope !== "all") query = query.eq("category", data.scope);
    const { data: rows } = await query;

    await supabase.from("search_history").insert({
      organization_id: orgId,
      user_id: userId,
      query: q,
      scope: data.scope,
      result_count: rows?.length ?? 0,
    });

    return { results: rows ?? [] };
  });

/** Insights for the memory dashboard. */
export const memoryInsights = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as unknown as { supabase: any; userId: string };
    const orgId = await orgOf(supabase, userId);
    return computeInsights(supabase, orgId);
  });

/** Toggle pinned. */
export const togglePinMemory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ memoryId: z.string().uuid(), pinned: z.boolean() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context as unknown as { supabase: any };
    const { error } = await supabase
      .from("memory_items")
      .update({ pinned: data.pinned })
      .eq("id", data.memoryId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
