
CREATE TABLE public.memory_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  category text NOT NULL,
  title text NOT NULL,
  summary text,
  content text,
  source_type text,
  source_id uuid,
  importance numeric NOT NULL DEFAULT 0.5,
  confidence numeric NOT NULL DEFAULT 0.5,
  tags text[] NOT NULL DEFAULT '{}',
  pinned boolean NOT NULL DEFAULT false,
  reference_count integer NOT NULL DEFAULT 0,
  last_referenced_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.memory_items TO authenticated;
GRANT ALL ON public.memory_items TO service_role;
ALTER TABLE public.memory_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members view memory_items" ON public.memory_items FOR SELECT TO authenticated
  USING (organization_id = public.current_user_organization_id());
CREATE POLICY "Org members manage memory_items" ON public.memory_items FOR ALL TO authenticated
  USING (organization_id = public.current_user_organization_id())
  WITH CHECK (organization_id = public.current_user_organization_id());
CREATE TRIGGER set_memory_items_updated_at BEFORE UPDATE ON public.memory_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_memory_items_org_created ON public.memory_items(organization_id, created_at DESC);
CREATE INDEX idx_memory_items_category ON public.memory_items(organization_id, category);

CREATE TABLE public.memory_relationships (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  from_memory_id uuid NOT NULL REFERENCES public.memory_items(id) ON DELETE CASCADE,
  to_memory_id uuid NOT NULL REFERENCES public.memory_items(id) ON DELETE CASCADE,
  relationship_type text NOT NULL DEFAULT 'related_to',
  weight numeric NOT NULL DEFAULT 1.0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (from_memory_id, to_memory_id, relationship_type)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.memory_relationships TO authenticated;
GRANT ALL ON public.memory_relationships TO service_role;
ALTER TABLE public.memory_relationships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members view memory_relationships" ON public.memory_relationships FOR SELECT TO authenticated
  USING (organization_id = public.current_user_organization_id());
CREATE POLICY "Org members manage memory_relationships" ON public.memory_relationships FOR ALL TO authenticated
  USING (organization_id = public.current_user_organization_id())
  WITH CHECK (organization_id = public.current_user_organization_id());
CREATE INDEX idx_memory_rel_from ON public.memory_relationships(from_memory_id);
CREATE INDEX idx_memory_rel_to ON public.memory_relationships(to_memory_id);

CREATE TABLE public.decision_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  task_id uuid REFERENCES public.tasks(id) ON DELETE SET NULL,
  title text NOT NULL,
  decision text NOT NULL,
  reasoning text,
  referenced_policy_ids uuid[] NOT NULL DEFAULT '{}',
  departments_involved text[] NOT NULL DEFAULT '{}',
  confidence numeric,
  status text NOT NULL DEFAULT 'recorded',
  decided_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.decision_history TO authenticated;
GRANT ALL ON public.decision_history TO service_role;
ALTER TABLE public.decision_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members view decision_history" ON public.decision_history FOR SELECT TO authenticated
  USING (organization_id = public.current_user_organization_id());
CREATE POLICY "Org members manage decision_history" ON public.decision_history FOR ALL TO authenticated
  USING (organization_id = public.current_user_organization_id())
  WITH CHECK (organization_id = public.current_user_organization_id());
CREATE TRIGGER set_decision_history_updated_at BEFORE UPDATE ON public.decision_history
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_decision_history_org_decided ON public.decision_history(organization_id, decided_at DESC);

CREATE TABLE public.memory_tags (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  color text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, name)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.memory_tags TO authenticated;
GRANT ALL ON public.memory_tags TO service_role;
ALTER TABLE public.memory_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members view memory_tags" ON public.memory_tags FOR SELECT TO authenticated
  USING (organization_id = public.current_user_organization_id());
CREATE POLICY "Org members manage memory_tags" ON public.memory_tags FOR ALL TO authenticated
  USING (organization_id = public.current_user_organization_id())
  WITH CHECK (organization_id = public.current_user_organization_id());

CREATE TABLE public.search_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  query text NOT NULL,
  scope text,
  result_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.search_history TO authenticated;
GRANT ALL ON public.search_history TO service_role;
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members view search_history" ON public.search_history FOR SELECT TO authenticated
  USING (organization_id = public.current_user_organization_id());
CREATE POLICY "Org members manage search_history" ON public.search_history FOR ALL TO authenticated
  USING (organization_id = public.current_user_organization_id())
  WITH CHECK (organization_id = public.current_user_organization_id());
CREATE INDEX idx_search_history_org_created ON public.search_history(organization_id, created_at DESC);

CREATE TABLE public.timeline_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  title text NOT NULL,
  description text,
  ref_type text,
  ref_id uuid,
  department_name text,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.timeline_events TO authenticated;
GRANT ALL ON public.timeline_events TO service_role;
ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members view timeline_events" ON public.timeline_events FOR SELECT TO authenticated
  USING (organization_id = public.current_user_organization_id());
CREATE POLICY "Org members manage timeline_events" ON public.timeline_events FOR ALL TO authenticated
  USING (organization_id = public.current_user_organization_id())
  WITH CHECK (organization_id = public.current_user_organization_id());
CREATE INDEX idx_timeline_events_org_occurred ON public.timeline_events(organization_id, occurred_at DESC);
CREATE INDEX idx_timeline_events_dept ON public.timeline_events(organization_id, department_name);

CREATE TABLE public.knowledge_metrics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  metric_key text NOT NULL,
  metric_value numeric NOT NULL DEFAULT 0,
  metric_meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.knowledge_metrics TO authenticated;
GRANT ALL ON public.knowledge_metrics TO service_role;
ALTER TABLE public.knowledge_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members view knowledge_metrics" ON public.knowledge_metrics FOR SELECT TO authenticated
  USING (organization_id = public.current_user_organization_id());
CREATE POLICY "Org members manage knowledge_metrics" ON public.knowledge_metrics FOR ALL TO authenticated
  USING (organization_id = public.current_user_organization_id())
  WITH CHECK (organization_id = public.current_user_organization_id());
CREATE INDEX idx_knowledge_metrics_org_key ON public.knowledge_metrics(organization_id, metric_key, recorded_at DESC);
