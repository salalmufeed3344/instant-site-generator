import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, Sparkles } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { INDUSTRY_TEMPLATES, type IndustryTemplate } from "@/lib/industry-templates";

export const Route = createFileRoute("/_authenticated/templates")({
  component: Templates,
});

function Templates() {
  const [orgId, setOrgId] = useState<string | null>(null);
  const [applied, setApplied] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<IndustryTemplate | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id")
      .eq("id", userData.user.id)
      .maybeSingle();
    if (!profile?.organization_id) {
      setLoading(false);
      return;
    }
    setOrgId(profile.organization_id);
    const { data: ot } = await supabase
      .from("organization_templates")
      .select("template_key")
      .eq("organization_id", profile.organization_id);
    setApplied(new Set((ot ?? []).map((r) => r.template_key)));
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  async function apply(t: IndustryTemplate) {
    if (!orgId) return;
    setBusy(true);
    try {
      await supabase.from("organization_templates").insert({
        organization_id: orgId,
        template_key: t.key,
        template_name: t.name,
      });
      await supabase.from("departments").insert(
        t.departments.map((d) => ({
          organization_id: orgId,
          name: d.name,
          description: d.description,
        })),
      );
      await supabase.from("knowledge_sources").insert({
        organization_id: orgId,
        title: `${t.name} template`,
        category: "template",
        status: "ready",
      });
      toast.success(`${t.name} template applied`);
      setPending(null);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Industry Templates"
        description="Bootstrap your organization from a professionally designed template."
      />

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-40" />)}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {INDUSTRY_TEMPLATES.map((t) => {
            const isApplied = applied.has(t.key);
            return (
              <Card key={t.key} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-xl">
                        {t.icon}
                      </div>
                      <div>
                        <CardTitle className="text-sm">{t.name}</CardTitle>
                        <CardDescription className="text-xs">
                          {t.departments.length} departments
                        </CardDescription>
                      </div>
                    </div>
                    {isApplied && (
                      <Badge variant="secondary" className="gap-1">
                        <Check className="h-3 w-3" /> Applied
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col">
                  <p className="text-xs text-muted-foreground">{t.description}</p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {t.departments.slice(0, 4).map((d) => (
                      <Badge key={d.name} variant="outline" className="text-[10px]">
                        {d.name}
                      </Badge>
                    ))}
                    {t.departments.length > 4 && (
                      <Badge variant="outline" className="text-[10px]">
                        +{t.departments.length - 4}
                      </Badge>
                    )}
                  </div>
                  <div className="mt-auto pt-4">
                    <Button
                      size="sm"
                      variant={isApplied ? "outline" : "default"}
                      onClick={() => setPending(t)}
                      disabled={!orgId}
                      className="w-full"
                    >
                      <Sparkles className="mr-1.5 h-4 w-4" />
                      {isApplied ? "Apply again" : "Apply template"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <AlertDialog open={!!pending} onOpenChange={(o) => !o && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apply {pending?.name} template?</AlertDialogTitle>
            <AlertDialogDescription>
              This will add {pending?.departments.length} example departments to your organization.
              You can edit or delete them anytime.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                if (pending) void apply(pending);
              }}
              disabled={busy}
            >
              {busy ? "Applying…" : "Apply"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
