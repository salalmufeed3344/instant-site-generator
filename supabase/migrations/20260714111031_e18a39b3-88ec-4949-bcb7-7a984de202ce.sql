CREATE SCHEMA IF NOT EXISTS app_private;

REVOKE ALL ON SCHEMA app_private FROM PUBLIC;
REVOKE ALL ON SCHEMA app_private FROM anon;
REVOKE ALL ON SCHEMA app_private FROM authenticated;

CREATE OR REPLACE FUNCTION app_private.current_user_organization_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid()
$$;

REVOKE ALL ON FUNCTION app_private.current_user_organization_id() FROM PUBLIC;
REVOKE ALL ON FUNCTION app_private.current_user_organization_id() FROM anon;
GRANT USAGE ON SCHEMA app_private TO authenticated;
GRANT USAGE ON SCHEMA app_private TO service_role;
GRANT EXECUTE ON FUNCTION app_private.current_user_organization_id() TO authenticated;
GRANT EXECUTE ON FUNCTION app_private.current_user_organization_id() TO service_role;

CREATE OR REPLACE FUNCTION public.current_user_organization_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public, app_private
AS $$
  SELECT app_private.current_user_organization_id()
$$;

GRANT EXECUTE ON FUNCTION public.current_user_organization_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_user_organization_id() TO service_role;