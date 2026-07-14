
-- Extend organizations
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS timezone text,
  ADD COLUMN IF NOT EXISTS logo_url text,
  ADD COLUMN IF NOT EXISTS mission text,
  ADD COLUMN IF NOT EXISTS vision text,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS website text,
  ADD COLUMN IF NOT EXISTS contact_email text,
  ADD COLUMN IF NOT EXISTS setup_method text,
  ADD COLUMN IF NOT EXISTS setup_completed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- Extend documents
ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS mime_type text,
  ADD COLUMN IF NOT EXISTS file_size bigint,
  ADD COLUMN IF NOT EXISTS storage_path text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- Shared updated_at trigger fn
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_orgs_updated ON public.organizations;
CREATE TRIGGER trg_orgs_updated BEFORE UPDATE ON public.organizations
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_documents_updated ON public.documents;
CREATE TRIGGER trg_documents_updated BEFORE UPDATE ON public.documents
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- departments
CREATE TABLE IF NOT EXISTS public.departments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_departments_org ON public.departments(organization_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.departments TO authenticated;
GRANT ALL ON public.departments TO service_role;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members view departments" ON public.departments FOR SELECT TO authenticated
  USING (organization_id = public.current_user_organization_id());
CREATE POLICY "Org members insert departments" ON public.departments FOR INSERT TO authenticated
  WITH CHECK (organization_id = public.current_user_organization_id());
CREATE POLICY "Org members update departments" ON public.departments FOR UPDATE TO authenticated
  USING (organization_id = public.current_user_organization_id())
  WITH CHECK (organization_id = public.current_user_organization_id());
CREATE POLICY "Org members delete departments" ON public.departments FOR DELETE TO authenticated
  USING (organization_id = public.current_user_organization_id());
CREATE TRIGGER trg_departments_updated BEFORE UPDATE ON public.departments
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- interview_answers
CREATE TABLE IF NOT EXISTS public.interview_answers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  question_key text NOT NULL,
  question text NOT NULL,
  answer text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, question_key)
);
CREATE INDEX IF NOT EXISTS idx_interview_org ON public.interview_answers(organization_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.interview_answers TO authenticated;
GRANT ALL ON public.interview_answers TO service_role;
ALTER TABLE public.interview_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members view interview" ON public.interview_answers FOR SELECT TO authenticated
  USING (organization_id = public.current_user_organization_id());
CREATE POLICY "Org members insert interview" ON public.interview_answers FOR INSERT TO authenticated
  WITH CHECK (organization_id = public.current_user_organization_id());
CREATE POLICY "Org members update interview" ON public.interview_answers FOR UPDATE TO authenticated
  USING (organization_id = public.current_user_organization_id())
  WITH CHECK (organization_id = public.current_user_organization_id());
CREATE POLICY "Org members delete interview" ON public.interview_answers FOR DELETE TO authenticated
  USING (organization_id = public.current_user_organization_id());
CREATE TRIGGER trg_interview_updated BEFORE UPDATE ON public.interview_answers
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- knowledge_sources
CREATE TABLE IF NOT EXISTS public.knowledge_sources (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title text NOT NULL,
  category text NOT NULL DEFAULT 'document',
  status text NOT NULL DEFAULT 'ready',
  reference_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ks_org ON public.knowledge_sources(organization_id);
CREATE INDEX IF NOT EXISTS idx_ks_category ON public.knowledge_sources(category);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.knowledge_sources TO authenticated;
GRANT ALL ON public.knowledge_sources TO service_role;
ALTER TABLE public.knowledge_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members view ks" ON public.knowledge_sources FOR SELECT TO authenticated
  USING (organization_id = public.current_user_organization_id());
CREATE POLICY "Org members insert ks" ON public.knowledge_sources FOR INSERT TO authenticated
  WITH CHECK (organization_id = public.current_user_organization_id());
CREATE POLICY "Org members update ks" ON public.knowledge_sources FOR UPDATE TO authenticated
  USING (organization_id = public.current_user_organization_id())
  WITH CHECK (organization_id = public.current_user_organization_id());
CREATE POLICY "Org members delete ks" ON public.knowledge_sources FOR DELETE TO authenticated
  USING (organization_id = public.current_user_organization_id());
CREATE TRIGGER trg_ks_updated BEFORE UPDATE ON public.knowledge_sources
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- organization_templates
CREATE TABLE IF NOT EXISTS public.organization_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  template_key text NOT NULL,
  template_name text NOT NULL,
  applied_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ot_org ON public.organization_templates(organization_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.organization_templates TO authenticated;
GRANT ALL ON public.organization_templates TO service_role;
ALTER TABLE public.organization_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members view ot" ON public.organization_templates FOR SELECT TO authenticated
  USING (organization_id = public.current_user_organization_id());
CREATE POLICY "Org members insert ot" ON public.organization_templates FOR INSERT TO authenticated
  WITH CHECK (organization_id = public.current_user_organization_id());
CREATE POLICY "Org members update ot" ON public.organization_templates FOR UPDATE TO authenticated
  USING (organization_id = public.current_user_organization_id())
  WITH CHECK (organization_id = public.current_user_organization_id());
CREATE POLICY "Org members delete ot" ON public.organization_templates FOR DELETE TO authenticated
  USING (organization_id = public.current_user_organization_id());
CREATE TRIGGER trg_ot_updated BEFORE UPDATE ON public.organization_templates
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Storage policies for company-documents bucket (bucket created separately)
CREATE POLICY "Org members view company docs" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'company-documents'
    AND (storage.foldername(name))[1] = public.current_user_organization_id()::text);
CREATE POLICY "Org members upload company docs" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'company-documents'
    AND (storage.foldername(name))[1] = public.current_user_organization_id()::text);
CREATE POLICY "Org members update company docs" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'company-documents'
    AND (storage.foldername(name))[1] = public.current_user_organization_id()::text);
CREATE POLICY "Org members delete company docs" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'company-documents'
    AND (storage.foldername(name))[1] = public.current_user_organization_id()::text);
