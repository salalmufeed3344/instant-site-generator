# Organizational Memory Engine

CortexOS Phase 5 adds a persistent memory layer that captures organizational
knowledge, decisions, and the relationships between them. Memory is
per-organization and never shared across tenants.

## Architecture

Two independent layers cooperate to produce memory:

1. **Source knowledge** (Phase 2–4) — documents, policies, processes,
   departments, tasks, decisions. Owned by the primary domain tables.
2. **Memory layer** (Phase 5) — a normalized set of tables that index that
   source knowledge into memory items, link them with typed relationships, and
   record the chronological events that produced them.

```
documents/policies/processes/tasks
                │
                ▼
        Memory Indexer
                │
                ▼
        memory_items ─┬─► memory_relationships (typed edges)
                       │
                       ├─► decision_history (task-produced decisions)
                       │
                       └─► timeline_events (chronological log)
```

## Memory categories

`memory_items.category` is one of:

| Category      | Sourced from                       |
| ------------- | ---------------------------------- |
| organization  | `organizations`                    |
| department    | `ai_departments`                   |
| policy        | `policies`                         |
| process       | `processes`                        |
| decision      | AI task completion                 |
| document      | `documents`                        |

Each memory row carries `importance`, `confidence`, `tags[]`, a `pinned` flag,
a `reference_count`, and pointers back to its origin (`source_type`,
`source_id`). Upserts by `(source_type, source_id)` keep the memory
idempotent when re-indexed.

## Memory lifecycle

1. **Ingest** — `indexOrganizationMemory` scans org tables and calls
   `upsertMemory` for each entity.
2. **Link** — `linkMemories` writes typed edges (`has_department`,
   `has_policy`, `has_process`, `derived_from`, `references`).
3. **Record** — every completed AI task calls `recordDecision`,
   `upsertMemory` (category=`decision`), and `recordTimelineEvent`. Referenced
   policy memories are linked as `references`.
4. **Query** — the Memory Center UI reads recent, important, pinned, and
   category-filtered memory; `searchMemory` performs case-insensitive title +
   summary search scoped to the organization; `computeInsights` returns
   dashboard metrics.

## Relationship model

`memory_relationships` is a directed edge table:

- `from_memory_id`, `to_memory_id`
- `relationship_type` — free-form string, examples above
- `weight` (0–1) — used for future ranking

Uniqueness is enforced on
`(from_memory_id, to_memory_id, relationship_type)` so the indexer can safely
re-run.

## Decision recording

`decision_history` is the audit-friendly record of AI task outcomes. It
stores the task ID, the final decision, the reasoning summary, referenced
policy IDs, departments involved, confidence, and a status
(`recorded` / `pending_approval` / …). Every decision also has a matching
row in `memory_items` (category=`decision`) so it flows through the same
search, ranking, and graph views as the rest of memory.

## Timeline events

`timeline_events` is an append-only log of things worth remembering: memory
indexing runs, task completions, and future events. It powers the timeline
tab and can be filtered by department.

## Current implementation

- **Server services** (`src/lib/memory.server.ts`):
  `upsertMemory`, `linkMemories`, `recordTimelineEvent`, `recordDecision`,
  `computeInsights`.
- **Server functions** (`src/lib/memory.functions.ts`):
  `indexOrganizationMemory`, `searchMemory`, `memoryInsights`,
  `togglePinMemory`.
- **Task hook**: `runTask` (Phase 4) now writes a decision, a memory item,
  policy links, and a timeline event after finalizing.
- **UI** (`src/routes/_authenticated/memory.tsx`): Memory Center with Recent /
  Important / Pinned / Departments / Decisions / Timeline / Graph / Insights
  tabs, semantic-style search, and an interactive relationship graph.

## Security

Every memory table has RLS enabled with policies scoped to
`current_user_organization_id()`. Memory is never readable across
organizations, and every server function resolves the organization from the
authenticated user's profile.
