# Roadmap

## Phase 1 — Enterprise Foundation ✅

- Authentication (email/password + Google)
- Organizations, profiles, documents schema with RLS
- Application shell (sidebar, topbar, breadcrumbs)
- Design system and docs

## Phase 2 — Knowledge Foundation ✅ (this release)

- Multi-step Organization Setup Wizard (org details → method → complete)
- Three onboarding methods:
  - Import Documents (drag & drop, PDF/DOCX/TXT/MD, Supabase Storage)
  - AI Guided Interview (15 questions with autosave & skip)
  - Industry Templates (10 templates that seed departments)
- Knowledge Hub with statistics, profile summary, and completion tracker
- Departments CRUD (create, edit, delete, search, sort)
- Organization Profile editing (industry, size, country, timezone, mission, vision, description, website, contact)
- Templates page for applying additional templates at any time
- `company-documents` Storage bucket, org-scoped RLS
- New tables: `departments`, `interview_answers`, `knowledge_sources`, `organization_templates`

## Phase 3 — Qwen Intelligence ✅ (this release)

- Qwen Cloud (DashScope OpenAI-compatible) integration behind server functions
- Document analysis pipeline: read → extract text → chunk → Qwen → validate → merge → persist
- Structured knowledge tables: `document_analysis`, `policies`, `roles`, `processes`, `approval_chains`, `knowledge_entities`, `knowledge_relationships`, `analysis_logs`
- Automatic re-population of `departments` from extracted knowledge
- New Document Insights page (`/documents/$id`) with stage progress and re-analyze
- New Organization Graph page (`/organization-graph`) with SVG visualization of extracted entities
- Knowledge Hub upgraded with per-document status and policy/role/process counters
- Retries, timeouts, and per-chunk error recovery

## Phase 4 — AI Workforce & Agent Orchestration ✅

- `ai_departments`, `department_configs`, `tasks`, `task_executions`, `task_steps`, `task_sources`, `approvals` tables with per-org RLS
- 8 seedable default departments (HR, Finance, Sales, Marketing, Support, Ops, IT, Legal) plus manual department creation
- Task router that picks 1–3 departments using Qwen with a keyword-heuristic fallback
- Multi-department orchestration: per-department response + Qwen-based aggregation into a final answer
- Transparent execution timeline (Understanding → Selecting → Gathering → Consulting → Building → Finalizing)
- Task History with filtering + Task Detail with department chain, sources, and confidence
- Human approval framework (UI + records; no external side effects)
- Reusable server-side services: `routeTask`, `runDepartmentStep`, `aggregateResponses`, `calculateConfidence`, `checkApproval`, `buildDepartmentPrompt`

## Phase 5 — Organizational Memory Engine ✅

- New tables: `memory_items`, `memory_relationships`, `decision_history`, `memory_tags`, `search_history`, `timeline_events`, `knowledge_metrics` (all org-scoped, RLS + GRANTs)
- Memory Center at `/memory` with Recent / Important / Pinned / Departments / Decisions / Timeline / Graph / Insights tabs
- Scoped search across policies, departments, processes, decisions, and documents (`searchMemory`)
- Interactive relationship graph with node-selection highlighting
- Decisions are now recorded automatically by every AI task, linked to referenced policies
- Insight dashboard: memory health, completeness, category breakdown, active departments, recent activity
- Timeline log filterable by department
- New services in `src/lib/memory.server.ts`: `upsertMemory`, `linkMemories`, `recordTimelineEvent`, `recordDecision`, `computeInsights`
- Docs: `docs/MEMORY_ENGINE.md`

## Phase 6 — Workflow Automation & Human Approval (next)

- Multi-step workflows built from processes
- Approval chains wired to real reviewer users
- Scheduled and event-driven triggers
- Audit log surface built on `timeline_events`

## Phase 7 — Enterprise Rollout

- SSO / SAML
- RBAC via `user_roles` + `app_role` enum
- Billing and plan management

## Phase 6 — AI Workforce Experience & Live Demo Flow ✅

- New **Organization Overview** at `/overview` (now the authenticated home) with a
  Knowledge Score hero, KPI grid, AI Workforce status cards, and recent activity
- **Organization Health** dashboard at `/health` with AI Readiness / Knowledge
  Coverage / Memory Health rings and per-signal coverage bars
- **Activity Center** at `/activity` — unified filterable timeline (documents,
  departments, policies, processes, tasks, memory)
- **Command Palette** (`⌘K` / `Ctrl+K`) with categorized global search across
  documents, departments, policies, processes, tasks, and memory
- Reusable **AnalysisProgress** component with an animated 8-stage pipeline
  (reading → understanding → departments → policies → processes → memory →
  workforce → finalizing) — drop-in replacement for spinners
- Reusable **TaskFlowVisual** and **ReasoningPanel** components — visual
  workflow + collapsible transparency panel showing knowledge sources, policies,
  departments, documents, memory references, confidence, and execution timeline
- Redesigned sidebar with grouped navigation (Workspace / Intelligence /
  AI Workforce / Account) and updated topbar with `⌘K` search trigger
- New `docs/DEMO_SCRIPT.md` — recommended 3-minute walkthrough for judges
