# Database Design — Phase 1

All tables live in the `public` schema. Row-Level Security is enabled on every table.

## `organizations`

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid | PK, `gen_random_uuid()` |
| name | text | required |
| industry | text | nullable |
| company_size | text | nullable |
| created_at | timestamptz | default `now()` |

**Policies**
- SELECT: user's organization only.
- INSERT: any signed-in user.
- UPDATE: members of the organization.

## `profiles`

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid | PK, FK → `auth.users(id)` on delete cascade |
| organization_id | uuid | FK → `organizations(id)` on delete set null |
| full_name | text | nullable |
| role | text | default `'member'` |
| created_at | timestamptz | default `now()` |

**Policies**
- SELECT: self or same-organization members.
- INSERT: self only.
- UPDATE: self only.

**Trigger**
- `on_auth_user_created` on `auth.users` — auto-creates a profile row on signup, seeded with `full_name` from user metadata.

## `documents`

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid | PK |
| organization_id | uuid | FK → `organizations(id)` on delete cascade |
| title | text | required |
| file_url | text | nullable |
| upload_status | text | default `'pending'` |
| created_at | timestamptz | default `now()` |

**Policies**
All CRUD scoped to `organization_id = current_user_organization_id()`.

## Helper functions

- `public.current_user_organization_id()` — SECURITY DEFINER, returns the caller's organization from `profiles`. Used inside RLS policies.
- `public.handle_new_user()` — SECURITY DEFINER trigger that creates a profile on `auth.users` insert.

## TODO — Phase 2

- `departments`, `agents`, `workflows`, `memories`, `tasks`, `document_chunks`, `embeddings`
- `user_roles` table with an `app_role` enum for RBAC
- Audit log tables
