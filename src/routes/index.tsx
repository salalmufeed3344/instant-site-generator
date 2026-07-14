import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Brain, Shield, Workflow } from "lucide-react";

import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) throw redirect({ to: "/dashboard" });
  },
  component: Landing,
});

const features = [
  {
    icon: BookOpen,
    title: "Company knowledge",
    body: "Centralize documents, policies, and playbooks in a single organizational memory.",
  },
  {
    icon: Workflow,
    title: "Workflows",
    body: "Model how work actually gets done — a foundation for agents to execute against.",
  },
  {
    icon: Brain,
    title: "Long-term memory",
    body: "Preserve decisions, context, and history so your organization compounds knowledge.",
  },
  {
    icon: Shield,
    title: "Enterprise-ready",
    body: "Row-level security, organizations, and role-aware access from day one.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Logo />
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/auth">Sign in</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/auth" search={{ mode: "signup" }}>
                Get started
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-24">
        <div className="max-w-3xl">
          <span className="inline-flex items-center rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
            Phase 1 · Enterprise Foundation
          </span>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Build your AI organization.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            CortexOS turns company knowledge into intelligent AI teams that understand
            documents, execute workflows, remember decisions, and assist employees.
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
        </div>

        <div className="mt-20 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-lg border border-border bg-card p-5 transition-colors hover:bg-accent/40"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                <f.icon className="h-4 w-4" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-foreground">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} CortexOS</span>
          <span>Enterprise AI Platform</span>
        </div>
      </footer>
    </div>
  );
}
