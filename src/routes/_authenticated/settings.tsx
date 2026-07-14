import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/settings")({
  component: Settings,
});

function Settings() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Settings"
        description="Manage your workspace, team, and preferences."
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Organization</CardTitle>
          <CardDescription>
            Basic details about your CortexOS workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="org-name">Organization name</Label>
              <Input id="org-name" placeholder="Acme Inc." disabled />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="org-industry">Industry</Label>
              <Input id="org-industry" placeholder="Software" disabled />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Editing organization details ships in Phase 2 alongside team management.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Danger zone</CardTitle>
          <CardDescription>Irreversible actions for this workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" disabled>
            Delete workspace
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
