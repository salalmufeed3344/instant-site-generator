// Organizational Memory server helpers (Phase 5).
// Server-only. Not imported from client code.

export type MemoryCategory =
  | "organization"
  | "department"
  | "policy"
  | "decision"
  | "process"
  | "document";

export type MemoryInsert = {
  organization_id: string;
  category: MemoryCategory;
  title: string;
  summary?: string | null;
  content?: string | null;
  source_type?: string | null;
  source_id?: string | null;
  importance?: number;
  confidence?: number;
  tags?: string[];
};

/** Memory Manager — upsert-by-source. */
export async function upsertMemory(supabase: any, m: MemoryInsert) {
  if (m.source_type && m.source_id) {
    const { data: existing } = await supabase
      .from("memory_items")
      .select("id")
      .eq("organization_id", m.organization_id)
      .eq("source_type", m.source_type)
      .eq("source_id", m.source_id)
      .maybeSingle();
    if (existing?.id) {
      await supabase
        .from("memory_items")
        .update({
          title: m.title,
          summary: m.summary ?? null,
          content: m.content ?? null,
          importance: m.importance ?? 0.5,
          confidence: m.confidence ?? 0.5,
          tags: m.tags ?? [],
        })
        .eq("id", existing.id);
      return existing.id as string;
    }
  }
  const { data: created, error } = await supabase
    .from("memory_items")
    .insert({
      organization_id: m.organization_id,
      category: m.category,
      title: m.title,
      summary: m.summary ?? null,
      content: m.content ?? null,
      source_type: m.source_type ?? null,
      source_id: m.source_id ?? null,
      importance: m.importance ?? 0.5,
      confidence: m.confidence ?? 0.5,
      tags: m.tags ?? [],
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return created.id as string;
}

/** Relationship Mapper — link two memories with a typed edge. */
export async function linkMemories(
  supabase: any,
  orgId: string,
  fromId: string,
  toId: string,
  relationshipType = "related_to",
  weight = 1.0,
) {
  if (fromId === toId) return;
  await supabase
    .from("memory_relationships")
    .upsert(
      {
        organization_id: orgId,
        from_memory_id: fromId,
        to_memory_id: toId,
        relationship_type: relationshipType,
        weight,
      },
      { onConflict: "from_memory_id,to_memory_id,relationship_type" },
    );
}

/** Timeline Generator — record a domain event. */
export async function recordTimelineEvent(
  supabase: any,
  orgId: string,
  event: {
    event_type: string;
    title: string;
    description?: string | null;
    ref_type?: string | null;
    ref_id?: string | null;
    department_name?: string | null;
    occurred_at?: string;
  },
) {
  await supabase.from("timeline_events").insert({
    organization_id: orgId,
    event_type: event.event_type,
    title: event.title,
    description: event.description ?? null,
    ref_type: event.ref_type ?? null,
    ref_id: event.ref_id ?? null,
    department_name: event.department_name ?? null,
    occurred_at: event.occurred_at ?? new Date().toISOString(),
  });
}

/** Decision Recorder — persist an AI task decision. */
export async function recordDecision(
  supabase: any,
  orgId: string,
  input: {
    task_id?: string | null;
    title: string;
    decision: string;
    reasoning?: string | null;
    referenced_policy_ids?: string[];
    departments_involved?: string[];
    confidence?: number | null;
    status?: string;
  },
) {
  const { data, error } = await supabase
    .from("decision_history")
    .insert({
      organization_id: orgId,
      task_id: input.task_id ?? null,
      title: input.title,
      decision: input.decision,
      reasoning: input.reasoning ?? null,
      referenced_policy_ids: input.referenced_policy_ids ?? [],
      departments_involved: input.departments_involved ?? [],
      confidence: input.confidence ?? null,
      status: input.status ?? "recorded",
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return data.id as string;
}

/** Insight Generator — compute dashboard metrics on demand. */
export async function computeInsights(supabase: any, orgId: string) {
  const [mem, decisions, tasks, docs, policies, deps, timeline] = await Promise.all([
    supabase.from("memory_items").select("id, category, importance, reference_count").eq("organization_id", orgId),
    supabase.from("decision_history").select("id").eq("organization_id", orgId),
    supabase.from("tasks").select("id, status").eq("organization_id", orgId),
    supabase.from("documents").select("id").eq("organization_id", orgId),
    supabase.from("policies").select("id, title").eq("organization_id", orgId),
    supabase.from("ai_departments").select("id, name, status").eq("organization_id", orgId),
    supabase
      .from("timeline_events")
      .select("id, occurred_at, event_type, department_name")
      .eq("organization_id", orgId)
      .order("occurred_at", { ascending: false })
      .limit(50),
  ]);

  const memRows = (mem.data ?? []) as Array<{
    id: string;
    category: string;
    importance: number;
    reference_count: number;
  }>;
  const tasksRows = (tasks.data ?? []) as Array<{ status: string }>;
  const depsRows = (deps.data ?? []) as Array<{ name: string; status: string }>;

  const completeness = clamp01(
    ((docs.data?.length ?? 0) > 0 ? 0.25 : 0) +
      ((policies.data?.length ?? 0) > 0 ? 0.25 : 0) +
      ((depsRows.length ?? 0) > 0 ? 0.25 : 0) +
      ((memRows.length ?? 0) > 0 ? 0.25 : 0),
  );
  const health = clamp01(
    0.4 * completeness +
      0.3 * clamp01(memRows.length / 25) +
      0.3 *
        (tasksRows.length === 0
          ? 0
          : tasksRows.filter((t) => t.status === "completed").length / tasksRows.length),
  );

  return {
    counts: {
      memories: memRows.length,
      decisions: (decisions.data ?? []).length,
      tasks: tasksRows.length,
      documents: (docs.data ?? []).length,
      policies: (policies.data ?? []).length,
      departments: depsRows.length,
    },
    by_category: countBy(memRows.map((m) => m.category)),
    top_referenced: memRows
      .filter((m) => m.reference_count > 0)
      .sort((a, b) => b.reference_count - a.reference_count)
      .slice(0, 5),
    active_departments: depsRows.filter((d) => d.status === "active").map((d) => d.name),
    completeness,
    health,
    recent_activity: (timeline.data ?? []).slice(0, 12),
  };
}

function clamp01(n: number) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}
function countBy(xs: string[]) {
  const out: Record<string, number> = {};
  for (const x of xs) out[x] = (out[x] ?? 0) + 1;
  return out;
}
