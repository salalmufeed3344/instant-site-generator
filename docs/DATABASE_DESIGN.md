# Database Design — Phase 2

All tables live in the `public` schema. RLS is enabled everywhere and scoped by `public.current_user_organization_id()`.

## Core tables

### `organizations`
Phase 1 columns plus (Phase 2): `country`, `timezone`, `logo_url`, `mission`, `vision`, `description`, `website`, `contact_email`, `setup_method`, `setup_completed`, `updated_at`.

### `profiles`
Unchanged from Phase 1. Links `auth.users` to an `organization_id`.

### `documents`
Phase 1 columns plus (Phase 2): `mime_type`, `file_size`, `storage_path`, `updated_at`. Files live in Storage bucket `company-documents` under `${organization_id}/…`.

## Phase 2 tables

### `departments`
`name`, `description`. Full CRUD for org members.

### `interview_answers`
`question_key` (unique per org), `question`, `answer`. Populated by the guided interview.

### `knowledge_sources`
`title`, `category` (`document` | `interview` | `template`), `status` (`ready` | `pending` | `archived`), `reference_id`, `metadata` (jsonb).

### `organization_templates`
`template_key`, `template_name`, `applied_at`. Records which industry templates the org applied.

## Helpers & triggers

- `public.current_user_organization_id()` — SECURITY DEFINER, used inside every RLS policy.
- `public.set_updated_at()` — attached via BEFORE UPDATE triggers to all tables with `updated_at`.
- `public.handle_new_user()` — creates a profile row on `auth.users` insert.

## Storage

Bucket: **`company-documents`** (private).
Files organized as `${organization_id}/${uuid}-${filename}`.
Storage RLS mirrors the org scope: only members of the folder's organization can list, upload, update, or delete objects.
