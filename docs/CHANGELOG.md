# CHANGELOG

All notable changes to CortexOS are documented here.

## [1.0.0] — 2026-07-14 · Production Polish

### Added
- **Landing page overhaul**: cleaner hero, 5-step "how it works" flow, trust badges,
  and an example task preview.
- **Help Center** (`/help`) with quick-start, getting-started checklist, and FAQs.
- **Settings** expanded with tabs — Organization / Appearance (theme) /
  Notifications / Security / Integrations / Language.
- Editable organization profile (name, industry, size) with optimistic save.
- Light/dark/system theme selector persisted to `localStorage`.
- **CHANGELOG.md** and **Release Notes**.

### Improved
- Consistent card radius, borders, spacing, and shadow tokens across pages.
- Better focus states and `aria-label`s on icon-only buttons.
- `min-h-dvh` on public routes instead of `h-screen` for mobile safety.
- Meta descriptions and OG tags on landing and Help pages.

## [0.6.0] — Phase 6 · Live Demo Flow
- Organization Overview home (`/overview`) with Knowledge Score hero.
- Organization Health dashboard (`/health`).
- Activity Center (`/activity`).
- Global Command Palette (`⌘K`/`Ctrl+K`).
- Reusable AnalysisProgress, TaskFlowVisual, and ReasoningPanel components.
- Sidebar grouped into Workspace / Intelligence / AI Workforce / Account.
- `docs/DEMO_SCRIPT.md`.

## [0.5.0] — Phase 5 · Organizational Memory
- Memory Center with dashboard, decisions, timeline, relationship graph.
- 7 new tables: `memory_items`, `memory_relationships`, `decision_history`,
  `memory_tags`, `search_history`, `timeline_events`, `knowledge_metrics`.
- Automatic decision + timeline recording from every AI task.

## [0.4.0] — Phase 4 · AI Workforce
- Specialized AI departments with intelligent task routing.
- 7 new tables and end-to-end orchestration pipeline.
- Human approval controls for high-impact tasks.

## [0.3.0] — Phase 3 · Qwen Intelligence
- Qwen Cloud integration with 7-stage analysis pipeline.
- Document analysis extracting departments, policies, processes, and entities.
- Organization Graph (`/organization-graph`).

## [0.2.0] — Phase 2 · Knowledge Foundation
- Document uploads, industry templates, Knowledge Hub, departments management.

## [0.1.0] — Phase 1 · Enterprise Foundation
- Auth, onboarding, sidebar, topbar, reusable components, dashboard shell.
