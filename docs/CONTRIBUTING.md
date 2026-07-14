# Contributing

## Ground rules

1. **Foundations before features.** Don't ship a fake agent or placeholder chatbot.
2. **Design tokens only.** No hardcoded colors in components — always use semantic tokens from `src/styles.css`.
3. **Type safety.** Strict TypeScript. No `any` without justification.
4. **Small components.** New files should compose existing primitives in `src/components/layout` and `src/components/ui`.

## Adding a route

1. Public route → `src/routes/<name>.tsx`
2. Authenticated route → `src/routes/_authenticated/<name>.tsx`
3. Add nav entry in `src/components/layout/AppSidebar.tsx`.

## Database changes

Use migrations for schema. Never `SELECT`, `INSERT`, or `UPDATE` data through a migration — those go through the runtime.

Every new `public` table needs:

1. `CREATE TABLE`
2. `GRANT` statements for `authenticated` / `service_role` (and `anon` only if public reads are intended)
3. `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`
4. `CREATE POLICY` for each relevant operation

## Commit style

Small, focused commits. Reference the requirement or docs section being changed.
