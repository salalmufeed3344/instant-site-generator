# System Architecture

## High-level

```
┌───────────────────────────┐
│         Browser           │
│  React 19 + TanStack UI   │
└─────────────┬─────────────┘
              │ HTTPS
┌─────────────▼─────────────┐
│   TanStack Start (SSR)    │
│  Server functions, routes │
└─────────────┬─────────────┘
              │
┌─────────────▼─────────────┐
│      Lovable Cloud        │
│  Postgres · Auth · Storage│
└───────────────────────────┘
```

## Runtime

- **Client:** React 19, rendered SSR-first via TanStack Start, hydrated in the browser.
- **Server:** Cloudflare Workers runtime (workerd) with `nodejs_compat`.
- **DB / Auth / Storage:** Managed by Lovable Cloud.

## Routing

File-based via TanStack Router (`src/routes/`).

- Public routes: `/`, `/auth`, `/reset-password`.
- Protected subtree: `src/routes/_authenticated/` gated by a client-only `beforeLoad` that redirects unauthenticated users to `/auth`.

## Data access

- Browser reads/writes use `@/integrations/supabase/client` with the publishable key. RLS enforces org boundaries.
- Server-only privileged operations (Phase 2) will use `@/integrations/supabase/client.server` loaded inside handler bodies.

## Auth

- Email/password + Google OAuth (managed by Lovable Cloud).
- Session persisted in `localStorage`; auth state changes are subscribed once in `__root.tsx` and invalidate the router and query cache.
- Sign-out cancels in-flight queries, clears the cache, signs out, then navigates to `/auth`.

## Security posture

- RLS enabled on every table in `public`.
- Access scoped via the `current_user_organization_id()` SECURITY DEFINER helper.
- Service-role key never reaches the client bundle.

## TODO — Phase 2

- AI agent execution runtime
- Vector search index over documents
- Background jobs for document ingestion
- Realtime channels for live activity
