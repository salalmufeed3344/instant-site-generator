import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BookOpen, Building2, Users, Layers, Sparkles, Upload } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/layout/StatCard";
import { EmptyState } from "@/components/layout/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DocumentUploadZone } from "@/components/knowledge/DocumentUploadZone";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/knowledge")({
  component: KnowledgeHub,
});

type Org = {
  id: string;
  name: string;
  industry: string | null;
  company_size: string | null;
  description: string | null;
  mission: string | null;
  vision: string | null;
};

function KnowledgeHub() {
  const [loading, setLoading] = useState(true);
  const [org, setOrg] = useState<Org | null>(null);
  const [counts, setCounts] = useState({
    docs: 0, depts: 0, sources: 0, answers: 0,
    policies: 0, roles: 0, processes: 0, approvals: 0,
  });
  const [documents, setDocuments] = useState<Array<{ id: string; title: string; created_at: string; status?: string; progress?: number }>>([]);
  const [uploadOpen, setUploadOpen] = useState(false);

  async function load() {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id")
      .eq("id", userData.user.id)
      .maybeSingle();
    const orgId = profile?.organization_id;
    if (!orgId) {
      setLoading(false);
      return;
    }
    const [orgRes, docs, depts, sources, answers, policies, roles, processes, approvals, docList, analyses] = await Promise.all([
      supabase.from("organizations").select("id,name,industry,company_size,description,mission,vision").eq("id", orgId).single(),
      supabase.from("documents").select("id", { count: "exact", head: true }).eq("organization_id", orgId),
      supabase.from("departments").select("id", { count: "exact", head: true }).eq("organization_id", orgId),
      supabase.from("knowledge_sources").select("id", { count: "exact", head: true }).eq("organization_id", orgId),
      supabase.from("interview_answers").select("id", { count: "exact", head: true }).eq("organization_id", orgId).not("answer", "is", null),
      supabase.from("policies").select("id", { count: "exact", head: true }).eq("organization_id", orgId),
      supabase.from("roles").select("id", { count: "exact", head: true }).eq("organization_id", orgId),
      supabase.from("processes").select("id", { count: "exact", head: true }).eq("organization_id", orgId),
      supabase.from("approval_chains").select("id", { count: "exact", head: true }).eq("organization_id", orgId),
      supabase.from("documents").select("id,title,created_at").eq("organization_id", orgId).order("created_at", { ascending: false }).limit(10),
      supabase.from("document_analysis").select("document_id,status,progress").eq("organization_id", orgId),
    ]);
    setOrg(orgRes.data as Org);
    setCounts({
      docs: docs.count ?? 0,
      depts: depts.count ?? 0,
      sources: sources.count ?? 0,
      answers: answers.count ?? 0,
      policies: policies.count ?? 0,
      roles: roles.count ?? 0,
      processes: processes.count ?? 0,
      approvals: approvals.count ?? 0,
    });
    const aMap = new Map<string, { status: string; progress: number }>();
    for (const a of (analyses.data ?? []) as Array<{ document_id: string; status: string; progress: number }>) {
      aMap.set(a.document_id, { status: a.status, progress: a.progress });
    }
    setDocuments(
      ((docList.data ?? []) as Array<{ id: string; title: string; created_at: string }>).map((d) => ({
        ...d,
        status: aMap.get(d.id)?.status,
        progress: aMap.get(d.id)?.progress,
      })),
    );
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  const completion = Math.min(
    100,
    Math.round(
      ((counts.docs > 0 ? 25 : 0) +
        (counts.depts > 0 ? 25 : 0) +
        (counts.answers > 0 ? 25 : 0) +
        (org?.description ? 25 : 0)) * 1,
    ),
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-40" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Knowledge Hub"
        description="Everything CortexOS knows about your organization."
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <Link to="/departments"><Users className="mr-1.5 h-4 w-4" /> Departments</Link>
            </Button>
            <Button size="sm" onClick={() => setUploadOpen(true)}>
              <Upload className="mr-1.5 h-4 w-4" /> Upload
            </Button>
          </>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Documents" value={String(counts.docs)} icon={BookOpen} />
        <StatCard label="Departments" value={String(counts.depts)} icon={Users} />
        <StatCard label="Knowledge sources" value={String(counts.sources)} icon={Layers} />
        <StatCard label="Completion" value={`${completion}%`} icon={Sparkles} />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-base">Organization profile</CardTitle>
                <CardDescription>Company essentials CortexOS uses across features.</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/profile">Edit</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {org ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Company">{org.name}</Field>
                <Field label="Industry">{org.industry ?? "—"}</Field>
                <Field label="Size">{org.company_size ?? "—"}</Field>
                <Field label="Mission">{org.mission ?? "—"}</Field>
                <div className="sm:col-span-2">
                  <Field label="Description">{org.description ?? "—"}</Field>
                </div>
              </div>
            ) : (
              <EmptyState icon={Building2} title="No organization yet" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Organization completion</CardTitle>
            <CardDescription>Fill each area to reach 100%.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Progress value={completion} className="h-2" />
            <ul className="space-y-1.5 text-sm">
              <ChecklistRow done={!!org?.description} label="Company description" />
              <ChecklistRow done={counts.docs > 0} label="At least one document" />
              <ChecklistRow done={counts.depts > 0} label="Departments defined" />
              <ChecklistRow done={counts.answers > 0} label="Interview answers" />
            </ul>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Knowledge sources</CardTitle>
              <CardDescription>All ingested knowledge across categories.</CardDescription>
            </div>
            <Badge variant="secondary">{counts.sources}</Badge>
          </CardHeader>
          <CardContent>
            {counts.sources === 0 ? (
              <EmptyState
                icon={Layers}
                title="No sources yet"
                description="Upload documents or complete the interview to add sources."
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                {counts.sources} sources indexed. AI processing arrives in Phase 3.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Departments</CardTitle>
              <CardDescription>Organizational structure.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/departments">Manage</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {counts.depts === 0 ? (
              <EmptyState
                icon={Users}
                title="No departments yet"
                description="Create departments manually or apply an industry template."
                action={
                  <Button size="sm" asChild>
                    <Link to="/templates">Browse templates</Link>
                  </Button>
                }
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                {counts.depts} departments configured.
              </p>
            )}
          </CardContent>
        </Card>
      </section>

      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload documents</DialogTitle>
            <DialogDescription>
              PDF, DOCX, TXT, and Markdown. Files are stored securely per organization.
            </DialogDescription>
          </DialogHeader>
          {org && (
            <DocumentUploadZone
              organizationId={org.id}
              onUploaded={() => {
                void load();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm text-foreground">{children}</p>
    </div>
  );
}

function ChecklistRow({ done, label }: { done: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2">
      <span
        className={`inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
          done ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"
        }`}
      >
        {done ? "✓" : "•"}
      </span>
      <span className={done ? "text-foreground" : "text-muted-foreground"}>{label}</span>
    </li>
  );
}
