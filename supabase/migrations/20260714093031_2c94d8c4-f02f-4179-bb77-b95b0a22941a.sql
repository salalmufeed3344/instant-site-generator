
-- =========================================================
-- Phase 3: Qwen Intelligence — structured knowledge tables
-- =========================================================

-- ---------- document_analysis ----------
CREATE TABLE public.document_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  document_id uuid NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending', -- pending|running|completed|failed
  stage text,
  progress int NOT NULL DEFAULT 0,
  summary text,
  confidence numeric,
  model text,
  tokens_used int,
  warnings jsonb NOT NULL DEFAULT '[]'::jsonb,
  error text,
  result jsonb, -- full structured extraction
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.document_analysis TO authenticated;
GRANT ALL ON public.document_analysis TO service_role;
ALTER TABLE public.document_analysis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org members read analysis" ON public.document_analysis FOR SELECT TO authenticated
  USING (organization_id = public.current_user_organization_id());
CREATE POLICY "org members write analysis" ON public.document_analysis FOR ALL TO authenticated
  USING (organization_id = public.current_user_organization_id())
  WITH CHECK (organization_id = public.current_user_organization_id());
CREATE TRIGGER trg_document_analysis_updated_at BEFORE UPDATE ON public.document_analysis
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_document_analysis_org ON public.document_analysis(organization_id);
CREATE INDEX idx_document_analysis_document ON public.document_analysis(document_id);

-- ---------- policies ----------
CREATE TABLE public.policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  source_document_id uuid REFERENCES public.documents(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  category text,
  rules jsonb NOT NULL DEFAULT '[]'::jsonb,
  confidence numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.policies TO authenticated;
GRANT ALL ON public.policies TO service_role;
ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org members read policies" ON public.policies FOR SELECT TO authenticated
  USING (organization_id = public.current_user_organization_id());
CREATE POLICY "org members write policies" ON public.policies FOR ALL TO authenticated
  USING (organization_id = public.current_user_organization_id())
  WITH CHECK (organization_id = public.current_user_organization_id());
CREATE TRIGGER trg_policies_updated_at BEFORE UPDATE ON public.policies
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_policies_org ON public.policies(organization_id);

-- ---------- roles ----------
CREATE TABLE public.roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  source_document_id uuid REFERENCES public.documents(id) ON DELETE SET NULL,
  department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  responsibilities jsonb NOT NULL DEFAULT '[]'::jsonb,
  confidence numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.roles TO authenticated;
GRANT ALL ON public.roles TO service_role;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org members read roles" ON public.roles FOR SELECT TO authenticated
  USING (organization_id = public.current_user_organization_id());
CREATE POLICY "org members write roles" ON public.roles FOR ALL TO authenticated
  USING (organization_id = public.current_user_organization_id())
  WITH CHECK (organization_id = public.current_user_organization_id());
CREATE TRIGGER trg_roles_updated_at BEFORE UPDATE ON public.roles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_roles_org ON public.roles(organization_id);

-- ---------- processes ----------
CREATE TABLE public.processes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  source_document_id uuid REFERENCES public.documents(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  steps jsonb NOT NULL DEFAULT '[]'::jsonb,
  triggers jsonb NOT NULL DEFAULT '[]'::jsonb,
  outputs jsonb NOT NULL DEFAULT '[]'::jsonb,
  confidence numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.processes TO authenticated;
GRANT ALL ON public.processes TO service_role;
ALTER TABLE public.processes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org members read processes" ON public.processes FOR SELECT TO authenticated
  USING (organization_id = public.current_user_organization_id());
CREATE POLICY "org members write processes" ON public.processes FOR ALL TO authenticated
  USING (organization_id = public.current_user_organization_id())
  WITH CHECK (organization_id = public.current_user_organization_id());
CREATE TRIGGER trg_processes_updated_at BEFORE UPDATE ON public.processes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_processes_org ON public.processes(organization_id);

-- ---------- approval_chains ----------
CREATE TABLE public.approval_chains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  source_document_id uuid REFERENCES public.documents(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  steps jsonb NOT NULL DEFAULT '[]'::jsonb,
  confidence numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.approval_chains TO authenticated;
GRANT ALL ON public.approval_chains TO service_role;
ALTER TABLE public.approval_chains ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org members read approvals" ON public.approval_chains FOR SELECT TO authenticated
  USING (organization_id = public.current_user_organization_id());
CREATE POLICY "org members write approvals" ON public.approval_chains FOR ALL TO authenticated
  USING (organization_id = public.current_user_organization_id())
  WITH CHECK (organization_id = public.current_user_organization_id());
CREATE TRIGGER trg_approval_chains_updated_at BEFORE UPDATE ON public.approval_chains
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_approval_chains_org ON public.approval_chains(organization_id);

-- ---------- knowledge_entities ----------
CREATE TABLE public.knowledge_entities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  source_document_id uuid REFERENCES public.documents(id) ON DELETE SET NULL,
  entity_type text NOT NULL, -- department|role|policy|process|contact|tool|term|risk|compliance|date
  name text NOT NULL,
  description text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  confidence numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.knowledge_entities TO authenticated;
GRANT ALL ON public.knowledge_entities TO service_role;
ALTER TABLE public.knowledge_entities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org members read entities" ON public.knowledge_entities FOR SELECT TO authenticated
  USING (organization_id = public.current_user_organization_id());
CREATE POLICY "org members write entities" ON public.knowledge_entities FOR ALL TO authenticated
  USING (organization_id = public.current_user_organization_id())
  WITH CHECK (organization_id = public.current_user_organization_id());
CREATE TRIGGER trg_knowledge_entities_updated_at BEFORE UPDATE ON public.knowledge_entities
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_knowledge_entities_org ON public.knowledge_entities(organization_id);
CREATE INDEX idx_knowledge_entities_type ON public.knowledge_entities(entity_type);

-- ---------- knowledge_relationships ----------
CREATE TABLE public.knowledge_relationships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  from_entity_id uuid NOT NULL REFERENCES public.knowledge_entities(id) ON DELETE CASCADE,
  to_entity_id uuid NOT NULL REFERENCES public.knowledge_entities(id) ON DELETE CASCADE,
  relationship_type text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.knowledge_relationships TO authenticated;
GRANT ALL ON public.knowledge_relationships TO service_role;
ALTER TABLE public.knowledge_relationships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org members read relationships" ON public.knowledge_relationships FOR SELECT TO authenticated
  USING (organization_id = public.current_user_organization_id());
CREATE POLICY "org members write relationships" ON public.knowledge_relationships FOR ALL TO authenticated
  USING (organization_id = public.current_user_organization_id())
  WITH CHECK (organization_id = public.current_user_organization_id());
CREATE TRIGGER trg_knowledge_relationships_updated_at BEFORE UPDATE ON public.knowledge_relationships
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_knowledge_relationships_org ON public.knowledge_relationships(organization_id);

-- ---------- analysis_logs ----------
CREATE TABLE public.analysis_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  analysis_id uuid REFERENCES public.document_analysis(id) ON DELETE CASCADE,
  level text NOT NULL DEFAULT 'info', -- info|warn|error
  stage text,
  message text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.analysis_logs TO authenticated;
GRANT ALL ON public.analysis_logs TO service_role;
ALTER TABLE public.analysis_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org members read logs" ON public.analysis_logs FOR SELECT TO authenticated
  USING (organization_id = public.current_user_organization_id());
CREATE POLICY "org members write logs" ON public.analysis_logs FOR ALL TO authenticated
  USING (organization_id = public.current_user_organization_id())
  WITH CHECK (organization_id = public.current_user_organization_id());
CREATE INDEX idx_analysis_logs_analysis ON public.analysis_logs(analysis_id);
