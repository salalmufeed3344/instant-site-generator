# CortexOS — 3-Minute Demo Script

> Tagline: **Turn Company Knowledge into an AI Workforce**
> CortexOS is not a chatbot. It's an enterprise AI platform that turns your documents,
> policies, and processes into a coordinated AI workforce with organizational memory.

---

## 0:00 — 0:20 · The Hook

> "Every company has knowledge scattered across documents, wikis, and people's heads.
> CortexOS turns that chaos into a coordinated AI workforce your organization can query,
> collaborate with, and trust."

**Show:** `/auth` → sign in → land on `/overview`.

---

## 0:20 — 0:50 · Organization Overview

**Show:** `/overview`
- Point out the **Knowledge Score** ring.
- Highlight KPI cards: Documents, AI Departments, Policies, Processes, Memory Items.
- Scroll to the **AI Workforce Status** grid — each department is live and clickable.

> "This is your live organizational brain. Every card here was extracted from your own
> documents — no manual configuration."

---

## 0:50 — 1:30 · Knowledge Ingestion & AI Analysis

**Show:** `/knowledge` → upload a document → open the document detail page.

- Show the **staged AI Analysis Progress**:
  Reading → Understanding → Departments → Policies → Processes → Memory → Workforce → Finalize.
- When it completes, open `/organization-graph` to show extracted entities.

> "In under a minute, CortexOS reads the document, identifies departments, extracts
> policies, maps processes, and updates the organizational memory graph."

---

## 1:30 — 2:15 · AI Workforce & Live Task

**Show:** `/ai-departments` — the workforce dashboard.
- Click **Human Resources** to open the department detail.
- Return to `/ai-tasks` and submit:
  > "How do employees request leave?"

Point out the **Task Flow Visual**:
Understanding Request → Selecting Departments → Consulting Memory → Reviewing Policies →
Preparing Response → Final Answer.

Expand the **Reasoning Panel** to show:
- Knowledge Sources Used
- Policies Referenced
- Departments Consulted
- Documents Analyzed
- Memory References
- Confidence & Execution Timeline

> "Every answer is fully traceable back to the source knowledge. This is not a chatbot —
> this is transparent enterprise reasoning."

---

## 2:15 — 2:40 · Memory & Health

**Show:** `/memory` → Decision Log and Relationship Graph.
**Show:** `/health` → composite AI readiness rings and coverage bars.

> "CortexOS remembers every decision, links entities across departments, and shows
> exactly how AI-ready your organization is."

---

## 2:40 — 3:00 · Wrap

**Show:** Cmd/Ctrl+K to trigger the **global command palette** — search across documents,
departments, policies, tasks, and memory in one place.

> "One search bar for your entire company. One workforce that scales with your knowledge.
> That's CortexOS."

---

## Fallback tips

- If Qwen is offline, orchestration falls back to the built-in keyword heuristic — the
  demo still runs end-to-end.
- Seed the AI Departments from `/ai-departments` before the demo if empty.
- Pre-upload one policy doc so `/overview` is populated on first load.
