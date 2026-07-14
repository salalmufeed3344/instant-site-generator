// Server-only orchestration services for the AI Workforce (Phase 4).
// Not imported from client code.

import { qwenChat, QwenError } from "@/lib/qwen.server";

export type AiDepartmentRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  purpose: string | null;
  responsibilities: string[];
  status: string;
  confidence: number;
};

export type RoutedDepartment = {
  department_id: string;
  department_name: string;
  reason: string;
  confidence: number;
};

const ROUTER_SYSTEM = `You are the CortexOS Task Router.
Given a business question and a list of AI departments, decide which departments should participate.
Return ONLY strict JSON of shape:
{
  "departments": [
    { "slug": string, "reason": string, "confidence": number }
  ],
  "requires_approval": boolean,
  "approval_reason": string | null
}
Rules:
- Pick 1 to 3 departments. Order them by relevance (most relevant first).
- Confidence is 0..1.
- Only reference department slugs from the provided list.
- requires_approval=true only for irreversible or high-impact actions (money, hiring, legal).`;

/**
 * Department Resolver + Task Router.
 * Uses Qwen to select which departments should handle a task, with a
 * keyword-based fallback when the model is unavailable.
 */
export async function routeTask(
  request: string,
  departments: AiDepartmentRow[],
): Promise<{
  routed: RoutedDepartment[];
  requires_approval: boolean;
  approval_reason: string | null;
}> {
  const active = departments.filter((d) => d.status === "active");
  if (active.length === 0) {
    return { routed: [], requires_approval: false, approval_reason: null };
  }

  const catalog = active.map((d) => ({
    slug: d.slug,
    name: d.name,
    purpose: d.purpose ?? d.description ?? "",
    responsibilities: d.responsibilities.slice(0, 8),
  }));

  try {
    const res = await qwenChat(
      [
        { role: "system", content: ROUTER_SYSTEM },
        {
          role: "user",
          content: JSON.stringify({ request, departments: catalog }),
        },
      ],
      { jsonMode: true, temperature: 0.1, maxRetries: 1 },
    );
    const parsed = JSON.parse(res.content) as {
      departments?: Array<{ slug?: string; reason?: string; confidence?: number }>;
      requires_approval?: boolean;
      approval_reason?: string | null;
    };
    const routed: RoutedDepartment[] = [];
    for (const p of parsed.departments ?? []) {
      const dept = active.find((d) => d.slug === p.slug);
      if (!dept) continue;
      routed.push({
        department_id: dept.id,
        department_name: dept.name,
        reason: p.reason ?? "Relevant to the request.",
        confidence: clamp01(p.confidence ?? 0.6),
      });
      if (routed.length >= 3) break;
    }
    if (routed.length > 0) {
      return {
        routed,
        requires_approval: Boolean(parsed.requires_approval),
        approval_reason: parsed.approval_reason ?? null,
      };
    }
  } catch (e) {
    if (!(e instanceof QwenError)) {
      // fall through to heuristic
    }
  }

  // Fallback: keyword overlap heuristic
  const q = request.toLowerCase();
  const scored = active
    .map((d) => {
      const hay = [d.name, d.description ?? "", d.purpose ?? "", ...d.responsibilities]
        .join(" ")
        .toLowerCase();
      const tokens = Array.from(new Set(q.match(/[a-z]{4,}/g) ?? []));
      const hits = tokens.filter((t) => hay.includes(t)).length;
      return { dept: d, hits };
    })
    .sort((a, b) => b.hits - a.hits);
  const top = scored.slice(0, scored[0]?.hits ? 2 : 1);
  return {
    routed: top.map((s) => ({
      department_id: s.dept.id,
      department_name: s.dept.name,
      reason: s.hits
        ? `Matched ${s.hits} keyword(s) in this department's scope.`
        : "Default fallback department.",
      confidence: s.hits ? Math.min(0.7, 0.4 + s.hits * 0.1) : 0.35,
    })),
    requires_approval: false,
    approval_reason: null,
  };
}

/** Prompt Builder — assembles a per-department system prompt with allowed scope. */
export function buildDepartmentPrompt(
  dept: AiDepartmentRow,
  configPrompt: string | null,
): string {
  const base = configPrompt?.trim().length
    ? configPrompt.trim()
    : `You are the ${dept.name} department for this organization.
Purpose: ${dept.purpose ?? dept.description ?? "Handle matters within your scope."}
Responsibilities:
${(dept.responsibilities ?? []).map((r) => `- ${r}`).join("\n") || "- (none listed)"}`;
  return `${base}

Rules:
- Answer strictly from the organization's own policies and knowledge.
- If you don't know, say what information is missing.
- Be concise and structured. Reference relevant policies or processes by name.
- Never invent numbers, names, or approvers.`;
}

const DEPT_ANSWER_SYSTEM_SUFFIX = `Respond in plain prose (no markdown headings), under 180 words.`;

/** Run one department's contribution. */
export async function runDepartmentStep(
  dept: AiDepartmentRow,
  configPrompt: string | null,
  request: string,
  context: string,
): Promise<{ response: string; confidence: number; durationMs: number }> {
  const started = Date.now();
  try {
    const system = `${buildDepartmentPrompt(dept, configPrompt)}\n\n${DEPT_ANSWER_SYSTEM_SUFFIX}`;
    const res = await qwenChat(
      [
        { role: "system", content: system },
        {
          role: "user",
          content: `Request:\n${request}\n\nRelevant organization context:\n${context || "(no additional context)"}\n\nProvide the ${dept.name} department's response.`,
        },
      ],
      { temperature: 0.2, maxRetries: 1 },
    );
    return {
      response: res.content.trim(),
      confidence: dept.confidence > 0 ? Math.min(0.95, 0.5 + dept.confidence / 2) : 0.7,
      durationMs: Date.now() - started,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return {
      response: `The ${dept.name} department could not complete its contribution: ${msg}`,
      confidence: 0.2,
      durationMs: Date.now() - started,
    };
  }
}

/** Response Aggregator — merges multiple department responses into a final answer. */
export async function aggregateResponses(
  request: string,
  parts: Array<{ department_name: string; response: string }>,
): Promise<{ finalResponse: string; confidence: number }> {
  if (parts.length === 0) {
    return {
      finalResponse:
        "No department was available to respond. Please add or activate an AI department for this topic.",
      confidence: 0,
    };
  }
  if (parts.length === 1) {
    return { finalResponse: parts[0].response, confidence: 0.75 };
  }
  try {
    const res = await qwenChat(
      [
        {
          role: "system",
          content:
            "You merge multiple department responses into a single coherent answer for an employee. Keep it factual, structured, under 220 words, and note when departments disagree.",
        },
        {
          role: "user",
          content: `Question: ${request}\n\nDepartment responses:\n${parts
            .map((p) => `[${p.department_name}]\n${p.response}`)
            .join("\n\n")}\n\nWrite the final unified answer.`,
        },
      ],
      { temperature: 0.2, maxRetries: 1 },
    );
    return { finalResponse: res.content.trim(), confidence: 0.82 };
  } catch {
    return {
      finalResponse: parts.map((p) => `**${p.department_name}**\n${p.response}`).join("\n\n"),
      confidence: 0.6,
    };
  }
}

/** Confidence Calculator — combines routing and execution confidences. */
export function calculateConfidence(
  routing: RoutedDepartment[],
  executions: Array<{ confidence: number }>,
  aggregate: number,
): number {
  if (routing.length === 0 || executions.length === 0) return 0;
  const avgRouting = avg(routing.map((r) => r.confidence));
  const avgExec = avg(executions.map((e) => e.confidence));
  return clamp01(avgRouting * 0.3 + avgExec * 0.4 + aggregate * 0.3);
}

/** Approval Checker — returns true when a task requires human approval. */
export function checkApproval(
  request: string,
  routerFlag: boolean,
): { requires: boolean; reason: string | null } {
  if (routerFlag) return { requires: true, reason: "Router flagged high-impact action." };
  const triggers = [
    /\b(hire|fire|terminate)\b/i,
    /\b(purchase|buy|spend|budget|invoice)\b/i,
    /\b(contract|legal|nda|agreement)\b/i,
    /\b(refund|discount|write[- ]off)\b/i,
  ];
  for (const rx of triggers) {
    if (rx.test(request)) {
      return { requires: true, reason: `Contains ${rx.source} — needs human approval.` };
    }
  }
  return { requires: false, reason: null };
}

function clamp01(n: number) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}
function avg(xs: number[]) {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
}
