import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import {
  ArrowRight,
  Bot,
  Brain,
  CheckCircle2,
  FileText,
  Network,
  Shield,
  Sparkles,
  Upload,
  Workflow,
} from "lucide-react";

import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) throw redirect({ to: "/overview" });
  },
  head: () => ({
    meta: [
      { title: "CortexOS — Turn Company Knowledge into an AI Workforce" },
      {
        name: "description",
        content:
          "CortexOS is an enterprise AI platform that reads your documents, understands your organization, builds AI departments, remembers decisions, and assists your employees.",
      },
      { property: "og:title", content: "CortexOS — Turn Company Knowledge into an AI Workforce" },
      {
        property: "og:description",
        content:
          "Upload documents. Understand the organization. Build AI departments. Remember decisions. Assist employees.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const steps = [
  { icon: Upload, title: "Upload documents", body: "Bring in policies, handbooks, SOPs, and playbooks. CortexOS reads them all." },
  { icon: Brain, title: "Understand the organization", body: "AI extracts departments, roles, policies, and processes automatically." },
  { icon: Bot, title: "Build AI departments", body: "A specialized AI workforce grounded in your knowledge — HR, Finance, Ops & more." },
  { icon: Network, title: "Remember decisions", body: "Long-term organizational memory links every decision back to its sources." },
  { icon: Sparkles, title: "Assist employees", body: "Anyone can ask a question and get a transparent, cited, policy-aware answer." },
];

const trust = [
  { icon: Shield, label: "Row-level security" },
  { icon: FileText, label: "Full source citations" },
  { icon: Workflow, label: "Human approvals" },
  { icon: CheckCircle2, label: "No data leaves your workspace" },
];

function Landing() {
  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Logo />
          <nav className="flex items-center gap-1">
            <Button asChild variant="ghost" size="sm">
              <Link to="/help">Help</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/auth">Sign in</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/auth" search={{ mode: "signup" }}>
                Get started
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border">
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,theme(colors.primary/12),transparent_60%)]"
          />
          <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-28">
            <span className="inline-flex items-center rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
              Enterprise AI Platform · v1.0
            </span>
            <h1 className="mt-6 max-w-3xl text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
              Turn Company Knowledge into an <span className="text-primary">AI Workforce</span>.
            </h1>
            <p className="mt-5 max-w-2xl text-pretty text-lg text-muted-foreground">
              CortexOS reads your documents, understands your organization, builds specialized AI
              departments, remembers every decision, and helps your team work faster — with full
              transparency on every answer.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/auth" search={{ mode: "signup" }}>
                  Create your workspace
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/auth">Sign in</Link>
              </Button>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2">
              {trust.map((t) => (
                <div key={t.label} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <t.icon className="h-4 w-4 text-primary" aria-hidden />
                  <span>{t.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">How CortexOS works</h2>
              <p className="mt-2 text-muted-foreground">Five steps from documents to an operating AI organization.</p>
            </div>
          </div>
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {steps.map((s, i) => (
              <li
                key={s.title}
                className="relative rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
              >
                <div className="mb-3 flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <s.icon className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="text-xs font-medium tabular-nums text-muted-foreground">Step {i + 1}</span>
                </div>
                <h3 className="text-sm font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Not-a-chatbot */}
        <section className="border-y border-border bg-muted/30">
          <div className="mx-auto grid max-w-6xl gap-8 px-6 py-16 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                This is <span className="italic">not</span> a chatbot.
              </h2>
              <p className="mt-3 text-muted-foreground">
                CortexOS is a full organizational intelligence platform. Every AI response cites its
                sources, references your policies, consults the right departments, and passes through
                approval when it matters.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild>
                  <Link to="/auth" search={{ mode: "signup" }}>
                    Try it now <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/help">Read the guide</Link>
                </Button>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="rounded-lg border border-border/70 bg-background/60 p-4 text-sm">
                <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden />
                  Example task
                </div>
                <p className="font-medium">“How do employees request leave?”</p>
                <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                  <li>→ Selected: <span className="text-foreground">Human Resources</span></li>
                  <li>→ Policy: <span className="text-foreground">Time-off policy v2.1</span></li>
                  <li>→ Sources: <span className="text-foreground">2 documents, 1 memory</span></li>
                  <li>→ Confidence: <span className="text-primary font-medium">94%</span></li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-2 px-6 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} CortexOS · Enterprise AI Platform</span>
          <div className="flex gap-4">
            <Link to="/help" className="hover:text-foreground">Help</Link>
            <Link to="/auth" className="hover:text-foreground">Sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
