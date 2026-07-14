import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, HelpCircle, Mail, Rocket, Sparkles } from "lucide-react";

import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "Help & Documentation — CortexOS" },
      {
        name: "description",
        content: "Quick start, FAQs, and a getting-started guide for CortexOS.",
      },
      { property: "og:title", content: "Help & Documentation — CortexOS" },
      {
        property: "og:description",
        content: "Everything you need to get productive with CortexOS.",
      },
    ],
  }),
  component: Help,
});

const faqs = [
  {
    q: "Is CortexOS a chatbot?",
    a: "No. CortexOS is an enterprise AI platform. Every answer is grounded in your uploaded documents, cites its sources, references your policies, and can be routed through human approval.",
  },
  {
    q: "What file formats are supported?",
    a: "Plain text and Markdown are supported out of the box. PDF/DOCX ingestion is on the roadmap.",
  },
  {
    q: "Where does my data live?",
    a: "All documents, extracted knowledge, and memory items are stored in your isolated Lovable Cloud workspace with row-level security scoped by organization.",
  },
  {
    q: "Which AI model powers CortexOS?",
    a: "CortexOS integrates with Qwen Cloud for structured extraction and orchestration. When Qwen isn't reachable, the platform falls back to a deterministic heuristic so the app never breaks.",
  },
  {
    q: "How do AI departments get created?",
    a: "You can seed a default set (HR, Finance, Operations, Sales, Marketing, Support, Legal) with one click on the AI Departments page, or let the analysis pipeline discover departments from your documents.",
  },
  {
    q: "Can multiple people use the same workspace?",
    a: "Yes — every workspace is an organization. Team management and role-based access are on the roadmap.",
  },
];

function Help() {
  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <Logo />
          <Button asChild variant="ghost" size="sm">
            <Link to="/">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-16">
        <div className="max-w-2xl">
          <span className="inline-flex items-center rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground">
            Help Center
          </span>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Get productive with CortexOS
          </h1>
          <p className="mt-3 text-muted-foreground">
            Quick answers, guides, and a starting point for your first live demo.
          </p>
        </div>

        {/* Quick start */}
        <section className="mt-12 grid gap-4 sm:grid-cols-2">
          <Card
            icon={Rocket}
            title="Quick start"
            body="Sign in, complete onboarding, upload a document, then head to AI Task Center to ask your first question."
            cta={<Link to="/auth" search={{ mode: "signup" }}>Create your workspace →</Link>}
          />
          <Card
            icon={Sparkles}
            title="What makes CortexOS different"
            body="It is not a chatbot. Every answer cites its sources, references your policies, and can pass through human approval."
            cta={<Link to="/">Read the pitch →</Link>}
          />
        </section>

        {/* Getting started */}
        <section className="mt-12">
          <h2 className="mb-4 text-lg font-semibold">Getting started</h2>
          <ol className="space-y-3">
            {[
              "Create an account and complete the short onboarding flow.",
              "Upload one or more company documents in Knowledge Hub.",
              "Watch the staged AI analysis extract departments, policies, and processes.",
              "Seed the AI Departments (HR, Finance, Ops, …) with one click.",
              "Ask your first question in AI Task Center and expand the Reasoning panel.",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                  {i + 1}
                </span>
                <p className="text-sm">{step}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* FAQ */}
        <section className="mt-12">
          <h2 className="mb-4 text-lg font-semibold">Frequently asked questions</h2>
          <Accordion type="single" collapsible className="rounded-xl border border-border bg-card px-4">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border-border">
                <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* Support */}
        <section className="mt-12 rounded-2xl border border-border bg-gradient-to-br from-primary/5 via-card to-card p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Mail className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-semibold">Need more help?</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Dedicated support and Slack integration are on the roadmap. In the meantime, reach us
                through your CortexOS workspace or contact your account owner.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function Card({
  icon: Icon,
  title,
  body,
  cta,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
  cta?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
      {cta && <div className="mt-3 text-sm text-primary hover:underline">{cta}</div>}
    </div>
  );
}
