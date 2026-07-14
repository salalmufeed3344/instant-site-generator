import { ArrowRight, Brain, Bot, FileSearch, Shield, Sparkles, Target } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { key: "understand", label: "Understanding Request", icon: FileSearch },
  { key: "route", label: "Selecting Departments", icon: Target },
  { key: "memory", label: "Consulting Memory", icon: Brain },
  { key: "policy", label: "Reviewing Policies", icon: Shield },
  { key: "compose", label: "Preparing Response", icon: Bot },
  { key: "final", label: "Final Answer", icon: Sparkles },
];

type Props = { activeIndex?: number; complete?: boolean };

export function TaskFlowVisual({ activeIndex = 0, complete = false }: Props) {
  const active = complete ? STEPS.length : activeIndex;
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {STEPS.map((s, i) => {
          const done = i < active;
          const current = i === active && !complete;
          const Icon = s.icon;
          return (
            <div key={s.key} className="flex items-center gap-2">
              <div
                className={cn(
                  "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap",
                  done && "border-success/40 bg-success/10 text-success",
                  current && "border-primary/40 bg-primary/10 text-primary animate-pulse",
                  !done && !current && "border-border bg-muted/40 text-muted-foreground",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {s.label}
              </div>
              {i < STEPS.length - 1 && (
                <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
