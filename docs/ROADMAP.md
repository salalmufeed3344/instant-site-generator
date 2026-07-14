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

## Phase 5 — Organizational Memory (next)

- Persistent long-term memory per department
- Vector search / RAG over `knowledge_sources`
- Cross-task learning and citation grounding
- Editable department prompts and tools

## Phase 5 — Enterprise Rollout

- SSO / SAML
- Audit log
- RBAC via `user_roles` + `app_role` enum
- Billing and plan management
