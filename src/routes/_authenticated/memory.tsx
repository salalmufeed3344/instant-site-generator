import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  Brain,
  Search,
  Pin,
  PinOff,
  Sparkles,
  RefreshCw,
  Clock,
  TrendingUp,
  Network,
  FileText,
  ShieldCheck,
  Users,
  Workflow,
  Building2,
  Gavel,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/layout/EmptyState";
import { StatCard } from "@/components/layout/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import {
  indexOrganizationMemory,
  memoryInsights,
  searchMemory,
  togglePinMemory,
} from "@/lib/memory.functions";

export const Route = createFileRoute("/_authenticated/memory")({
  component: MemoryCenter,
});

type MemoryItem = {
  id: string;
  category: string;
  title: string;
  summary: string | null;
  importance: number;
  confidence: number;
  tags: string[];
  pinned: boolean;
  reference_count: number;
  updated_at: string;
};

type Decision = {
  id: string;
  title: string;
  decision: string;
  confidence: number | null;
  departments_involved: string[];
  decided_at: string;
  status: string;
};

type TimelineEvent = {
  id: string;
  event_type: string;
  title: string;
  description: string | null;
  department_name: string | null;
  occurred_at: string;
};

const CATEGORY_ICON: Record<string, typeof FileText> = {
  organization: Building2,
  department: Users,
  policy: ShieldCheck,
  process: Workflow,
  decision: Gavel,
  document: FileText,
};

function MemoryCenter() {
  const [items, setItems] = useState<MemoryItem[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [insights, setInsights] = useState<Awaited<ReturnType<typeof memoryInsights>> | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [indexing, setIndexing] = useState(false);
  const [q, setQ] = useState("");
  const [scope, setScope] = useState<"all" | "policy" | "department" | "process" | "decision" | "document">(
    "all",
  );
  const [searchResults, setSearchResults] = useState<MemoryItem[] | null>(null);
  const [searchDebounce, setSearchDebounce] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [deptFilter, setDeptFilter] = useState<string>("all");

  const indexFn = useServerFn(indexOrganizationMemory);
  const searchFn = useServerFn(searchMemory);
  const insightsFn = useServerFn(memoryInsights);
  const togglePinFn = useServerFn(togglePinMemory);

  const load = async () => {
    setLoading(true);
    const [m, d, t, ins] = await Promise.all([
      supabase
        .from("memory_items")
        .select(
          "id, category, title, summary, importance, confidence, tags, pinned, reference_count, updated_at",
        )
        .order("importance", { ascending: false })
        .order("updated_at", { ascending: false })
        .limit(50),
      supabase
        .from("decision_history")
        .select("id, title, decision, confidence, departments_involved, decided_at, status")
        .order("decided_at", { ascending: false })
        .limit(30),
      supabase
        .from("timeline_events")
        .select("id, event_type, title, description, department_name, occurred_at")
        .order("occurred_at", { ascending: false })
        .limit(50),
      insightsFn(),
    ]);
    setItems((m.data as MemoryItem[]) ?? []);
    setDecisions((d.data as Decision[]) ?? []);
    setTimeline((t.data as TimelineEvent[]) ?? []);
    setInsights(ins);
    setLoading(false);
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runIndex = async () => {
    setIndexing(true);
    try {
      const r = await indexFn({ data: undefined as never });
      const total = r.organization + r.departments + r.policies + r.processes + r.documents;
      toast.success(`Indexed ${total} memory items (${r.links} relationships)`);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Indexing failed");
    } finally {
      setIndexing(false);
    }
  };

  const onSearchChange = (val: string) => {
    setQ(val);
    if (searchDebounce) clearTimeout(searchDebounce);
    if (!val.trim()) {
      setSearchResults(null);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const r = await searchFn({ data: { query: val.trim(), scope } });
        setSearchResults(r.results as MemoryItem[]);
      } catch {
        setSearchResults([]);
      }
    }, 350);
    setSearchDebounce(t);
  };

  const onScopeChange = (v: string) => {
    setScope(v as typeof scope);
    if (q.trim()) onSearchChange(q);
  };

  const togglePin = async (m: MemoryItem) => {
    setItems((prev) => prev.map((x) => (x.id === m.id ? { ...x, pinned: !x.pinned } : x)));
    try {
      await togglePinFn({ data: { memoryId: m.id, pinned: !m.pinned } });
    } catch {
      toast.error("Failed to update pin");
    }
  };

  const pinned = useMemo(() => items.filter((i) => i.pinned), [items]);
  const recent = useMemo(
    () =>
      [...items].sort(
        (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
      ),
    [items],
  );
  const important = useMemo(
    () => [...items].sort((a, b) => b.importance - a.importance).slice(0, 20),
    [items],
  );
  const byCategory = useMemo(() => {
    const map: Record<string, MemoryItem[]> = {};
    for (const i of items) (map[i.category] ||= []).push(i);
    return map;
  }, [items]);

  const departments = useMemo(() => {
    const set = new Set<string>();
    for (const t of timeline) if (t.department_name) set.add(t.department_name);
    return Array.from(set);
  }, [timeline]);
  const filteredTimeline = useMemo(
    () =>
      timeline.filter((t) => deptFilter === "all" || t.department_name === deptFilter),
    [timeline, deptFilter],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Memory Center"
        description="Persistent organizational intelligence — decisions, policies, relationships, and history."
        actions={
          <Button size="sm" onClick={runIndex} disabled={indexing}>
            <RefreshCw className={`mr-1.5 h-4 w-4 ${indexing ? "animate-spin" : ""}`} />
            {indexing ? "Indexing..." : "Rebuild memory"}
          </Button>
        }
      />

      {/* Insights strip */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          label="Memories"
          value={loading ? "—" : String(insights?.counts.memories ?? 0)}
          icon={Brain}
        />
        <StatCard
          label="Decisions"
          value={loading ? "—" : String(insights?.counts.decisions ?? 0)}
          icon={Gavel}
        />
        <StatCard
          label="Memory health"
          value={loading ? "—" : `${Math.round((insights?.health ?? 0) * 100)}%`}
          icon={TrendingUp}
        />
        <StatCard
          label="Completeness"
          value={loading ? "—" : `${Math.round((insights?.completeness ?? 0) * 100)}%`}
          icon={ShieldCheck}
        />
      </div>

      {/* Search bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-8"
                placeholder="Search policies, decisions, departments, documents..."
                value={q}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
            <Select value={scope} onValueChange={onScopeChange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All memory</SelectItem>
                <SelectItem value="policy">Policies</SelectItem>
                <SelectItem value="department">Departments</SelectItem>
                <SelectItem value="process">Processes</SelectItem>
                <SelectItem value="decision">Decisions</SelectItem>
                <SelectItem value="document">Documents</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {searchResults !== null && (
            <div className="mt-4">
              <p className="mb-2 text-xs text-muted-foreground">
                {searchResults.length} result{searchResults.length === 1 ? "" : "s"}
              </p>
              <MemoryList
                items={searchResults}
                onTogglePin={togglePin}
                empty="No matches."
              />
            </div>
          )}
        </CardContent>
      </Card>

      {loading && items.length === 0 ? (
        <Skeleton className="h-96" />
      ) : items.length === 0 && decisions.length === 0 ? (
        <EmptyState
          icon={Brain}
          title="Memory is empty"
          description="Build organizational memory from your existing documents, policies, departments, and processes."
          action={
            <Button onClick={runIndex} disabled={indexing}>
              <Sparkles className="mr-1.5 h-4 w-4" />
              {indexing ? "Indexing..." : "Build memory now"}
            </Button>
          }
        />
      ) : (
        <Tabs defaultValue="recent">
          <TabsList>
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="important">Important</TabsTrigger>
            <TabsTrigger value="pinned">Pinned</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="decisions">Decisions</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="graph">Graph</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="recent" className="mt-4">
            <MemoryList items={recent} onTogglePin={togglePin} />
          </TabsContent>

          <TabsContent value="important" className="mt-4">
            <MemoryList items={important} onTogglePin={togglePin} />
          </TabsContent>

          <TabsContent value="pinned" className="mt-4">
            <MemoryList items={pinned} onTogglePin={togglePin} empty="Nothing pinned yet." />
          </TabsContent>

          <TabsContent value="departments" className="mt-4">
            <MemoryList
              items={byCategory.department ?? []}
              onTogglePin={togglePin}
              empty="No department memory yet."
            />
          </TabsContent>

          <TabsContent value="decisions" className="mt-4">
            <DecisionList decisions={decisions} />
          </TabsContent>

          <TabsContent value="timeline" className="mt-4">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Filter:</span>
              <Select value={deptFilter} onValueChange={setDeptFilter}>
                <SelectTrigger className="w-56">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All departments</SelectItem>
                  {departments.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Timeline events={filteredTimeline} />
          </TabsContent>

          <TabsContent value="graph" className="mt-4">
            <RelationshipGraph items={items} />
          </TabsContent>

          <TabsContent value="insights" className="mt-4">
            <InsightsView insights={insights} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

function MemoryList({
  items,
  onTogglePin,
  empty = "No memory here yet.",
}: {
  items: MemoryItem[];
  onTogglePin: (m: MemoryItem) => void;
  empty?: string;
}) {
  if (items.length === 0)
    return <p className="py-8 text-center text-sm text-muted-foreground">{empty}</p>;
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {items.map((m) => {
        const Icon = CATEGORY_ICON[m.category] ?? FileText;
        return (
          <Card key={m.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 gap-2">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{m.title}</p>
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {m.summary ?? "—"}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <Badge variant="outline" className="capitalize">
                        {m.category}
                      </Badge>
                      {m.tags.slice(0, 3).map((t) => (
                        <Badge key={t} variant="secondary" className="text-[10px]">
                          {t}
                        </Badge>
                      ))}
                      <span className="text-[10px] text-muted-foreground">
                        · imp {(m.importance * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onTogglePin(m)}
                  aria-label={m.pinned ? "Unpin" : "Pin"}
                >
                  {m.pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function DecisionList({ decisions }: { decisions: Decision[] }) {
  if (decisions.length === 0)
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No decisions recorded yet. Run an AI task to create one.
      </p>
    );
  return (
    <div className="space-y-3">
      {decisions.map((d) => (
        <Card key={d.id}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-sm">{d.title}</CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {new Date(d.decided_at).toLocaleString()}
                </span>
                <Badge
                  variant={
                    d.status === "recorded"
                      ? "default"
                      : d.status === "pending_approval"
                        ? "secondary"
                        : "outline"
                  }
                >
                  {d.status}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="whitespace-pre-wrap text-sm">{d.decision}</p>
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {d.departments_involved.map((dept) => (
                <Badge key={dept} variant="outline">
                  {dept}
                </Badge>
              ))}
              {d.confidence != null && (
                <span className="text-muted-foreground">
                  · confidence {(d.confidence * 100).toFixed(0)}%
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function Timeline({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0)
    return <p className="py-8 text-center text-sm text-muted-foreground">No events yet.</p>;
  return (
    <ol className="relative ml-3 border-l pl-6">
      {events.map((e) => (
        <li key={e.id} className="mb-5">
          <span className="absolute -left-1.5 mt-1 h-3 w-3 rounded-full bg-primary" />
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium">{e.title}</p>
            <Badge variant="outline" className="text-[10px]">
              {e.event_type.replace(/_/g, " ")}
            </Badge>
            {e.department_name ? (
              <Badge variant="secondary" className="text-[10px]">
                {e.department_name}
              </Badge>
            ) : null}
          </div>
          <p className="text-xs text-muted-foreground">
            {new Date(e.occurred_at).toLocaleString()}
            {e.description ? ` · ${e.description}` : ""}
          </p>
        </li>
      ))}
    </ol>
  );
}

function RelationshipGraph({ items }: { items: MemoryItem[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [edges, setEdges] = useState<
    Array<{ from_memory_id: string; to_memory_id: string; relationship_type: string }>
  >([]);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("memory_relationships")
        .select("from_memory_id, to_memory_id, relationship_type")
        .limit(500);
      setEdges((data as typeof edges) ?? []);
    })();
  }, []);

  const nodes = useMemo(() => items.slice(0, 60), [items]);
  const idSet = useMemo(() => new Set(nodes.map((n) => n.id)), [nodes]);
  const validEdges = edges.filter((e) => idSet.has(e.from_memory_id) && idSet.has(e.to_memory_id));

  const width = 720;
  const height = 480;
  const cx = width / 2;
  const cy = height / 2;
  const positions = useMemo(() => {
    const groups: Record<string, MemoryItem[]> = {};
    for (const n of nodes) (groups[n.category] ||= []).push(n);
    const catList = Object.keys(groups);
    const pos: Record<string, { x: number; y: number; cat: string }> = {};
    catList.forEach((cat, i) => {
      const angle = (i / catList.length) * Math.PI * 2;
      const gx = cx + Math.cos(angle) * 180;
      const gy = cy + Math.sin(angle) * 150;
      groups[cat].forEach((n, j) => {
        const inner = (j / Math.max(1, groups[cat].length)) * Math.PI * 2;
        pos[n.id] = {
          x: gx + Math.cos(inner) * 55,
          y: gy + Math.sin(inner) * 45,
          cat,
        };
      });
    });
    return pos;
  }, [nodes, cx, cy]);

  const connected = useMemo(() => {
    if (!selected) return new Set<string>();
    const s = new Set<string>([selected]);
    for (const e of validEdges) {
      if (e.from_memory_id === selected) s.add(e.to_memory_id);
      if (e.to_memory_id === selected) s.add(e.from_memory_id);
    }
    return s;
  }, [selected, validEdges]);

  const catColor = (cat: string) => {
    const map: Record<string, string> = {
      organization: "hsl(var(--primary))",
      department: "hsl(220 70% 55%)",
      policy: "hsl(30 90% 55%)",
      process: "hsl(160 60% 45%)",
      decision: "hsl(280 65% 60%)",
      document: "hsl(210 15% 55%)",
    };
    return map[cat] ?? "hsl(var(--muted-foreground))";
  };

  if (nodes.length === 0)
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Build memory to see relationships.
      </p>
    );

  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
          <Network className="h-3.5 w-3.5" />
          {nodes.length} nodes · {validEdges.length} relationships · click a node to highlight connections
        </div>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full rounded-md border bg-muted/20"
          style={{ height: 480 }}
        >
          {validEdges.map((e, i) => {
            const a = positions[e.from_memory_id];
            const b = positions[e.to_memory_id];
            if (!a || !b) return null;
            const active =
              !selected ||
              e.from_memory_id === selected ||
              e.to_memory_id === selected;
            return (
              <line
                key={i}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke="currentColor"
                strokeOpacity={active ? 0.35 : 0.08}
                strokeWidth={active ? 1.2 : 0.6}
              />
            );
          })}
          {nodes.map((n) => {
            const p = positions[n.id];
            if (!p) return null;
            const active = !selected || connected.has(n.id);
            return (
              <g
                key={n.id}
                transform={`translate(${p.x} ${p.y})`}
                onClick={() => setSelected(selected === n.id ? null : n.id)}
                style={{ cursor: "pointer", opacity: active ? 1 : 0.25 }}
              >
                <circle r={selected === n.id ? 9 : 6} fill={catColor(p.cat)} />
                <title>{`${n.title} (${n.category})`}</title>
              </g>
            );
          })}
        </svg>
        {selected && (
          <p className="mt-2 text-xs text-muted-foreground">
            Selected: {nodes.find((n) => n.id === selected)?.title}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function InsightsView({
  insights,
}: {
  insights: Awaited<ReturnType<typeof memoryInsights>> | null;
}) {
  if (!insights) return <Skeleton className="h-64" />;
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Memory health</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="mb-1 flex justify-between text-xs text-muted-foreground">
              <span>Health score</span>
              <span>{Math.round(insights.health * 100)}%</span>
            </div>
            <Progress value={insights.health * 100} />
          </div>
          <div>
            <div className="mb-1 flex justify-between text-xs text-muted-foreground">
              <span>Organization completeness</span>
              <span>{Math.round(insights.completeness * 100)}%</span>
            </div>
            <Progress value={insights.completeness * 100} />
          </div>
          <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
            <Metric label="Docs" v={insights.counts.documents} />
            <Metric label="Policies" v={insights.counts.policies} />
            <Metric label="Depts" v={insights.counts.departments} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Memory by category</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {Object.entries(insights.by_category).length === 0 ? (
              <li className="text-muted-foreground">No indexed memory yet.</li>
            ) : (
              Object.entries(insights.by_category).map(([k, v]) => (
                <li key={k} className="flex items-center justify-between">
                  <span className="capitalize">{k}</span>
                  <Badge variant="secondary">{v}</Badge>
                </li>
              ))
            )}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Most referenced</CardTitle>
        </CardHeader>
        <CardContent>
          {insights.top_referenced.length === 0 ? (
            <p className="text-sm text-muted-foreground">No references yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {insights.top_referenced.map((m) => (
                <li key={m.id} className="flex items-center justify-between">
                  <span className="truncate">{(m as { title?: string }).title ?? m.id}</span>
                  <Badge variant="secondary">{m.reference_count}×</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Active departments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {insights.active_departments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active departments.</p>
            ) : (
              insights.active_departments.map((d) => (
                <Badge key={d} variant="outline">
                  {d}
                </Badge>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4" /> Recent activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {insights.recent_activity.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {insights.recent_activity.map((r) => {
                const row = r as {
                  id: string;
                  event_type: string;
                  occurred_at: string;
                  department_name: string | null;
                };
                return (
                  <li key={row.id} className="flex items-center justify-between">
                    <span className="capitalize">{row.event_type.replace(/_/g, " ")}</span>
                    <span className="text-xs text-muted-foreground">
                      {row.department_name ? `${row.department_name} · ` : ""}
                      {new Date(row.occurred_at).toLocaleString()}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ label, v }: { label: string; v: number }) {
  return (
    <div className="rounded-md border p-2">
      <p className="text-lg font-semibold">{v}</p>
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  );
}
