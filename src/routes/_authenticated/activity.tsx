import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Activity, Bot, Brain, FileText, ListChecks, Search, Shield, Workflow } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/activity")({
  component: ActivityCenter,
});

const FILTERS = [
  { key: "all", label: "All" },
  { key: "document", label: "Documents" },
  { key: "department", label: "Departments" },
  { key: "policy", label: "Policies" },
  { key: "process", label: "Processes" },
  { key: "task", label: "Tasks" },
  { key: "memory", label: "Memory" },
] as const;

type FilterKey = (typeof FILTERS)[number]["key"];

const ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  document: FileText,
  department: Bot,
  policy: Shield,
  process: Workflow,
  task: ListChecks,
  memory: Brain,
  default: Activity,
};

function useActivity() {
  return useQuery({
    queryKey: ["activity"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");
      const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", userData.user.id)
        .maybeSingle();
      const orgId = profile?.organization_id;
      if (!orgId) return [];
      const { data } = await supabase
        .from("timeline_events")
        .select("id, title, event_type, occurred_at, metadata")
        .eq("organization_id", orgId)
        .order("occurred_at", { ascending: false })
        .limit(100);
      return data ?? [];
    },
  });
}

function ActivityCenter() {
  const { data, isLoading } = useActivity();
  const [filter, setFilter] = useState<FilterKey>("all");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    let list = data ?? [];
    if (filter !== "all") {
      list = list.filter((e: any) => (e.event_type ?? "").toLowerCase().includes(filter));
    }
    if (q.trim()) {
      const t = q.trim().toLowerCase();
      list = list.filter((e: any) => e.title?.toLowerCase().includes(t));
    }
    return list;
  }, [data, filter, q]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity Center"
        description="A unified log of everything happening across your CortexOS workspace."
      />

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Filter activity…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex flex-wrap gap-1">
          {FILTERS.map((f) => (
            <Button
              key={f.key}
              variant={filter === f.key ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center text-sm text-muted-foreground">
          No activity matches your filters.
        </div>
      ) : (
        <ol className="relative space-y-3 border-l-2 border-border pl-6">
          {filtered.map((e: any) => {
            const type = (e.event_type ?? "").toLowerCase();
            const key = Object.keys(ICON).find((k) => type.includes(k)) ?? "default";
            const Icon = ICON[key];
            return (
              <li key={e.id} className="relative">
                <span className="absolute -left-[33px] top-3 flex h-5 w-5 items-center justify-center rounded-full border border-border bg-background">
                  <Icon className="h-3 w-3 text-primary" />
                </span>
                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-medium">{e.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {e.occurred_at ? new Date(e.occurred_at).toLocaleString() : ""}
                      </div>
                    </div>
                    <Badge variant="outline">{e.event_type}</Badge>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
