import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Send, History, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { runTask } from "@/lib/ai-workforce.functions";

export const Route = createFileRoute("/_authenticated/ai-tasks")({
  component: AiTasksPage,
});

const SUGGESTIONS = [
  "How should leave requests be approved?",
  "Summarize our onboarding process.",
  "Who approves software purchases?",
  "Explain our expense reimbursement policy.",
];

function AiTasksPage() {
  const [title, setTitle] = useState("");
  const [request, setRequest] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [recent, setRecent] = useState<
    Array<{ id: string; title: string; status: string; created_at: string }>
  >([]);
  const run = useServerFn(runTask);
  const navigate = useNavigate();

  const loadRecent = async () => {
    const { data } = await supabase
      .from("tasks")
      .select("id, title, status, created_at")
      .order("created_at", { ascending: false })
      .limit(5);
    setRecent((data as typeof recent) ?? []);
  };
  useEffect(() => {
    void loadRecent();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!request.trim()) return;
    setSubmitting(true);
    try {
      const r = await run({
        data: {
          title: title.trim() || request.trim().slice(0, 80),
          request: request.trim(),
        },
      });
      toast.success(r.ok ? "Task complete" : "Task finished with issues");
      navigate({ to: "/ai-tasks/$taskId", params: { taskId: r.taskId } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to run task");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="AI Task Center"
        description="Submit business tasks. CortexOS routes them to the right AI departments."
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link to="/task-history">
              <History className="mr-1.5 h-4 w-4" />
              History
            </Link>
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">New task</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Title (optional)</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Software purchase approval"
                maxLength={200}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="request">Request</Label>
              <Textarea
                id="request"
                value={request}
                onChange={(e) => setRequest(e.target.value)}
                placeholder="Describe the business question or task..."
                rows={4}
                required
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRequest(s)}
                  className="rounded-full border px-3 py-1 text-xs text-muted-foreground hover:bg-accent"
                >
                  <Sparkles className="mr-1 inline h-3 w-3" />
                  {s}
                </button>
              ))}
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={submitting || !request.trim()}>
                <Send className="mr-1.5 h-4 w-4" />
                {submitting ? "Routing..." : "Submit"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent tasks</CardTitle>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tasks yet.</p>
          ) : (
            <ul className="divide-y">
              {recent.map((t) => (
                <li key={t.id} className="flex items-center justify-between py-2.5">
                  <div className="min-w-0">
                    <Link
                      to="/ai-tasks/$taskId"
                      params={{ taskId: t.id }}
                      className="block truncate text-sm font-medium hover:underline"
                    >
                      {t.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {new Date(t.created_at).toLocaleString()}
                    </p>
                  </div>
                  <Badge
                    variant={
                      t.status === "completed"
                        ? "default"
                        : t.status === "failed"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {t.status}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
