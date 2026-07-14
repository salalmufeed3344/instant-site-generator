# CortexOS

> Build your AI organization.

CortexOS is an enterprise AI platform that turns company knowledge into intelligent AI teams capable of understanding documents, executing workflows, remembering decisions, and assisting employees.

This repository contains **Phase 1: the Enterprise Foundation**. It intentionally ships the scaffolding — authentication, organizations, profiles, documents, navigation, and design system — without any AI features yet. Phase 2 will layer agents, memory, and workflow execution on top.

## Table of contents

1. [Project overview](#project-overview)
2. [Features implemented](#features-implemented)
3. [Technology stack](#technology-stack)
4. [Folder structure](#folder-structure)
5. [Getting started](#getting-started)
6. [Environment variables](#environment-variables)
7. [Project architecture](#project-architecture)
8. [Development workflow](#development-workflow)
9. [Future roadmap](#future-roadmap)
10. [Contributing](#contributing)
11. [License](#license)

## Project overview

CortexOS is not a chatbot. It is an enterprise platform that models an organization — its people, documents, departments, workflows, and decisions — so that AI agents can operate meaningfully inside that context. Phase 1 delivers a production-quality shell that Phase 2 features can plug into cleanly.

## Features implemented

- Email/password and Google authentication
- Password reset flow
- Protected routes with an authenticated layout
- Organizations, profiles, and documents tables with RLS
- Auto-provisioned profile on signup
- Sidebar-based application shell with breadcrumbs and workspace search
- Dashboard with organization health, knowledge coverage, and activity widgets
- Empty-state scaffolds for Knowledge, Departments, Workflows, Memory, Tasks
- Profile and Settings pages
- Shared design system (semantic tokens, shadcn/ui, Inter)

## Technology stack

- **Framework:** TanStack Start (React 19, SSR + server functions)
- **Routing:** TanStack Router (file-based)
- **Data:** TanStack Query
- **UI:** shadcn/ui + Tailwind CSS v4
- **Auth / DB / Storage:** Lovable Cloud (Supabase under the hood)
- **Build:** Vite 7

## Folder structure

```
src/
├── components/
│   ├── brand/          # Logo and brand primitives
│   ├── layout/         # AppSidebar, AppTopbar, PageHeader, StatCard, EmptyState
│   └── ui/             # shadcn/ui primitives
├── hooks/              # use-auth, use-mobile
├── integrations/
│   ├── lovable/        # Managed OAuth wrapper (auto-generated)
│   └── supabase/       # Client / server / auth middleware (auto-generated)
├── lib/                # utils, error reporting
├── routes/
│   ├── __root.tsx      # Root layout, providers, head metadata
│   ├── index.tsx       # Marketing landing
│   ├── auth.tsx        # Sign in / sign up / forgot
│   ├── reset-password.tsx
│   └── _authenticated/ # Protected app subtree
│       ├── route.tsx   # Sidebar + topbar shell + auth gate
│       ├── dashboard.tsx
│       ├── knowledge.tsx
│       ├── departments.tsx
│       ├── workflows.tsx
│       ├── memory.tsx
│       ├── tasks.tsx
│       ├── profile.tsx
│       └── settings.tsx
├── styles.css          # Design tokens
└── router.tsx          # Router bootstrap
docs/                   # Architecture, product, security docs
```

## Getting started

```bash
bun install
bun run dev
```

The app runs on http://localhost:8080.

## Environment variables

Client (safe for the browser):

| Variable | Purpose |
| --- | --- |
| `VITE_SUPABASE_URL` | Cloud project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Anon/publishable API key |
| `VITE_SUPABASE_PROJECT_ID` | Project ref |

Server (never exposed to the browser):

| Variable | Purpose |
| --- | --- |
| `SUPABASE_URL` | Cloud project URL |
| `SUPABASE_PUBLISHABLE_KEY` | Anon key for server-side use |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin key for privileged server operations |

All variables are managed by Lovable Cloud — you don't need to set them manually in local development.

## Project architecture

At a high level:

- The browser talks to TanStack Start (SSR + server functions on Cloudflare Workers).
- Server functions talk to Cloud (Postgres, Auth, Storage) with RLS enforced.
- Public routes render freely; the `_authenticated` subtree requires a live session.

See [`docs/SYSTEM_ARCHITECTURE.md`](docs/SYSTEM_ARCHITECTURE.md) and [`docs/diagrams/`](docs/diagrams/) for detail.

## Development workflow

1. Create a route file under `src/routes/`.
2. If it must require sign-in, put it under `src/routes/_authenticated/`.
3. Add navigation entries in `src/components/layout/AppSidebar.tsx`.
4. Add reusable UI to `src/components/layout/` or `src/components/ui/`.
5. Use semantic design tokens — never hardcode colors.

## Future roadmap

See [`docs/ROADMAP.md`](docs/ROADMAP.md).

## Contributing

See [`docs/CONTRIBUTING.md`](docs/CONTRIBUTING.md).

## License

TBD — to be finalized before Phase 2 launch.
