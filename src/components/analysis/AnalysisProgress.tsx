import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type AnalysisStage = {
  key: string;
  label: string;
  description: string;
};

export const DEFAULT_STAGES: AnalysisStage[] = [
  { key: "reading", label: "Reading Documents", description: "Parsing content across your uploads." },
  { key: "understanding", label: "Understanding Organization", description: "Building an organizational picture." },
  { key: "departments", label: "Identifying Departments", description: "Detecting functional teams." },
  { key: "policies", label: "Extracting Policies", description: "Capturing rules & guardrails." },
  { key: "processes", label: "Mapping Processes", description: "Reconstructing workflows." },
  { key: "memory", label: "Building Organization Memory", description: "Linking decisions & entities." },
  { key: "workforce", label: "Preparing AI Workforce", description: "Priming department agents." },
  { key: "finalizing", label: "Finalizing", description: "Wrapping up the analysis." },
];

type Props = {
  stages?: AnalysisStage[];
  /** If provided, drives progress externally (0..stages.length). Otherwise auto-animates. */
  activeIndex?: number;
  /** When true, marks all stages complete. */
  complete?: boolean;
  intervalMs?: number;
};

export function AnalysisProgress({
  stages = DEFAULT_STAGES,
  activeIndex,
  complete,
  intervalMs = 900,
}: Props) {
  const [internal, setInternal] = useState(0);
  const controlled = typeof activeIndex === "number";
  const idx = complete ? stages.length : controlled ? activeIndex! : internal;

  useEffect(() => {
    if (controlled || complete) return;
    const id = setInterval(() => {
      setInternal((v) => (v < stages.length ? v + 1 : v));
    }, intervalMs);
    return () => clearInterval(id);
  }, [controlled, complete, intervalMs, stages.length]);

  const pct = Math.min(100, Math.round((idx / stages.length) * 100));

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold">AI Analysis in Progress</h3>
          <p className="text-sm text-muted-foreground">
            CortexOS is transforming your documents into structured intelligence.
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-semibold tabular-nums">{pct}%</div>
          <div className="text-xs text-muted-foreground">
            {complete ? "Complete" : `${Math.min(idx + 1, stages.length)} / ${stages.length} stages`}
          </div>
        </div>
      </div>

      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>

      <ol className="mt-6 space-y-3">
        {stages.map((s, i) => {
          const done = i < idx;
          const active = i === idx && !complete;
          return (
            <li
              key={s.key}
              className={cn(
                "flex items-start gap-3 rounded-lg border border-transparent p-2 transition-colors",
                active && "border-primary/20 bg-primary/5",
              )}
            >
              <div
                className={cn(
                  "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs",
                  done && "border-success bg-success/10 text-success",
                  active && "border-primary bg-primary/10 text-primary",
                  !done && !active && "border-border text-muted-foreground",
                )}
              >
                {done ? (
                  <Check className="h-3.5 w-3.5" />
                ) : active ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <span>{i + 1}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div
                  className={cn(
                    "text-sm font-medium",
                    active ? "text-foreground" : done ? "text-foreground/90" : "text-muted-foreground",
                  )}
                >
                  {s.label}
                </div>
                <div className="text-xs text-muted-foreground">{s.description}</div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
