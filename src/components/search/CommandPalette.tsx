import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Activity,
  BookOpen,
  Bot,
  Brain,
  FileText,
  Home,
  ListChecks,
  Network,
  Shield,
  Sparkles,
  Users,
  Workflow,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type SearchRow = {
  kind: "document" | "department" | "policy" | "process" | "task" | "memory";
  label: string;
  to: string;
};

const NAV_ITEMS: { label: string; to: string; icon: React.ComponentType<{ className?: string }>; hint?: string }[] = [
  { label: "Overview", to: "/overview", icon: Home },
  { label: "Organization Health", to: "/health", icon: Activity },
  { label: "Activity Center", to: "/activity", icon: Activity },
  { label: "Knowledge Hub", to: "/knowledge", icon: BookOpen },
  { label: "AI Departments", to: "/ai-departments", icon: Bot },
  { label: "AI Task Center", to: "/ai-tasks", icon: ListChecks },
  { label: "Task History", to: "/task-history", icon: ListChecks },
  { label: "Organization Graph", to: "/organization-graph", icon: Network },
  { label: "Memory Center", to: "/memory", icon: Brain },
  { label: "Departments", to: "/departments", icon: Users },
  { label: "Templates", to: "/templates", icon: Sparkles },
  { label: "Workflows", to: "/workflows", icon: Workflow },
];

const KIND_ICON: Record<SearchRow["kind"], React.ComponentType<{ className?: string }>> = {
  document: FileText,
  department: Bot,
  policy: Shield,
  process: Workflow,
  task: ListChecks,
  memory: Brain,
};

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<SearchRow[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) {
      setQ("");
      setRows([]);
    }
  }, [open]);

  useEffect(() => {
    let cancelled = false;
    if (!open || q.trim().length < 2) {
      setRows([]);
      return;
    }
    setLoading(true);
    const term = `%${q.trim()}%`;
    (async () => {
      const [docs, depts, pols, procs, tasks, mems] = await Promise.all([
        supabase.from("documents").select("id, title").ilike("title", term).limit(5),
        supabase.from("ai_departments").select("id, slug, name").ilike("name", term).limit(5),
        supabase.from("policies").select("id, title").ilike("title", term).limit(5),
        supabase.from("processes").select("id, name").ilike("name", term).limit(5),
        supabase.from("tasks").select("id, title").ilike("title", term).limit(5),
        supabase.from("memory_items").select("id, title").ilike("title", term).limit(5),
      ]);
      if (cancelled) return;
      const out: SearchRow[] = [];
      docs.data?.forEach((d: any) => out.push({ kind: "document", label: d.title, to: `/documents/${d.id}` }));
      depts.data?.forEach((d: any) => out.push({ kind: "department", label: d.name, to: `/ai-departments/${d.slug}` }));
      pols.data?.forEach((p: any) => out.push({ kind: "policy", label: p.title, to: `/knowledge` }));
      procs.data?.forEach((p: any) => out.push({ kind: "process", label: p.name, to: `/knowledge` }));
      tasks.data?.forEach((t: any) => out.push({ kind: "task", label: t.title, to: `/ai-tasks/${t.id}` }));
      mems.data?.forEach((m: any) => out.push({ kind: "memory", label: m.title, to: `/memory` }));
      setRows(out);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [q, open]);

  const grouped = useMemo(() => {
    const g: Record<string, SearchRow[]> = {};
    rows.forEach((r) => {
      g[r.kind] = g[r.kind] || [];
      g[r.kind].push(r);
    });
    return g;
  }, [rows]);

  const go = (to: string) => {
    onOpenChange(false);
    navigate({ to });
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search workspace… (documents, departments, policies, tasks, memory)" value={q} onValueChange={setQ} />
      <CommandList>
        <CommandEmpty>{loading ? "Searching…" : q.length < 2 ? "Type at least 2 characters" : "No results"}</CommandEmpty>

        {Object.entries(grouped).map(([kind, items]) => {
          const Icon = KIND_ICON[kind as SearchRow["kind"]];
          return (
            <CommandGroup key={kind} heading={kind[0].toUpperCase() + kind.slice(1) + "s"}>
              {items.map((r, i) => (
                <CommandItem key={`${kind}-${i}`} onSelect={() => go(r.to)}>
                  <Icon className="mr-2 h-4 w-4" />
                  {r.label}
                </CommandItem>
              ))}
            </CommandGroup>
          );
        })}

        {rows.length > 0 && <CommandSeparator />}
        <CommandGroup heading="Navigate">
          {NAV_ITEMS.map((n) => (
            <CommandItem key={n.to} onSelect={() => go(n.to)}>
              <n.icon className="mr-2 h-4 w-4" />
              {n.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

export function useCommandPaletteHotkey(onOpen: () => void) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpen();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onOpen]);
}
