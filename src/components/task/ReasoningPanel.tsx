import { useState } from "react";
import { ChevronDown, BookOpen, Shield, Bot, FileText, Brain, Clock, Gauge } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export type ReasoningData = {
  confidence?: number | null;
  knowledgeSources?: string[];
  policies?: string[];
  departments?: string[];
  documents?: string[];
  memoryReferences?: string[];
  timeline?: { label: string; at?: string | null }[];
};

type Props = {
  data: ReasoningData;
  defaultOpen?: boolean;
};

export function ReasoningPanel({ data, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const confidence = typeof data.confidence === "number" ? Math.round(data.confidence * 100) : null;

  const sections: { icon: React.ComponentType<{ className?: string }>; label: string; items?: string[] }[] = [
    { icon: BookOpen, label: "Knowledge Sources", items: data.knowledgeSources },
    { icon: Shield, label: "Policies Referenced", items: data.policies },
    { icon: Bot, label: "Departments Consulted", items: data.departments },
    { icon: FileText, label: "Documents Analyzed", items: data.documents },
    { icon: Brain, label: "Memory References", items: data.memoryReferences },
  ];

  return (
    <div className="rounded-xl border border-border bg-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2">
          <Gauge className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Reasoning & Transparency</span>
          {confidence !== null && (
            <Badge variant="secondary" className="ml-1">
              {confidence}% confidence
            </Badge>
          )}
        </div>
        <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="border-t border-border px-4 py-4">
          <div className="grid gap-4 md:grid-cols-2">
            {sections.map(({ icon: Icon, label, items }) => (
              <div key={label} className="rounded-lg border border-border/60 bg-background/50 p-3">
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </div>
                {items && items.length > 0 ? (
                  <ul className="space-y-1 text-sm">
                    {items.slice(0, 6).map((item, i) => (
                      <li key={i} className="truncate">
                        • {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground">None recorded</p>
                )}
              </div>
            ))}
          </div>

          {data.timeline && data.timeline.length > 0 && (
            <div className="mt-4 rounded-lg border border-border/60 bg-background/50 p-3">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                Execution Timeline
              </div>
              <ol className="space-y-1.5 text-sm">
                {data.timeline.map((t, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <span className="flex-1">{t.label}</span>
                    {t.at && (
                      <span className="text-xs tabular-nums text-muted-foreground">
                        {new Date(t.at).toLocaleTimeString()}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
