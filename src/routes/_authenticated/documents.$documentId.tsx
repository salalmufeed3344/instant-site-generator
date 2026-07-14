import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowLeft,
  FileText,
  Loader2,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/layout/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { analyzeDocument } from "@/lib/analyze-document.functions";

export const Route = createFileRoute("/_authenticated/documents/$documentId")({
  component: DocumentInsights,
});

type DocRow = {
  id: string;
  title: string;
  mime_type: string | null;
  file_size: number | null;
  upload_status: string;
  storage_path: string | null;
  created_at: string;
  organization_id: string;
};

type AnalysisRow = {
  id: string;
  status: string;
  stage: string | null;
  progress: number;
  summary: string | null;
  confidence: number | null;
  warnings: unknown;
  error: string | null;
  result: unknown;
  updated_at: string;
};

function DocumentInsights() {
  const { documentId } = Route.useParams();
  const router = useRouter();
  const analyze = useServerFn(analyzeDocument);
  const [doc, setDoc] = useState<DocRow | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  const load = useCallback(async () => {
    const [{ data: d }, { data: a }] = await Promise.all([
      supabase.from("documents").select("*").eq("id", documentId).maybeSingle(),
      supabase
        .from("document_analysis")
        .select("id,status,stage,progress,summary,confidence,warnings,error,result,updated_at")
        .eq("document_id", documentId)
        .maybeSingle(),
    ]);
    setDoc(d as DocRow | null);
    setAnalysis(a as AnalysisRow | null);
    setLoading(false);
  }, [documentId]);

  useEffect(() => {
    void load();
  }, [load]);

  // Poll while running
  useEffect(() => {
    if (analysis?.status !== "running") return;
    const t = setInterval(() => {
      void load();
    }, 2000);
    return () => clearInterval(t);
  }, [analysis?.status, load]);

  const runAnalysis = async () => {
    if (!doc) return;
    setRunning(true);
    try {
      const res = await analyze({ data: { documentId: doc.id } });
      if (res?.ok) toast.success("Analysis complete");
      else toast.warning("Analysis finished with warnings");
      await load();
      router.invalidate();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setRunning(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-40" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!doc) {
    return (
      <EmptyState
        icon={FileText}
        title="Document not found"
        description="It may have been removed or you don't have access."
        action={
          <Button asChild variant="outline" size="sm">
            <Link to="/knowledge"><ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Knowledge Hub</Link>
          </Button>
        }
      />
    );
  }

  const result = (analysis?.result ?? null) as ExtractedResult | null;
  const warnings = Array.isArray(analysis?.warnings) ? (analysis!.warnings as string[]) : [];

  return (
    <div className="space-y-8">
      <PageHeader
        title={doc.title}
        description={`${doc.mime_type ?? "unknown"} · ${formatSize(doc.file_size)} · uploaded ${new Date(doc.created_at).toLocaleDateString()}`}
        actions={
          <>
            <Button asChild variant="outline" size="sm">
              <Link to="/knowledge"><ArrowLeft className="mr-1.5 h-4 w-4" /> Back</Link>
            </Button>
            <Button size="sm" onClick={runAnalysis} disabled={running || analysis?.status === "running"}>
              {running || analysis?.status === "running" ? (
                <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Analyzing</>
              ) : (
                <><RefreshCw className="mr-1.5 h-4 w-4" /> {analysis ? "Re-analyze" : "Analyze"}</>
              )}
            </Button>
          </>
        }
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Analysis</CardTitle>
              <CardDescription>Qwen Cloud converts your document into structured knowledge.</CardDescription>
            </div>
            <StatusBadge status={analysis?.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {analysis?.status === "running" && (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{analysis.stage ?? "Working…"}</span>
                <span className="font-medium">{analysis.progress ?? 0}%</span>
              </div>
              <Progress value={analysis.progress ?? 0} className="h-2" />
            </>
          )}
          {analysis?.status === "completed" && (
            <div className="flex items-center gap-2 text-sm text-success">
              <CheckCircle2 className="h-4 w-4" />
              Completed{" "}
              {typeof analysis.confidence === "number" && (
                <span className="text-muted-foreground">
                  · confidence {Math.round((analysis.confidence ?? 0) * 100)}%
                </span>
              )}
            </div>
          )}
          {analysis?.status === "failed" && (
            <div className="flex items-start gap-2 text-sm text-destructive">
              <AlertTriangle className="mt-0.5 h-4 w-4" />
              <span>{analysis.error ?? "Analysis failed"}</span>
            </div>
          )}
          {!analysis && (
            <p className="text-sm text-muted-foreground">
              No analysis yet. Click Analyze to extract structured knowledge.
            </p>
          )}
          {warnings.length > 0 && (
            <div className="rounded-md border border-warning/40 bg-warning/5 p-3 text-xs">
              <p className="mb-1 font-medium text-warning">Warnings</p>
              <ul className="list-disc space-y-0.5 pl-4 text-muted-foreground">
                {warnings.map((w, i) => <li key={i}>{w}</li>)}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {result && (
        <>
          {result.summary && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" /> Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line text-sm text-foreground">{result.summary}</p>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            <ListCard title="Departments" items={result.departments?.map((d) => d.name) ?? []} />
            <ListCard title="Roles" items={result.roles?.map((r) => r.title) ?? []} />
            <ListCard title="Policies" items={result.policies?.map((p) => p.title) ?? []} />
            <ListCard title="Processes" items={result.processes?.map((p) => p.name) ?? []} />
            <ListCard title="Approval chains" items={result.approval_chains?.map((a) => a.name) ?? []} />
            <ListCard title="Tools" items={result.tools ?? []} />
            <ListCard title="Risks" items={result.risks ?? []} />
            <ListCard title="Compliance" items={result.compliance ?? []} />
          </div>

          {(result.unknowns?.length ?? 0) > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">Unknowns</CardTitle></CardHeader>
              <CardContent>
                <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  {result.unknowns!.map((u, i) => <li key={i}>{u}</li>)}
                </ul>
              </CardContent>
            </Card>
          )}
        </>
      )}

      <Separator />
      <p className="text-xs text-muted-foreground">
        Analysis id: {analysis?.id ?? "—"}
      </p>
    </div>
  );
}

type ExtractedResult = {
  summary?: string;
  departments?: { name: string }[];
  roles?: { title: string }[];
  policies?: { title: string }[];
  processes?: { name: string }[];
  approval_chains?: { name: string }[];
  tools?: string[];
  risks?: string[];
  compliance?: string[];
  unknowns?: string[];
};

function StatusBadge({ status }: { status?: string }) {
  const map: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    running: { label: "Running", variant: "default" },
    completed: { label: "Completed", variant: "secondary" },
    failed: { label: "Failed", variant: "destructive" },
    pending: { label: "Pending", variant: "outline" },
  };
  const s = status ? map[status] : undefined;
  return <Badge variant={s?.variant ?? "outline"}>{s?.label ?? "No analysis"}</Badge>;
}

function ListCard({ title, items }: { title: string; items: string[] }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">{title}</CardTitle>
          <Badge variant="secondary">{items.length}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-xs text-muted-foreground">None detected.</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {items.slice(0, 12).map((x, i) => (
              <li key={i} className="truncate text-foreground">• {x}</li>
            ))}
            {items.length > 12 && (
              <li className="text-xs text-muted-foreground">+{items.length - 12} more</li>
            )}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function formatSize(bytes: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
