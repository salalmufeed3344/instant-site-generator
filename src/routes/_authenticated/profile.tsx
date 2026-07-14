import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const Route = createFileRoute("/_authenticated/profile")({
  component: Profile,
});

function Profile() {
  const { user } = useAuth();
  const email = user?.email ?? "";
  const initials = (email[0] ?? "?").toUpperCase();

  return (
    <div className="space-y-8">
      <PageHeader title="Profile" description="Your personal account details." />

      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-14 w-14">
            <AvatarFallback className="bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-base">{email || "Signed in"}</CardTitle>
            <CardDescription>Member since today</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="full-name">Full name</Label>
              <Input id="full-name" placeholder="Your name" disabled />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={email} disabled />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Profile editing ships in Phase 2 with role management.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
