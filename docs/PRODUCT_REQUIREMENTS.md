# Product Requirements — Phase 1

Phase 1 delivers the enterprise foundation. Every requirement below is implemented in this codebase.

## R1. Authentication

- R1.1 Users can sign up with email and password.
- R1.2 Users can sign in with email and password.
- R1.3 Users can sign in with Google (managed OAuth).
- R1.4 Users can request a password reset via email.
- R1.5 Users can set a new password from the reset link.
- R1.6 Users can sign out from anywhere in the app.

## R2. Multi-tenancy foundation

- R2.1 `organizations` table exists with name, industry, company_size.
- R2.2 `profiles` table links each user to at most one organization.
- R2.3 A profile row is auto-created when a user signs up.
- R2.4 RLS scopes every table read/write to the current user's organization.

## R3. Knowledge foundation

- R3.1 `documents` table exists with title, file_url, upload_status.
- R3.2 Documents are scoped to the owning organization.

## R4. Application shell

- R4.1 Persistent sidebar with Workspace and Account groups.
- R4.2 Collapsible sidebar with icon-only mode.
- R4.3 Topbar with breadcrumbs, workspace search, and sign-out.
- R4.4 Responsive on mobile.

## R5. Pages

Each page renders with title, description, and either widgets or an empty state:

- R5.1 Dashboard
- R5.2 Knowledge
- R5.3 Departments
- R5.4 Workflows
- R5.5 Memory
- R5.6 Tasks
- R5.7 Profile
- R5.8 Settings

## TODO — Phase 2 requirements

- Document ingestion, chunking, embedding
- Agent authoring and execution
- Workflow builder
- Long-term memory reads/writes
- Role-based access control per department
- Audit log
- Billing
