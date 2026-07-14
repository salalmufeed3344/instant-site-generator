import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  ShieldAlert,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { decideApproval } from "@/lib/ai-workforce.functions";

export const Route = createFileRoute("/_authenticated/ai-tasks/$taskId")({
  component: TaskDetail,
});

type Task = {
  id: string;
  title: string;
  request: string;
  status: string;
  final_response: string | null;
  confidence: number | null;
  requires_approval: boolean;
  approval_status: string | null;
  created_at: string;
};
type Step = { id: string; stage: string; message: string | null; order_index: number };
type Execution = {
  id: string;
  department_name: string | null;
  reason: string | null;
  response: string | null;
  confidence: number | null;
  order_index: number;
  duration_ms: number | null;
};
type Source = { id: string; source_type: string; title: string | null; snippet: string | null };
type Approval = {
  id: string;
  status: string;
  reason: string | null;
  approver_role: string | null;
};

function TaskDetail() {
  const { taskId } = useParams({ from: "/_authenticated/ai-tasks/$taskId" });
  const [task, setTask] = useState<Task | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [execs, setExecs] = useState<Execution[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const decide = useServerFn(decideApproval);

  const load = async () => {
    const [t, s, e, so, a] = await Promise.all([
      supabase.from("tasks").select("*").eq("id", taskId).maybeSingle(),
      supabase
        .from("task_steps")
        .select("id, stage, message, order_index")
        .eq("task_id", taskId)
        .order("order_index"),
      supabase
        .from("task_executions")
        .select("id, department_name, reason, response, confidence, order_index, duration_ms")
        .eq("task_id", taskId)
        .order("order_index"),
      supabase
        .from("task_sources")
        .select("id, source_type, title, snippet")
        .eq("task_id", taskId),
      supabase
        .from("approvals")
        .select("id, status, reason, approver_role")
        .eq("task_id", taskId),
    ]);
    setTask((t.data as Task) ?? null);
    setSteps((s.data as Step[]) ?? []);
    setExecs((e.data as Execution[]) ?? []);
    setSources((so.data as Source[]) ?? []);
    setApprovals((a.data as Approval[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    void load();
    const t = setInterval(() => {
      if (task && (task.status === "completed" || task.status === "failed")) return;
      void load();
    }, 2000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId, task?.status]);

  const onDecide = async (approvalId: string, decision: "approved" | "rejected") => {
    try {
      await decide({ data: { approvalId, decision } });
      toast.success(`Marked as ${decision}`);
      void load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  if (loading) return <Skeleton className="h-96" />;
  if (!task)
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/ai-tasks">
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
          </Link>
        </Button>
        <p className="text-muted-foreground">Task not found.</p>
      </div>
    );

  const conf = task.confidence ?? 0;

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link to="/ai-tasks">
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Task Center
        </Link>
      </Button>

      <PageHeader
        title={task.title}
        description={task.request}
        actions={
          <div className="flex gap-2">
            <Badge
              variant={
                task.status === "completed"
                  ? "default"
                  : task.status === "failed"
                    ? "destructive"
                    : "secondary"
              }
            >
              {task.status}
            </Badge>
            {task.requires_approval ? (
              <Badge variant="outline">
                <ShieldAlert className="mr-1 h-3 w-3" />
                Approval {task.approval_status ?? "required"}
              </Badge>
            ) : null}
          </div>
        }
      />

      {/* Orchestration timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Orchestration</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2">
            {steps.map((s) => (
              <li key={s.id} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">{s.stage}</p>
                  {s.message ? (
                    <p className="text-xs text-muted-foreground">{s.message}</p>
                  ) : null}
                </div>
              </li>
            ))}
            {task.status === "running" && (
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 animate-pulse" />
                Working...
              </li>
            )}
          </ol>
        </CardContent>
      </Card>

      {/* Department chain */}
      {execs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Department chain</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {execs.map((e, i) => (
                <span key={e.id} className="flex items-center gap-2">
                  <Badge variant="secondary">{e.department_name}</Badge>
                  {i < execs.length - 1 && (
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  )}
                </span>
              ))}
            </div>
            <div className="space-y-4">
              {execs.map((e) => (
                <div key={e.id} className="rounded-md border p-3">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{e.department_name}</p>
                    <span className="text-xs text-muted-foreground">
                      {((e.confidence ?? 0) * 100).toFixed(0)}% ·{" "}
                      {e.duration_ms ? `${e.duration_ms}ms` : "—"}
                    </span>
                  </div>
                  {e.reason ? (
                    <p className="text-xs italic text-muted-foreground">{e.reason}</p>
                  ) : null}
                  <p className="mt-2 whitespace-pre-wrap text-sm">{e.response ?? "—"}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Final response */}
      {task.final_response ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Final response</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="whitespace-pre-wrap text-sm">{task.final_response}</p>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Overall confidence</span>
                <span>{(conf * 100).toFixed(0)}%</span>
              </div>
              <Progress value={conf * 100} />
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Approvals */}
      {approvals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Human approval</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {approvals.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between rounded-md border p-3"
              >
                <div>
                  <p className="text-sm font-medium">
                    Approver: {a.approver_role ?? "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">{a.reason ?? "—"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      a.status === "approved"
                        ? "default"
                        : a.status === "rejected"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {a.status}
                  </Badge>
                  {a.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDecide(a.id, "approved")}
                      >
                        <ThumbsUp className="mr-1 h-3.5 w-3.5" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDecide(a.id, "rejected")}
                      >
                        <ThumbsDown className="mr-1 h-3.5 w-3.5" /> Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Sources */}
      {sources.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Referenced sources</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {sources.map((s) => (
                <li key={s.id} className="flex items-start gap-2 text-sm">
                  <FileText className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      {s.title}{" "}
                      <span className="text-xs text-muted-foreground">
                        ({s.source_type})
                      </span>
                    </p>
                    {s.snippet ? (
                      <p className="text-xs text-muted-foreground">{s.snippet}</p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
