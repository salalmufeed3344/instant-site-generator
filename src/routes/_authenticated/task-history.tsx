import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { History, Search } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/layout/EmptyState";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/task-history")({
  component: TaskHistory,
});

type Row = {
  id: string;
  title: string;
  status: string;
  confidence: number | null;
  created_at: string;
  approval_status: string | null;
  requires_approval: boolean;
  departments: string[];
};

function TaskHistory() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");

  useEffect(() => {
    (async () => {
      const { data: tasks } = await supabase
        .from("tasks")
        .select(
          "id, title, status, confidence, created_at, approval_status, requires_approval",
        )
        .order("created_at", { ascending: false })
        .limit(100);
      const ids = (tasks ?? []).map((t: { id: string }) => t.id);
      let deptMap: Record<string, string[]> = {};
      if (ids.length) {
        const { data: execs } = await supabase
          .from("task_executions")
          .select("task_id, department_name, order_index")
          .in("task_id", ids)
          .order("order_index");
        for (const e of (execs ?? []) as Array<{
          task_id: string;
          department_name: string | null;
        }>) {
          if (!e.department_name) continue;
          (deptMap[e.task_id] ||= []).push(e.department_name);
        }
      }
      setRows(
        ((tasks as Omit<Row, "departments">[]) ?? []).map((t) => ({
          ...t,
          departments: deptMap[t.id] ?? [],
        })),
      );
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    const needle = q.toLowerCase().trim();
    return rows.filter((r) => {
      if (status !== "all" && r.status !== status) return false;
      if (!needle) return true;
      return (
        r.title.toLowerCase().includes(needle) ||
        r.departments.some((d) => d.toLowerCase().includes(needle))
      );
    });
  }, [rows, q, status]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Task History"
        description="Every task, the departments that participated, and their outcome."
      />

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Search tasks or departments..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="running">Running</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <Skeleton className="h-64" />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={History}
          title="No tasks yet"
          description="Submit a task from the AI Task Center to see history here."
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <ul className="divide-y">
              {filtered.map((r) => (
                <li key={r.id}>
                  <Link
                    to="/ai-tasks/$taskId"
                    params={{ taskId: r.id }}
                    className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-accent/50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{r.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(r.created_at).toLocaleString()} ·{" "}
                        {r.departments.length
                          ? r.departments.join(" → ")
                          : "no departments"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {r.requires_approval ? (
                        <Badge variant="outline">
                          Approval {r.approval_status ?? "required"}
                        </Badge>
                      ) : null}
                      <span className="text-xs text-muted-foreground">
                        {r.confidence != null
                          ? `${((r.confidence ?? 0) * 100).toFixed(0)}%`
                          : "—"}
                      </span>
                      <Badge
                        variant={
                          r.status === "completed"
                            ? "default"
                            : r.status === "failed"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {r.status}
                      </Badge>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
