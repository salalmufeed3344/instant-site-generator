
-- Phase 4: AI Workforce & Agent Orchestration

CREATE TABLE public.ai_departments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  purpose text,
  responsibilities text[] NOT NULL DEFAULT '{}',
  knowledge_source_ids uuid[] NOT NULL DEFAULT '{}',
  policy_ids uuid[] NOT NULL DEFAULT '{}',
  workflows text[] NOT NULL DEFAULT '{}',
  confidence numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  icon text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, slug)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_departments TO authenticated;
GRANT ALL ON public.ai_departments TO service_role;
ALTER TABLE public.ai_departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members view ai_departments" ON public.ai_departments FOR SELECT TO authenticated
  USING (organization_id = public.current_user_organization_id());
CREATE POLICY "Org members manage ai_departments" ON public.ai_departments FOR ALL TO authenticated
  USING (organization_id = public.current_user_organization_id())
  WITH CHECK (organization_id = public.current_user_organization_id());
CREATE TRIGGER set_ai_departments_updated_at BEFORE UPDATE ON public.ai_departments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.department_configs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  department_id uuid NOT NULL REFERENCES public.ai_departments(id) ON DELETE CASCADE,
  system_prompt text NOT NULL DEFAULT '',
  allowed_knowledge_sources text[] NOT NULL DEFAULT '{}',
  allowed_actions text[] NOT NULL DEFAULT '{}',
  escalation_rules jsonb NOT NULL DEFAULT '[]'::jsonb,
  approval_requirements jsonb NOT NULL DEFAULT '[]'::jsonb,
  available_tools text[] NOT NULL DEFAULT '{}',
  model_config jsonb NOT NULL DEFAULT '{"model":"qwen-plus","temperature":0.2}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (department_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.department_configs TO authenticated;
GRANT ALL ON public.department_configs TO service_role;
ALTER TABLE public.department_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members view department_configs" ON public.department_configs FOR SELECT TO authenticated
  USING (organization_id = public.current_user_organization_id());
CREATE POLICY "Org members manage department_configs" ON public.department_configs FOR ALL TO authenticated
  USING (organization_id = public.current_user_organization_id())
  WITH CHECK (organization_id = public.current_user_organization_id());
CREATE TRIGGER set_department_configs_updated_at BEFORE UPDATE ON public.department_configs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  title text NOT NULL,
  request text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  final_response text,
  confidence numeric,
  requires_approval boolean NOT NULL DEFAULT false,
  approval_status text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated;
GRANT ALL ON public.tasks TO service_role;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members view tasks" ON public.tasks FOR SELECT TO authenticated
  USING (organization_id = public.current_user_organization_id());
CREATE POLICY "Org members manage tasks" ON public.tasks FOR ALL TO authenticated
  USING (organization_id = public.current_user_organization_id())
  WITH CHECK (organization_id = public.current_user_organization_id());
CREATE TRIGGER set_tasks_updated_at BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_tasks_org_created ON public.tasks(organization_id, created_at DESC);

CREATE TABLE public.task_executions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  department_id uuid REFERENCES public.ai_departments(id) ON DELETE SET NULL,
  department_name text,
  reason text,
  response text,
  confidence numeric,
  order_index integer NOT NULL DEFAULT 0,
  duration_ms integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.task_executions TO authenticated;
GRANT ALL ON public.task_executions TO service_role;
ALTER TABLE public.task_executions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members view task_executions" ON public.task_executions FOR SELECT TO authenticated
  USING (organization_id = public.current_user_organization_id());
CREATE POLICY "Org members manage task_executions" ON public.task_executions FOR ALL TO authenticated
  USING (organization_id = public.current_user_organization_id())
  WITH CHECK (organization_id = public.current_user_organization_id());
CREATE TRIGGER set_task_executions_updated_at BEFORE UPDATE ON public.task_executions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_task_executions_task ON public.task_executions(task_id, order_index);

CREATE TABLE public.task_steps (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  stage text NOT NULL,
  message text,
  status text NOT NULL DEFAULT 'complete',
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.task_steps TO authenticated;
GRANT ALL ON public.task_steps TO service_role;
ALTER TABLE public.task_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members view task_steps" ON public.task_steps FOR SELECT TO authenticated
  USING (organization_id = public.current_user_organization_id());
CREATE POLICY "Org members manage task_steps" ON public.task_steps FOR ALL TO authenticated
  USING (organization_id = public.current_user_organization_id())
  WITH CHECK (organization_id = public.current_user_organization_id());
CREATE INDEX idx_task_steps_task ON public.task_steps(task_id, order_index);

CREATE TABLE public.task_sources (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  source_type text NOT NULL,
  source_id uuid,
  title text,
  snippet text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.task_sources TO authenticated;
GRANT ALL ON public.task_sources TO service_role;
ALTER TABLE public.task_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members view task_sources" ON public.task_sources FOR SELECT TO authenticated
  USING (organization_id = public.current_user_organization_id());
CREATE POLICY "Org members manage task_sources" ON public.task_sources FOR ALL TO authenticated
  USING (organization_id = public.current_user_organization_id())
  WITH CHECK (organization_id = public.current_user_organization_id());
CREATE INDEX idx_task_sources_task ON public.task_sources(task_id);

CREATE TABLE public.approvals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  approver_role text,
  approver_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reason text,
  status text NOT NULL DEFAULT 'pending',
  decided_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.approvals TO authenticated;
GRANT ALL ON public.approvals TO service_role;
ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members view approvals" ON public.approvals FOR SELECT TO authenticated
  USING (organization_id = public.current_user_organization_id());
CREATE POLICY "Org members manage approvals" ON public.approvals FOR ALL TO authenticated
  USING (organization_id = public.current_user_organization_id())
  WITH CHECK (organization_id = public.current_user_organization_id());
CREATE TRIGGER set_approvals_updated_at BEFORE UPDATE ON public.approvals
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_approvals_task ON public.approvals(task_id);
