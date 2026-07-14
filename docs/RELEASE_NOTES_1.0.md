# CortexOS v1.0 — Release Notes

**Turn Company Knowledge into an AI Workforce.**

CortexOS 1.0 is the first production-quality release. It is an enterprise AI
platform — not a chatbot — that reads your documents, understands your
organization, builds specialized AI departments, remembers every decision, and
assists your employees with fully cited, transparent answers.

## Highlights

- **Organization Overview** — a Knowledge Score, live KPIs, AI workforce status,
  and recent activity on a single home screen.
- **Staged AI analysis** — every document flows through eight animated stages,
  from *Reading Documents* to *Preparing AI Workforce*.
- **AI Workforce** — seed a full set of specialized departments (HR, Finance,
  Operations, Sales, Marketing, Support, Legal) in one click.
- **Transparent reasoning** — every AI answer includes a collapsible panel with
  knowledge sources, policies, departments, documents, memory references,
  confidence, and execution timeline.
- **Organizational memory** — decisions, timeline events, and relationships are
  captured automatically and browsable from Memory Center.
- **Global search** — `⌘K` / `Ctrl+K` searches documents, departments,
  policies, processes, tasks, and memory in one place.
- **Health dashboard** — AI Readiness, Knowledge Coverage, and Memory Health
  rings with per-signal coverage bars.
- **Help Center** — quick start, getting-started checklist, and FAQs.
- **Themed settings** — organization profile, appearance (light/dark/system),
  notifications, security preferences, integrations, language.

## What's next (post-1.0)

- PDF / DOCX document parsing
- Real-time streaming task execution
- Team members and role-based access (`user_roles` + `app_role`)
- Slack, Google Drive, Notion, and Microsoft Teams integrations
- SSO / SAML for enterprise deployments
- Vector search (`pgvector`) for semantic retrieval

## Known limitations

- Document ingestion currently supports Text and Markdown natively.
- Task execution polls at 2 s; streaming is planned.
- SSO, 2FA, and audit log export are UI-only placeholders in Settings.

## Upgrade notes

- Authenticated users now land on `/overview` instead of `/dashboard`.
- The classic `/dashboard` route is preserved for continuity.
- `⌘K` / `Ctrl+K` opens the global command palette anywhere in the app.
