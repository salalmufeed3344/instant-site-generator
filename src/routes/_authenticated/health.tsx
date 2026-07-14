import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Activity, Bot, Brain, FileText, Shield, Sparkles, Workflow } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/health")({
  component: HealthPage,
});

function useHealth() {
  return useQuery({
    queryKey: ["org-health"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");
      const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", userData.user.id)
        .maybeSingle();
      const orgId = profile?.organization_id;
      if (!orgId) return null;

      const [docs, analyzed, depts, pols, procs, mems, tasks] = await Promise.all([
        supabase.from("documents").select("id", { count: "exact", head: true }).eq("organization_id", orgId),
        supabase.from("documents").select("id", { count: "exact", head: true }).eq("organization_id", orgId).eq("status", "analyzed"),
        supabase.from("ai_departments").select("id", { count: "exact", head: true }).eq("organization_id", orgId),
        supabase.from("policies").select("id", { count: "exact", head: true }).eq("organization_id", orgId),
        supabase.from("processes").select("id", { count: "exact", head: true }).eq("organization_id", orgId),
        supabase.from("memory_items").select("id", { count: "exact", head: true }).eq("organization_id", orgId),
        supabase.from("tasks").select("id", { count: "exact", head: true }).eq("organization_id", orgId),
      ]);

      return {
        docs: docs.count ?? 0,
        analyzed: analyzed.count ?? 0,
        depts: depts.count ?? 0,
        pols: pols.count ?? 0,
        procs: procs.count ?? 0,
        mems: mems.count ?? 0,
        tasks: tasks.count ?? 0,
      };
    },
  });
}

function ring(percent: number, color = "hsl(var(--primary))") {
  const pct = Math.max(0, Math.min(100, percent));
  return `conic-gradient(${color} ${pct}%, hsl(var(--muted)) ${pct}% 100%)`;
}

function ScoreRing({ label, percent, hint }: { label: string; percent: number; hint?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-muted-foreground">{label}</div>
        <Sparkles className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="mt-4 flex items-center gap-4">
        <div
          className="relative flex h-20 w-20 items-center justify-center rounded-full"
          style={{ background: ring(percent) }}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-card text-lg font-semibold tabular-nums">
            {Math.round(percent)}%
          </div>
        </div>
        <div className="flex-1 text-xs text-muted-foreground">{hint}</div>
      </div>
    </div>
  );
}

function Bar({ label, value, max, icon: Icon }: { label: string; value: number; max: number; icon: React.ComponentType<{ className?: string }> }) {
  const pct = max === 0 ? 0 : Math.min(100, (value / max) * 100);
  const tone = pct >= 66 ? "bg-success" : pct >= 33 ? "bg-primary" : "bg-destructive";
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 text-muted-foreground">
          <Icon className="h-4 w-4" />
          {label}
        </span>
        <span className="tabular-nums">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full transition-all", tone)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function HealthPage() {
  const { data, isLoading } = useHealth();

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <PageHeader title="Organization Health" description="A composite view of your knowledge & AI readiness." />
        <div className="grid gap-4 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    );
  }

  const docCoverage = data.docs === 0 ? 0 : (data.analyzed / data.docs) * 100;
  const policyCoverage = Math.min(100, data.pols * 10);
  const processCoverage = Math.min(100, data.procs * 10);
  const deptReadiness = Math.min(100, data.depts * 15);
  const memoryHealth = Math.min(100, data.mems * 5);
  const aiReadiness = Math.round((docCoverage + policyCoverage + processCoverage + deptReadiness + memoryHealth) / 5);
  const knowledgeCoverage = Math.round((docCoverage + policyCoverage + processCoverage) / 3);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Organization Health"
        description="Composite readiness of knowledge, memory, and AI workforce."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <ScoreRing label="AI Readiness" percent={aiReadiness} hint="Composite of all signals" />
        <ScoreRing label="Knowledge Coverage" percent={knowledgeCoverage} hint="Docs, policies, processes" />
        <ScoreRing label="Memory Health" percent={memoryHealth} hint="Long-term organizational memory" />
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Signals</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <Bar label="Document Coverage" value={data.analyzed} max={Math.max(1, data.docs)} icon={FileText} />
          <Bar label="Policy Coverage" value={data.pols} max={10} icon={Shield} />
          <Bar label="Process Coverage" value={data.procs} max={10} icon={Workflow} />
          <Bar label="Department Readiness" value={data.depts} max={7} icon={Bot} />
          <Bar label="Memory Items" value={data.mems} max={20} icon={Brain} />
          <Bar label="Task Activity" value={data.tasks} max={20} icon={Activity} />
        </div>
      </div>
    </div>
  );
}
