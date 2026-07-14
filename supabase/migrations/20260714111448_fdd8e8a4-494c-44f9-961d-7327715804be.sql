ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS created_by uuid DEFAULT auth.uid();

DROP POLICY IF EXISTS "Authenticated users can create organizations" ON public.organizations;
CREATE POLICY "Authenticated users can create organizations"
  ON public.organizations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL AND created_by = auth.uid());

DROP POLICY IF EXISTS "Creators can view created organizations" ON public.organizations;
CREATE POLICY "Creators can view created organizations"
  ON public.organizations
  FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

CREATE OR REPLACE FUNCTION public.handle_new_organization()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NOT NULL THEN
    UPDATE public.profiles
      SET organization_id = NEW.id,
          role = 'owner'
    WHERE id = auth.uid()
      AND organization_id IS NULL;
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_organization() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_new_organization() FROM anon;
REVOKE ALL ON FUNCTION public.handle_new_organization() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_organization() TO service_role;