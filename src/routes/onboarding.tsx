import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  MessageSquare,
  Sparkles,
  Building2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Logo } from "@/components/brand/Logo";
import { DocumentUploadZone, type UploadedDoc } from "@/components/knowledge/DocumentUploadZone";
import { supabase } from "@/integrations/supabase/client";
import { INDUSTRY_TEMPLATES, INTERVIEW_QUESTIONS } from "@/lib/industry-templates";

export const Route = createFileRoute("/onboarding")({
  ssr: false,
  beforeLoad: async () => {
    const { data: userData, error } = await supabase.auth.getUser();
    if (error || !userData.user) throw redirect({ to: "/auth" });
    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id, organizations(setup_completed)")
      .eq("id", userData.user.id)
      .maybeSingle();
    const org = (profile as { organizations?: { setup_completed?: boolean } | null } | null)
      ?.organizations;
    if (profile?.organization_id && org?.setup_completed) {
      throw redirect({ to: "/overview" });
    }
  },
  component: OnboardingWizard,
});

const INDUSTRIES = [
  "Technology",
  "Finance",
  "Healthcare",
  "Manufacturing",
  "Retail",
  "Education",
  "Professional Services",
  "Hospitality",
  "Construction",
  "Other",
];
const SIZES = ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"];
const COUNTRIES = [
  "United States",
  "United Kingdom",
  "Canada",
  "Germany",
  "France",
  "Netherlands",
  "India",
  "Brazil",
  "Australia",
  "Japan",
  "Other",
];

type Method = "documents" | "interview" | "template";

function OnboardingWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [method, setMethod] = useState<Method | null>(null);

  // Step 1 fields
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [size, setSize] = useState("");
  const [country, setCountry] = useState("");
  const [timezone, setTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
  );

  // Documents
  const [uploaded, setUploaded] = useState<UploadedDoc[]>([]);

  // Interview
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [qIdx, setQIdx] = useState(0);

  // Template
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", userData.user.id)
        .maybeSingle();
      if (profile?.organization_id) {
        const { data: o } = await supabase
          .from("organizations")
          .select("id,name,industry,company_size,country,timezone")
          .eq("id", profile.organization_id)
          .maybeSingle();
        if (o) {
          setOrgId(o.id);
          setName(o.name);
          setIndustry(o.industry ?? "");
          setSize(o.company_size ?? "");
          setCountry(o.country ?? "");
          if (o.timezone) setTimezone(o.timezone);
        }
      }
    })();
  }, []);

  async function createOrgIfNeeded() {
    if (orgId) {
      await supabase
        .from("organizations")
        .update({
          name: name.trim(),
          industry: industry || null,
          company_size: size || null,
          country: country || null,
          timezone: timezone || null,
        })
        .eq("id", orgId);
      return orgId;
    }
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("Not signed in");
    const { data: org, error } = await supabase
      .from("organizations")
      .insert({
        name: name.trim(),
        industry: industry || null,
        company_size: size || null,
        country: country || null,
        timezone: timezone || null,
      })
      .select("id")
      .single();
    if (error) throw error;
    await supabase
      .from("profiles")
      .update({ organization_id: org.id, role: "owner" })
      .eq("id", userData.user.id);
    setOrgId(org.id);
    return org.id;
  }

  async function handleStep1Next() {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Organization name is required", {
        description: "Enter a name to continue setting up your workspace.",
      });
      return;
    }
    setSaving(true);
    const isUpdate = Boolean(orgId);
    const pending = toast.loading(
      isUpdate ? "Saving workspace details…" : "Creating your workspace…",
    );
    try {
      await createOrgIfNeeded();
      toast.success(
        isUpdate ? "Workspace updated" : `Workspace “${trimmed}” created`,
        {
          id: pending,
          description: isUpdate
            ? "Your organization details have been saved."
            : "Next, choose how to teach CortexOS about your company.",
        },
      );
      setStep(2);
    } catch (e) {
      const err = e as {
        message?: string;
        details?: string;
        hint?: string;
        code?: string;
      };
      const parts = [err?.message, err?.details, err?.hint].filter(
        (v): v is string => typeof v === "string" && v.trim().length > 0,
      );
      const raw =
        parts.length > 0
          ? parts.join(" — ")
          : e instanceof Error
            ? e.message
            : "Unknown error";
      const lower = raw.toLowerCase();
      const code = err?.code ?? "";
      let title = "Couldn't create workspace";
      let description = raw || "Please try again in a moment.";
      if (lower.includes("not signed in") || lower.includes("jwt") || code === "PGRST301") {
        title = "You're signed out";
        description = "Sign in again and retry — your progress is safe.";
      } else if (
        lower.includes("row-level security") ||
        lower.includes("permission") ||
        code === "42501"
      ) {
        title = "Permission denied";
        description =
          "Your account can't create a workspace right now. Refresh the page, sign in again, and try once more.";
      } else if (code === "23505" || lower.includes("duplicate") || lower.includes("unique")) {
        title = "Name already in use";
        description = "Pick a different organization name and try again.";
      } else if (code === "42703" || lower.includes("does not exist")) {
        title = "Workspace schema out of date";
        description =
          "Reload the page to pick up the latest form fields, then try again. If it persists, contact support.";
      } else if (lower.includes("network") || lower.includes("failed to fetch")) {
        title = "Network issue";
        description = "Check your connection and try again.";
      }
      console.error("[onboarding] createOrg failed", err);
      toast.error(title, { id: pending, description });

    } finally {
      setSaving(false);
    }
  }


  async function pickMethod(m: Method) {
    setMethod(m);
    if (orgId) {
      await supabase.from("organizations").update({ setup_method: m }).eq("id", orgId);
    }
    setStep(3);
  }

  async function saveAnswer(key: string, question: string, answer: string) {
    if (!orgId) return;
    await supabase.from("interview_answers").upsert(
      { organization_id: orgId, question_key: key, question, answer },
      { onConflict: "organization_id,question_key" },
    );
    await supabase.from("knowledge_sources").upsert(
      {
        organization_id: orgId,
        title: question,
        category: "interview",
        status: answer ? "ready" : "pending",
      },
      { onConflict: "id" },
    );
  }

  async function applyTemplate(key: string) {
    if (!orgId) return;
    const tmpl = INDUSTRY_TEMPLATES.find((t) => t.key === key);
    if (!tmpl) return;
    setSaving(true);
    try {
      await supabase.from("organization_templates").insert({
        organization_id: orgId,
        template_key: tmpl.key,
        template_name: tmpl.name,
      });
      await supabase.from("departments").insert(
        tmpl.departments.map((d) => ({
          organization_id: orgId,
          name: d.name,
          description: d.description,
        })),
      );
      await supabase.from("knowledge_sources").insert({
        organization_id: orgId,
        title: `${tmpl.name} template`,
        category: "template",
        status: "ready",
      });
      toast.success(`${tmpl.name} template applied`);
      setSelectedTemplate(key);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  async function finish() {
    if (!orgId) return;
    setSaving(true);
    try {
      await supabase.from("organizations").update({ setup_completed: true }).eq("id", orgId);
      toast.success("Workspace ready");
      navigate({ to: "/knowledge" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  const currentQ = INTERVIEW_QUESTIONS[qIdx];
  const answeredCount = useMemo(
    () => Object.values(answers).filter((v) => v.trim().length > 0).length,
    [answers],
  );

  return (
    <div className="flex min-h-screen items-start justify-center bg-muted/20 px-4 py-10 sm:py-16">
      <div className="w-full max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <Logo />
          <span className="text-xs text-muted-foreground">
            Step {step} of {totalSteps}
          </span>
        </div>
        <Progress value={progress} className="mb-8 h-1.5" />

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                  Tell us about your organization
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  We'll tailor your workspace to your industry and size.
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="name">Organization name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Acme, Inc."
                    autoFocus
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Industry</Label>
                  <Select value={industry} onValueChange={setIndustry}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Company size</Label>
                  <Select value={size} onValueChange={setSize}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {SIZES.map((s) => <SelectItem key={s} value={s}>{s} employees</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Country</Label>
                  <Select value={country} onValueChange={setCountry}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="tz">Timezone</Label>
                  <Input id="tz" value={timezone} onChange={(e) => setTimezone(e.target.value)} />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button onClick={handleStep1Next} disabled={saving || !name.trim()}>
                  Continue <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                  How do you want to teach CortexOS about your company?
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Pick one — you can add more knowledge later.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <MethodCard
                  icon={<FileText className="h-5 w-5" />}
                  title="Import Documents"
                  description="Upload SOPs, policies, manuals, and playbooks you already have."
                  onClick={() => pickMethod("documents")}
                />
                <MethodCard
                  icon={<MessageSquare className="h-5 w-5" />}
                  title="AI Guided Interview"
                  description="Answer a few questions and we'll capture the essentials."
                  onClick={() => pickMethod("interview")}
                />
                <MethodCard
                  icon={<Sparkles className="h-5 w-5" />}
                  title="Industry Template"
                  description="Start from a professionally designed business template."
                  onClick={() => pickMethod("template")}
                />
              </div>

              <div className="flex justify-between pt-2">
                <Button variant="ghost" onClick={() => setStep(1)}>
                  <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
                </Button>
              </div>
            </div>
          )}

          {step === 3 && method === "documents" && orgId && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">Upload your documents</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  PDFs, Word docs, text and Markdown files. You can skip and add later.
                </p>
              </div>
              <DocumentUploadZone
                organizationId={orgId}
                onUploaded={(d) => setUploaded((u) => [d, ...u])}
              />
              {uploaded.length > 0 && (
                <ul className="space-y-2 rounded-md border border-border bg-card p-3">
                  {uploaded.map((d) => (
                    <li key={d.id} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-success" />
                      <span className="truncate">{d.title}</span>
                      <span className="ml-auto text-xs text-muted-foreground">
                        {formatBytes(d.file_size)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <NavRow onBack={() => setStep(2)} onNext={() => setStep(4)} />
            </div>
          )}

          {step === 3 && method === "interview" && orgId && currentQ && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-semibold tracking-tight">Guided interview</h1>
                  <span className="text-xs text-muted-foreground">
                    {answeredCount}/{INTERVIEW_QUESTIONS.length} answered · ~
                    {Math.max(1, Math.ceil((INTERVIEW_QUESTIONS.length - answeredCount) * 0.5))} min left
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Question {qIdx + 1} of {INTERVIEW_QUESTIONS.length} — skip any you're unsure about.
                </p>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-medium">{currentQ.question}</Label>
                <Textarea
                  rows={6}
                  value={answers[currentQ.key] ?? ""}
                  onChange={(e) =>
                    setAnswers((a) => ({ ...a, [currentQ.key]: e.target.value }))
                  }
                  onBlur={() =>
                    saveAnswer(currentQ.key, currentQ.question, answers[currentQ.key] ?? "")
                  }
                  placeholder={currentQ.placeholder ?? "Type your answer…"}
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <Button variant="ghost" onClick={() => qIdx === 0 ? setStep(2) : setQIdx((i) => i - 1)}>
                  <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (qIdx < INTERVIEW_QUESTIONS.length - 1) setQIdx((i) => i + 1);
                      else setStep(4);
                    }}
                  >
                    Skip
                  </Button>
                  <Button
                    onClick={async () => {
                      await saveAnswer(currentQ.key, currentQ.question, answers[currentQ.key] ?? "");
                      if (qIdx < INTERVIEW_QUESTIONS.length - 1) setQIdx((i) => i + 1);
                      else setStep(4);
                    }}
                  >
                    {qIdx === INTERVIEW_QUESTIONS.length - 1 ? "Done" : "Next"}
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && method === "template" && orgId && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">Choose an industry template</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  We'll create example departments for you. You can edit them anytime.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {INDUSTRY_TEMPLATES.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => applyTemplate(t.key)}
                    disabled={saving || selectedTemplate === t.key}
                    className={`text-left rounded-lg border p-4 transition hover:border-primary hover:bg-primary/5 ${
                      selectedTemplate === t.key ? "border-primary bg-primary/5" : "border-border bg-card"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl" aria-hidden>{t.icon}</span>
                      <span className="text-sm font-medium">{t.name}</span>
                      {selectedTemplate === t.key && (
                        <Check className="ml-auto h-4 w-4 text-success" />
                      )}
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                      {t.description}
                    </p>
                    <p className="mt-2 text-[11px] text-muted-foreground">
                      {t.departments.length} departments
                    </p>
                  </button>
                ))}
              </div>
              <NavRow onBack={() => setStep(2)} onNext={() => setStep(4)} nextDisabled={!selectedTemplate} />
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-success">
                <Check className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">Your workspace is ready</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  You can add more knowledge sources any time from the Knowledge Hub.
                </p>
              </div>
              <div className="flex justify-center gap-2">
                <Button variant="outline" onClick={() => setStep(2)}>
                  <Building2 className="mr-1.5 h-4 w-4" /> Add another source
                </Button>
                <Button onClick={finish} disabled={saving}>
                  Open Knowledge Hub <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MethodCard({
  icon,
  title,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col items-start gap-3 rounded-lg border border-border bg-card p-5 text-left transition hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>
      <span className="mt-auto text-xs text-primary opacity-0 transition group-hover:opacity-100">
        Choose →
      </span>
    </button>
  );
}

function NavRow({
  onBack,
  onNext,
  nextDisabled,
}: {
  onBack: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between pt-2">
      <Button variant="ghost" onClick={onBack}>
        <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
      </Button>
      <Button onClick={onNext} disabled={nextDisabled}>
        Continue <ArrowRight className="ml-1.5 h-4 w-4" />
      </Button>
    </div>
  );
}

function formatBytes(n: number | null | undefined) {
  if (!n) return "";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}
