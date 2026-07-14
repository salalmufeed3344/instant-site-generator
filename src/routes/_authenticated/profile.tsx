import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/profile")({
  component: ProfilePage,
});

const INDUSTRIES = [
  "Technology","Finance","Healthcare","Manufacturing","Retail","Education",
  "Professional Services","Hospitality","Construction","Other",
];
const SIZES = ["1-10","11-50","51-200","201-500","501-1000","1000+"];

type Org = {
  id: string;
  name: string;
  industry: string | null;
  company_size: string | null;
  country: string | null;
  timezone: string | null;
  mission: string | null;
  vision: string | null;
  description: string | null;
  website: string | null;
  contact_email: string | null;
};

function ProfilePage() {
  const { user } = useAuth();
  const email = user?.email ?? "";
  const initials = (email[0] ?? "?").toUpperCase();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState("");
  const [org, setOrg] = useState<Org | null>(null);

  useEffect(() => {
    (async () => {
      if (!user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, organization_id")
        .eq("id", user.id)
        .maybeSingle();
      setFullName(profile?.full_name ?? "");
      if (profile?.organization_id) {
        const { data: o } = await supabase
          .from("organizations")
          .select("id,name,industry,company_size,country,timezone,mission,vision,description,website,contact_email")
          .eq("id", profile.organization_id)
          .single();
        setOrg(o as Org);
      }
      setLoading(false);
    })();
  }, [user]);

  async function savePersonal() {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName || null })
      .eq("id", user.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Profile saved");
  }

  async function saveOrg() {
    if (!org) return;
    setSaving(true);
    const { error } = await supabase
      .from("organizations")
      .update({
        name: org.name,
        industry: org.industry,
        company_size: org.company_size,
        country: org.country,
        timezone: org.timezone,
        mission: org.mission,
        vision: org.vision,
        description: org.description,
        website: org.website,
        contact_email: org.contact_email,
      })
      .eq("id", org.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Organization saved");
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Profile" description="Your account and organization details." />

      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-14 w-14">
            <AvatarFallback className="bg-primary/10 text-primary">{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <CardTitle className="text-base truncate">{email || "Signed in"}</CardTitle>
            <CardDescription>Personal account</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="full-name">Full name</Label>
              <Input id="full-name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={email} disabled />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={savePersonal} disabled={saving} size="sm">
              <Save className="mr-1.5 h-4 w-4" /> Save
            </Button>
          </div>
        </CardContent>
      </Card>

      {org && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Organization profile</CardTitle>
            <CardDescription>
              This information is used across CortexOS features.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Company name">
                <Input value={org.name} onChange={(e) => setOrg({ ...org, name: e.target.value })} />
              </Field>
              <Field label="Website">
                <Input
                  placeholder="https://example.com"
                  value={org.website ?? ""}
                  onChange={(e) => setOrg({ ...org, website: e.target.value })}
                />
              </Field>
              <Field label="Industry">
                <Select value={org.industry ?? ""} onValueChange={(v) => setOrg({ ...org, industry: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Company size">
                <Select value={org.company_size ?? ""} onValueChange={(v) => setOrg({ ...org, company_size: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {SIZES.map((s) => <SelectItem key={s} value={s}>{s} employees</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Country">
                <Input value={org.country ?? ""} onChange={(e) => setOrg({ ...org, country: e.target.value })} />
              </Field>
              <Field label="Timezone">
                <Input value={org.timezone ?? ""} onChange={(e) => setOrg({ ...org, timezone: e.target.value })} />
              </Field>
              <Field label="Contact email">
                <Input
                  type="email"
                  value={org.contact_email ?? ""}
                  onChange={(e) => setOrg({ ...org, contact_email: e.target.value })}
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Business description">
                  <Textarea
                    rows={3}
                    value={org.description ?? ""}
                    onChange={(e) => setOrg({ ...org, description: e.target.value })}
                  />
                </Field>
              </div>
              <Field label="Mission">
                <Textarea rows={2} value={org.mission ?? ""} onChange={(e) => setOrg({ ...org, mission: e.target.value })} />
              </Field>
              <Field label="Vision">
                <Textarea rows={2} value={org.vision ?? ""} onChange={(e) => setOrg({ ...org, vision: e.target.value })} />
              </Field>
            </div>
            <div className="flex justify-end">
              <Button onClick={saveOrg} disabled={saving} size="sm">
                <Save className="mr-1.5 h-4 w-4" /> Save organization
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
