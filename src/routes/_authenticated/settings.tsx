import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AlertTriangle, Bell, Building2, Globe, Palette, Plug, Shield } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/settings")({
  component: Settings,
});

function Settings() {
  const [orgName, setOrgName] = useState("");
  const [industry, setIndustry] = useState("");
  const [size, setSize] = useState("");
  const [orgId, setOrgId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const [notif, setNotif] = useState({
    analysis: true,
    tasks: true,
    approvals: true,
    weekly: false,
  });

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      const { data } = await supabase
        .from("profiles")
        .select("organization_id, organizations(id, name, industry, company_size)")
        .eq("id", userData.user.id)
        .maybeSingle();
      const org = (data as any)?.organizations;
      if (org) {
        setOrgId(org.id);
        setOrgName(org.name ?? "");
        setIndustry(org.industry ?? "");
        setSize(org.company_size ?? "");
      }
    })();
    const stored = typeof window !== "undefined" ? localStorage.getItem("cortex-theme") : null;
    if (stored === "light" || stored === "dark" || stored === "system") setTheme(stored);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("cortex-theme", theme);
    const root = document.documentElement;
    const dark =
      theme === "dark" ||
      (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    root.classList.toggle("dark", dark);
  }, [theme]);

  async function saveOrg() {
    if (!orgId) return;
    setSaving(true);
    const { error } = await supabase
      .from("organizations")
      .update({ name: orgName, industry, company_size: size })
      .eq("id", orgId);
    setSaving(false);
    if (error) toast.error("Couldn't save changes. Please try again.");
    else toast.success("Organization updated");
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Settings" description="Manage your workspace, preferences, and integrations." />

      <Tabs defaultValue="organization" className="space-y-6">
        <TabsList className="flex-wrap">
          <TabsTrigger value="organization"><Building2 className="mr-1.5 h-4 w-4" />Organization</TabsTrigger>
          <TabsTrigger value="appearance"><Palette className="mr-1.5 h-4 w-4" />Appearance</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="mr-1.5 h-4 w-4" />Notifications</TabsTrigger>
          <TabsTrigger value="security"><Shield className="mr-1.5 h-4 w-4" />Security</TabsTrigger>
          <TabsTrigger value="integrations"><Plug className="mr-1.5 h-4 w-4" />Integrations</TabsTrigger>
          <TabsTrigger value="language"><Globe className="mr-1.5 h-4 w-4" />Language</TabsTrigger>
        </TabsList>

        <TabsContent value="organization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Organization profile</CardTitle>
              <CardDescription>Basic details about your CortexOS workspace.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="org-name">Organization name</Label>
                  <Input id="org-name" value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="Acme Inc." />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="org-industry">Industry</Label>
                  <Input id="org-industry" value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="Software" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="org-size">Company size</Label>
                  <Input id="org-size" value={size} onChange={(e) => setSize(e.target.value)} placeholder="1-10" />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={saveOrg} disabled={saving || !orgId}>
                  {saving ? "Saving…" : "Save changes"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" aria-hidden />
                Danger zone
              </CardTitle>
              <CardDescription>Irreversible actions for this workspace.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" disabled>Delete workspace</Button>
              <p className="mt-2 text-xs text-muted-foreground">
                Workspace deletion will be available in a future release.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Theme</CardTitle>
              <CardDescription>Choose how CortexOS looks to you.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-3">
                {(["light", "dark", "system"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTheme(t)}
                    aria-pressed={theme === t}
                    className={`rounded-xl border p-4 text-left transition-colors ${
                      theme === t ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-accent/30"
                    }`}
                  >
                    <div className="text-sm font-medium capitalize">{t}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {t === "system" ? "Match your device" : t === "dark" ? "Low-light optimized" : "Bright and airy"}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notifications</CardTitle>
              <CardDescription>Control what CortexOS shows you.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: "analysis", label: "Document analysis complete", hint: "In-app toast when a document finishes analysis." },
                { key: "tasks", label: "Task execution updates", hint: "Progress on AI Task Center runs." },
                { key: "approvals", label: "Approvals awaiting you", hint: "When a task requires human approval." },
                { key: "weekly", label: "Weekly digest", hint: "Summary of your organization's activity (coming soon)." },
              ].map((n) => (
                <div key={n.key} className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <Label htmlFor={`notif-${n.key}`} className="text-sm font-medium">{n.label}</Label>
                    <p className="text-xs text-muted-foreground">{n.hint}</p>
                  </div>
                  <Switch
                    id={`notif-${n.key}`}
                    checked={(notif as any)[n.key]}
                    onCheckedChange={(v) => setNotif((s) => ({ ...s, [n.key]: v }))}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Security preferences</CardTitle>
              <CardDescription>Session and access controls.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Label className="text-sm font-medium">Two-factor authentication</Label>
                  <p className="text-xs text-muted-foreground">Additional sign-in verification.</p>
                </div>
                <Badge variant="outline">Coming soon</Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Label className="text-sm font-medium">Single sign-on (SSO / SAML)</Label>
                  <p className="text-xs text-muted-foreground">Enterprise identity provider integration.</p>
                </div>
                <Badge variant="outline">Coming soon</Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Label className="text-sm font-medium">Audit log export</Label>
                  <p className="text-xs text-muted-foreground">Download the full activity log.</p>
                </div>
                <Badge variant="outline">Coming soon</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Integrations</CardTitle>
              <CardDescription>Bring CortexOS to the tools you already use.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { name: "Slack", body: "Post task results and approvals to a channel." },
                  { name: "Google Drive", body: "Sync documents automatically." },
                  { name: "Notion", body: "Import pages as organizational knowledge." },
                  { name: "Microsoft Teams", body: "Reach the AI workforce from Teams." },
                ].map((i) => (
                  <div key={i.name} className="flex items-start justify-between gap-3 rounded-xl border border-border bg-card p-4">
                    <div>
                      <div className="text-sm font-medium">{i.name}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground">{i.body}</div>
                    </div>
                    <Badge variant="outline">Coming soon</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="language">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Language & region</CardTitle>
              <CardDescription>Multi-language support is planned.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Label className="text-sm font-medium">Interface language</Label>
                  <p className="text-xs text-muted-foreground">Currently English (US).</p>
                </div>
                <Badge variant="outline">More languages coming</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
