# Security

## Authentication

- Passwords are handled by Lovable Cloud Auth (Supabase GoTrue). CortexOS never stores password hashes directly.
- Sessions live in `localStorage` and rotate automatically.
- Google OAuth uses the Lovable-managed broker; no client secret ships in the codebase.

## Authorization

- Every `public` table has RLS enabled.
- Cross-tenant access is prevented by the `current_user_organization_id()` helper used inside SELECT/INSERT/UPDATE/DELETE policies.
- The `service_role` key is server-only and never imported into route or component code.

## Secrets

- `SUPABASE_SERVICE_ROLE_KEY` is never exposed to the browser.
- Client-visible env is limited to `VITE_*` variables.

## Known Phase 1 limitations

- Role management is a single `role` text column on `profiles`. A dedicated `user_roles` table with an `app_role` enum ships in Phase 2 before any privilege-gated features.
- No audit log yet.
- No leaked-password check (HIBP) enabled by default. Recommended to enable in Cloud Auth settings before production.

## Reporting a vulnerability

Send details to `security@` your workspace domain (placeholder — set a real address before publishing).
