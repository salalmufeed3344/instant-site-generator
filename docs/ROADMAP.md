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

## Phase 3 — Qwen Intelligence (next)

- Document parsing pipeline (chunking, embeddings)
- Vector search over `knowledge_sources`
- Qwen Cloud inference for reasoning over org knowledge
- Agent authoring & execution
- Department-scoped memory
- Workflow automation

## Phase 4 — Enterprise Rollout

- SSO / SAML
- Audit log
- RBAC via `user_roles` + `app_role` enum
- Billing and plan management
