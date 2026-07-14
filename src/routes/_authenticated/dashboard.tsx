import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  BookOpen,
  Bot,
  ClipboardList,
  Layers,
  TrendingUp,
  Users,
} from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/layout/StatCard";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

const activity = [
  { title: "Workspace created", meta: "Just now", tone: "success" as const },
  { title: "Profile initialized", meta: "1 min ago", tone: "muted" as const },
  { title: "Knowledge base ready", meta: "2 min ago", tone: "muted" as const },
];

function Dashboard() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="A high-level view of your AI organization."
        actions={
          <>
            <Button variant="outline" size="sm">
              Export
            </Button>
            <Button size="sm">New document</Button>
          </>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Organization health"
          value="98%"
          icon={Activity}
          trend={{ value: "+2%", positive: true }}
          hint="vs last week"
        />
        <StatCard
          label="Documents"
          value="0"
          icon={BookOpen}
          hint="Upload to begin"
        />
        <StatCard
          label="Departments"
          value="0"
          icon={Users}
          hint="Structure your org"
        />
        <StatCard
          label="AI agents"
          value="0"
          icon={Bot}
          hint="Coming in Phase 2"
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Knowledge coverage</h2>
              <p className="text-sm text-muted-foreground">
                How much of your organization is represented in CortexOS.
              </p>
            </div>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>

          <div className="mt-6 space-y-4">
            {[
              { label: "Policies & Playbooks", value: 0 },
              { label: "Product Docs", value: 0 },
              { label: "Meeting Notes", value: 0 },
              { label: "Decisions", value: 0 },
            ].map((row) => (
              <div key={row.label}>
                <div className="mb-1.5 flex justify-between text-xs">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="font-medium text-foreground">{row.value}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${row.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Recent activity</h2>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </div>
          <ul className="mt-4 space-y-3">
            {activity.map((a) => (
              <li key={a.title} className="flex items-start gap-3">
                <span
                  className={
                    a.tone === "success"
                      ? "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-success"
                      : "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/40"
                  }
                />
                <div className="min-w-0">
                  <p className="text-sm text-foreground">{a.title}</p>
                  <p className="text-xs text-muted-foreground">{a.meta}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="rounded-lg border border-dashed border-border bg-card/50 p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Phase 1 · Foundation ready
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Authentication, organizations, profiles, and documents are wired up.
              AI agents, memory, and workflow execution ship in Phase 2.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
