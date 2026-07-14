# API Reference — Phase 1

Phase 1 does not expose any custom HTTP API surface. All data access happens through the Lovable Cloud client (`@/integrations/supabase/client`) with RLS enforcing tenancy.

## Client-side reads

```ts
import { supabase } from "@/integrations/supabase/client";

const { data, error } = await supabase
  .from("documents")
  .select("id, title, upload_status, created_at")
  .order("created_at", { ascending: false });
```

RLS restricts the result to the caller's organization.

## Auth surface

Provided by `supabase.auth.*`:

- `signUp({ email, password, options })`
- `signInWithPassword({ email, password })`
- `resetPasswordForEmail(email, { redirectTo })`
- `updateUser({ password })`
- `signOut()`
- `onAuthStateChange(callback)`

Google sign-in goes through the managed wrapper:

```ts
import { lovable } from "@/integrations/lovable";
await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
```

## TODO — Phase 2

- `createServerFn` endpoints for document ingestion, agent execution, workflow runs
- Public webhook routes under `src/routes/api/public/*`
- OpenAPI spec generated from server functions
