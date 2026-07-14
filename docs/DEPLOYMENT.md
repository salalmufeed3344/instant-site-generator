# Deployment

CortexOS ships on the Lovable-managed TanStack Start runtime backed by Cloudflare Workers, with Lovable Cloud providing Postgres, Auth, and Storage.

## Environments

- **Preview:** every save publishes to `project--<project-id>-dev.lovable.app`.
- **Production:** `project--<project-id>.lovable.app` after publish.

Both URLs are stable and safe to configure into external services.

## Publishing

Use the Publish action in the Lovable editor. Migrations run against the connected Cloud project automatically.

## Rollback

Revert to a previous version from the version history and re-publish. Database migrations are not automatically rolled back — treat schema changes as forward-only and write compensating migrations if needed.

## TODO — Phase 2

- Custom domain configuration steps
- Staging environment guidance
- Backup / restore playbook
