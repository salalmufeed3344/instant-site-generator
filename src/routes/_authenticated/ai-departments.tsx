import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Bot, Sparkles, Plus, ArrowRight, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/layout/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { seedAiDepartments } from "@/lib/ai-workforce.functions";

export const Route = createFileRoute("/_authenticated/ai-departments")({
  component: AiDepartmentsPage,
});

type Dept = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  purpose: string | null;
  responsibilities: string[];
  status: string;
  confidence: number;
};

function AiDepartmentsPage() {
  const [items, setItems] = useState<Dept[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const seed = useServerFn(seedAiDepartments);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("ai_departments")
      .select("id, name, slug, description, purpose, responsibilities, status, confidence")
      .order("name");
    if (error) toast.error(error.message);
    setItems((data as Dept[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const r = await seed({ data: undefined as never });
      toast.success(`Seeded ${r.inserted} department${r.inserted === 1 ? "" : "s"}`);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to seed");
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="AI Departments"
        description="Specialized AI roles that operate on your organization's knowledge."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleSeed} disabled={seeding}>
              <Sparkles className="mr-1.5 h-4 w-4" />
              {seeding ? "Seeding..." : "Seed defaults"}
            </Button>
            <Button size="sm" asChild>
              <Link to="/ai-tasks">
                <Plus className="mr-1.5 h-4 w-4" />
                New task
              </Link>
            </Button>
          </div>
        }
      />

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Bot}
          title="No AI departments yet"
          description="Seed the default set (HR, Finance, Sales, Marketing, Support, Ops, IT, Legal) to get started."
          action={
            <Button onClick={handleSeed} disabled={seeding}>
              <Sparkles className="mr-1.5 h-4 w-4" />
              Seed default departments
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((d) => (
            <Card key={d.id} className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{d.name}</CardTitle>
                  <Badge variant={d.status === "active" ? "default" : "secondary"}>
                    {d.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {d.purpose ?? d.description ?? "—"}
                </p>
              </CardHeader>
              <CardContent className="mt-auto space-y-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Confidence {(d.confidence * 100).toFixed(0)}%
                </div>
                <div className="text-xs text-muted-foreground">
                  {d.responsibilities.length} responsibilit
                  {d.responsibilities.length === 1 ? "y" : "ies"}
                </div>
                <Button asChild size="sm" variant="ghost" className="w-full justify-between">
                  <Link
                    to="/ai-departments/$slug"
                    params={{ slug: d.slug }}
                  >
                    View department <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
