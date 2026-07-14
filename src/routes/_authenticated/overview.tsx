import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  BookOpen,
  Bot,
  Brain,
  FileText,
  ListChecks,
  Shield,
  Sparkles,
  Workflow,
} from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/layout/StatCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/overview")({
  component: OverviewPage,
});

function useOverviewData() {
  return useQuery({
    queryKey: ["overview"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");
      const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id, organizations(name, industry, size)")
        .eq("id", userData.user.id)
        .maybeSingle();
      const orgId = profile?.organization_id;
      if (!orgId) return null;

      const [docs, depts, pols, procs, tasks, mems, timeline] = await Promise.all([
        supabase.from("documents").select("id, title, created_at, upload_status", { count: "exact" }).eq("organization_id", orgId).order("created_at", { ascending: false }).limit(5),
        supabase.from("ai_departments").select("id, name, slug, status", { count: "exact" }).eq("organization_id", orgId),
        supabase.from("policies").select("id", { count: "exact", head: true }).eq("organization_id", orgId),
        supabase.from("processes").select("id", { count: "exact", head: true }).eq("organization_id", orgId),
        supabase.from("tasks").select("id, title, status, created_at").eq("organization_id", orgId).order("created_at", { ascending: false }).limit(5),
        supabase.from("memory_items").select("id", { count: "exact", head: true }).eq("organization_id", orgId),
        supabase.from("timeline_events").select("id, title, event_type, occurred_at").eq("organization_id", orgId).order("occurred_at", { ascending: false }).limit(6),
      ]);

      const org = (profile as any)?.organizations ?? null;
      const docCount = docs.count ?? 0;
      const deptCount = depts.count ?? 0;
      const polCount = pols.count ?? 0;
      const procCount = procs.count ?? 0;
      const memCount = mems.count ?? 0;

      const score = Math.min(
        100,
        (docCount > 0 ? 20 : 0) +
          (deptCount > 0 ? 20 : 0) +
          (polCount > 0 ? 20 : 0) +
          (procCount > 0 ? 20 : 0) +
          (memCount > 0 ? 20 : 0),
      );

      return {
        org,
        docCount,
        deptCount,
        polCount,
        procCount,
        memCount,
        score,
        recentDocs: docs.data ?? [],
        depts: depts.data ?? [],
        recentTasks: tasks.data ?? [],
        timeline: timeline.data ?? [],
      };
    },
  });
}

function OverviewPage() {
  const { data, isLoading } = useOverviewData();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-background to-background p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Badge variant="secondary" className="mb-2">Organization Overview</Badge>
            <h1 className="text-3xl font-semibold tracking-tight">
              {data.org?.name ?? "Your Organization"}
            </h1>
            <p className="mt-1 max-w-2xl text-muted-foreground">
              {data.org?.industry ? `${data.org.industry} · ` : ""}
              {data.org?.size ?? "Enterprise"} · Powered by CortexOS Intelligence
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild size="sm">
                <Link to="/ai-tasks">Ask AI Workforce</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link to="/knowledge">Manage Knowledge</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link to="/health">Health Dashboard</Link>
              </Button>
            </div>
          </div>
          <div className="rounded-xl border border-border/50 bg-card/60 p-4 text-center backdrop-blur">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Knowledge Score</div>
            <div className="mt-1 text-4xl font-semibold tabular-nums text-primary">{data.score}</div>
            <div className="mt-2 h-1.5 w-32 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${data.score}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Documents" value={data.docCount} icon={FileText} hint="ingested" />
        <StatCard label="AI Departments" value={data.deptCount} icon={Bot} hint="ready" />
        <StatCard label="Policies" value={data.polCount} icon={Shield} hint="extracted" />
        <StatCard label="Processes" value={data.procCount} icon={Workflow} hint="mapped" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Memory Items" value={data.memCount} icon={Brain} hint="in graph" />
        <StatCard label="Recent Tasks" value={data.recentTasks.length} icon={ListChecks} hint="last activity" />
        <StatCard label="Knowledge Sources" value={data.docCount} icon={BookOpen} hint="active" />
        <StatCard label="AI Readiness" value={`${data.score}%`} icon={Sparkles} hint="composite" />
      </div>

      {/* AI Workforce Status */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">AI Workforce Status</h2>
          <Button asChild variant="ghost" size="sm">
            <Link to="/ai-departments">View all</Link>
          </Button>
        </div>
        {data.depts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No AI departments yet. <Link to="/ai-departments" className="text-primary underline">Seed defaults</Link>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.depts.slice(0, 6).map((d: any) => (
              <Link
                key={d.id}
                to="/ai-departments/$slug"
                params={{ slug: d.slug }}
                className="group rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{d.name}</div>
                      <div className="text-xs text-muted-foreground capitalize">{d.status ?? "ready"}</div>
                    </div>
                  </div>
                  <span className="h-2 w-2 rounded-full bg-success" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Recent Activity */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-lg font-semibold">Recent Documents</h2>
          {data.recentDocs.length === 0 ? (
            <p className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">No documents uploaded yet.</p>
          ) : (
            <ul className="divide-y divide-border rounded-xl border border-border bg-card">
              {data.recentDocs.map((d: any) => (
                <li key={d.id} className="flex items-center gap-3 px-4 py-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <Link to="/documents/$documentId" params={{ documentId: d.id }} className="flex-1 truncate text-sm hover:underline">
                    {d.title}
                  </Link>
                  <Badge variant="outline" className="capitalize">{d.upload_status ?? "ready"}</Badge>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <h2 className="mb-3 text-lg font-semibold">Activity</h2>
          {data.timeline.length === 0 ? (
            <p className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">Activity will appear here.</p>
          ) : (
            <ul className="space-y-2">
              {data.timeline.map((t: any) => (
                <li key={t.id} className="flex items-start gap-2 rounded-lg border border-border bg-card p-3">
                  <Activity className="mt-0.5 h-4 w-4 text-primary" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{t.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {t.event_type} · {t.occurred_at ? new Date(t.occurred_at).toLocaleString() : ""}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
