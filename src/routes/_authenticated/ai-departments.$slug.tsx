import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ShieldCheck, BookOpen } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/ai-departments/$slug")({
  component: DepartmentDetail,
});

type Dept = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  purpose: string | null;
  responsibilities: string[];
  workflows: string[];
  status: string;
  confidence: number;
};

function DepartmentDetail() {
  const { slug } = useParams({ from: "/_authenticated/ai-departments/$slug" });
  const [dept, setDept] = useState<Dept | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("ai_departments")
        .select(
          "id, name, slug, description, purpose, responsibilities, workflows, status, confidence",
        )
        .eq("slug", slug)
        .maybeSingle();
      setDept((data as Dept) ?? null);
      setLoading(false);
    })();
  }, [slug]);

  if (loading) return <Skeleton className="h-96" />;
  if (!dept)
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/ai-departments">
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
          </Link>
        </Button>
        <p className="text-muted-foreground">Department not found.</p>
      </div>
    );

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link to="/ai-departments">
          <ArrowLeft className="mr-1.5 h-4 w-4" /> All departments
        </Link>
      </Button>

      <PageHeader
        title={dept.name}
        description={dept.purpose ?? dept.description ?? undefined}
        actions={
          <Badge variant={dept.status === "active" ? "default" : "secondary"}>
            {dept.status}
          </Badge>
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Responsibilities</CardTitle>
          </CardHeader>
          <CardContent>
            {dept.responsibilities.length === 0 ? (
              <p className="text-sm text-muted-foreground">None defined.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {dept.responsibilities.map((r, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-muted-foreground">•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Signals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
              Confidence {(dept.confidence * 100).toFixed(0)}%
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              Uses organization documents, policies, and processes
            </div>
            <div className="text-muted-foreground">
              Available workflows: {dept.workflows.length || "none"}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Agent configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            System prompt, allowed actions, escalation rules, and model settings are stored
            securely and are not editable from the UI in this phase.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
