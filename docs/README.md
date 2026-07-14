# CortexOS

**Turn Company Knowledge into an AI Workforce.**

CortexOS is an enterprise AI platform. It reads your company's documents,
understands your organization, builds specialized AI departments, remembers
every decision, and assists your employees with fully cited, transparent
answers.

> This is **not** a chatbot. Every response cites its sources, references your
> policies, consults the right departments, and can pass through human approval.

## Tech Stack

- **React 19** + **TypeScript** (strict)
- **TanStack Start** (v1) with file-based routing and server functions
- **TanStack Query** for data fetching
- **Tailwind CSS v4** + **shadcn/ui**
- **Lovable Cloud** (managed Supabase) — Postgres, Auth, Storage, RLS
- **Qwen Cloud** — structured extraction and orchestration
- **Vite 7** — build tool

## Quick Start

1. Sign up at the CortexOS preview URL.
2. Complete the onboarding flow (organization name, industry, size).
3. Upload one or more documents in **Knowledge Hub**.
4. Watch the staged analysis extract departments, policies, and processes.
5. Seed **AI Departments** (HR, Finance, Ops, Sales, Marketing, Support, Legal).
6. Ask a question in **AI Task Center** — expand the reasoning panel to see how
   CortexOS arrived at its answer.

Press `⌘K` / `Ctrl+K` anywhere to open the global command palette.

## Project Structure

```
src/
  routes/
    __root.tsx
    index.tsx                 # landing
    auth.tsx                  # sign in / sign up
    onboarding.tsx
    help.tsx                  # help center
    _authenticated/
      overview.tsx            # home (Knowledge Score, KPIs, workforce)
      health.tsx              # AI readiness dashboard
      activity.tsx            # unified activity feed
      knowledge.tsx           # document + knowledge hub
      documents.$documentId.tsx
      organization-graph.tsx  # extracted entities visualization
      ai-departments.tsx      # AI workforce
      ai-departments.$slug.tsx
      ai-tasks.tsx            # task center
      ai-tasks.$taskId.tsx    # task detail + reasoning
      task-history.tsx
      memory.tsx              # organizational memory
      departments.tsx
      templates.tsx
      workflows.tsx
      profile.tsx
      settings.tsx            # tabbed settings
  components/
    analysis/AnalysisProgress.tsx
    task/TaskFlowVisual.tsx
    task/ReasoningPanel.tsx
    search/CommandPalette.tsx
    knowledge/DocumentUploadZone.tsx
    layout/{AppSidebar,AppTopbar,PageHeader,StatCard,EmptyState}.tsx
    brand/Logo.tsx
    ui/                        # shadcn primitives
  lib/
    analyze-document.functions.ts
    ai-workforce.functions.ts
    memory.functions.ts
    memory.server.ts
    orchestration.server.ts
    qwen.server.ts
    text-extraction.server.ts
    knowledge-schema.ts
    industry-templates.ts
  integrations/supabase/       # auto-generated Lovable Cloud client
docs/
  README.md
  ROADMAP.md
  PROJECT_VISION.md
  SYSTEM_ARCHITECTURE.md
  DATABASE_DESIGN.md
  QWEN_INTEGRATION.md
  MEMORY_ENGINE.md
  DEMO_SCRIPT.md
  CHANGELOG.md
  RELEASE_NOTES_1.0.md
```

## Environment

CortexOS relies on **Lovable Cloud** for its backend. No local `.env` setup is
required — the managed integration provisions Supabase, RLS, storage, and edge
runtime automatically.

For structured extraction, set `QWEN_API_KEY` via the secrets manager. When it
is missing, orchestration falls back to a deterministic keyword heuristic so
the platform still runs end-to-end.

## Documentation

- **[DEMO_SCRIPT.md](DEMO_SCRIPT.md)** — recommended 3-minute walkthrough
- **[ROADMAP.md](ROADMAP.md)** — phase-by-phase build log
- **[SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md)** — subsystem map
- **[DATABASE_DESIGN.md](DATABASE_DESIGN.md)** — table catalogue
- **[QWEN_INTEGRATION.md](QWEN_INTEGRATION.md)** — analysis pipeline
- **[MEMORY_ENGINE.md](MEMORY_ENGINE.md)** — organizational memory design
- **[CHANGELOG.md](CHANGELOG.md)** — versioned changes
- **[RELEASE_NOTES_1.0.md](RELEASE_NOTES_1.0.md)** — v1.0 announcement

## License

Proprietary — CortexOS.
