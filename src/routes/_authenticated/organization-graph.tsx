import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Network } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/layout/EmptyState";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/organization-graph")({
  component: OrganizationGraph,
});

type Entity = {
  id: string;
  entity_type: string;
  name: string;
  description: string | null;
};

const TYPE_COLORS: Record<string, string> = {
  department: "hsl(var(--primary))",
  role: "hsl(var(--accent))",
  policy: "hsl(var(--warning))",
  process: "hsl(var(--success))",
  tool: "hsl(var(--muted-foreground))",
  risk: "hsl(var(--destructive))",
  compliance: "hsl(var(--info, 220 90% 55%))",
  term: "hsl(var(--muted-foreground))",
};

function OrganizationGraph() {
  const [loading, setLoading] = useState(true);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [orgName, setOrgName] = useState<string>("Organization");

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", userData.user.id)
        .maybeSingle();
      const orgId = profile?.organization_id;
      if (!orgId) return;
      const [{ data: org }, { data: ents }] = await Promise.all([
        supabase.from("organizations").select("name").eq("id", orgId).maybeSingle(),
        supabase
          .from("knowledge_entities")
          .select("id,entity_type,name,description")
          .eq("organization_id", orgId)
          .order("entity_type"),
      ]);
      if (org?.name) setOrgName(org.name);
      setEntities((ents as Entity[] | null) ?? []);
      setLoading(false);
    })();
  }, []);

  const grouped = useMemo(() => {
    const g: Record<string, Entity[]> = {};
    for (const e of entities) {
      (g[e.entity_type] ||= []).push(e);
    }
    return g;
  }, [entities]);

  const types = Object.keys(grouped);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Organization Graph"
        description="Visual map of the entities and relationships CortexOS extracted from your knowledge."
      />

      {entities.length === 0 ? (
        <EmptyState
          icon={Network}
          title="No entities yet"
          description="Upload documents and run analysis to populate the graph."
        />
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Graph</CardTitle>
              <CardDescription>
                Central organization node connected to extracted entity clusters.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GraphSVG orgName={orgName} grouped={grouped} />
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            {types.map((t) => (
              <Card key={t}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm capitalize">{t}s</CardTitle>
                    <Badge variant="secondary">{grouped[t].length}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1 text-sm">
                    {grouped[t].slice(0, 20).map((e) => (
                      <li key={e.id} className="flex items-start gap-2">
                        <span
                          className="mt-1.5 inline-block h-2 w-2 rounded-full"
                          style={{ background: TYPE_COLORS[t] ?? "hsl(var(--muted-foreground))" }}
                        />
                        <div>
                          <p className="font-medium text-foreground">{e.name}</p>
                          {e.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">{e.description}</p>
                          )}
                        </div>
                      </li>
                    ))}
                    {grouped[t].length > 20 && (
                      <li className="text-xs text-muted-foreground">+{grouped[t].length - 20} more</li>
                    )}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function GraphSVG({ orgName, grouped }: { orgName: string; grouped: Record<string, Entity[]> }) {
  const width = 800;
  const height = 520;
  const cx = width / 2;
  const cy = height / 2;
  const types = Object.keys(grouped).slice(0, 8);
  const radius = 190;

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-full" role="img" aria-label="Organization graph">
        {types.map((t, i) => {
          const angle = (i / types.length) * Math.PI * 2;
          const x = cx + Math.cos(angle) * radius;
          const y = cy + Math.sin(angle) * radius;
          const color = TYPE_COLORS[t] ?? "hsl(var(--muted-foreground))";
          const count = grouped[t].length;
          return (
            <g key={t}>
              <line x1={cx} y1={cy} x2={x} y2={y} stroke="hsl(var(--border))" strokeWidth={1.5} />
              <circle cx={x} cy={y} r={Math.min(28 + count * 2, 48)} fill={color} fillOpacity={0.15} stroke={color} strokeWidth={1.5} />
              <text x={x} y={y - 4} textAnchor="middle" fontSize={12} fontWeight={600} fill="currentColor" className="text-foreground capitalize">
                {t}
              </text>
              <text x={x} y={y + 12} textAnchor="middle" fontSize={10} fill="currentColor" className="text-muted-foreground">
                {count}
              </text>
            </g>
          );
        })}
        <circle cx={cx} cy={cy} r={54} fill="hsl(var(--primary))" fillOpacity={0.15} stroke="hsl(var(--primary))" strokeWidth={2} />
        <text x={cx} y={cy + 4} textAnchor="middle" fontSize={13} fontWeight={700} fill="currentColor" className="text-foreground">
          {truncate(orgName, 14)}
        </text>
      </svg>
    </div>
  );
}

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}
