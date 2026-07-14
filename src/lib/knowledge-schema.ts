// Client-safe schema types for structured extraction. Shared between server
// extractors and UI rendering.

export type ExtractedPolicy = {
  title: string;
  description?: string;
  category?: string;
  rules?: string[];
  confidence?: number;
};

export type ExtractedRole = {
  title: string;
  department?: string;
  description?: string;
  responsibilities?: string[];
  confidence?: number;
};

export type ExtractedProcess = {
  name: string;
  description?: string;
  steps?: string[];
  triggers?: string[];
  outputs?: string[];
  confidence?: number;
};

export type ExtractedApprovalChain = {
  name: string;
  description?: string;
  steps?: { role?: string; approver?: string; condition?: string }[];
  confidence?: number;
};

export type ExtractedDepartment = {
  name: string;
  description?: string;
  confidence?: number;
};

export type ExtractedKnowledge = {
  summary: string;
  organization?: {
    mission?: string;
    vision?: string;
    values?: string[];
  };
  departments: ExtractedDepartment[];
  roles: ExtractedRole[];
  policies: ExtractedPolicy[];
  processes: ExtractedProcess[];
  approval_chains: ExtractedApprovalChain[];
  decision_points: string[];
  important_dates: { label: string; date?: string }[];
  contacts: { name?: string; role?: string; contact?: string }[];
  tools: string[];
  risks: string[];
  compliance: string[];
  terms: string[];
  unknowns: string[];
  confidence: number;
};

export const EMPTY_KNOWLEDGE: ExtractedKnowledge = {
  summary: "",
  departments: [],
  roles: [],
  policies: [],
  processes: [],
  approval_chains: [],
  decision_points: [],
  important_dates: [],
  contacts: [],
  tools: [],
  risks: [],
  compliance: [],
  terms: [],
  unknowns: [],
  confidence: 0,
};

function arr<T>(v: unknown, mapper: (x: unknown) => T | null): T[] {
  if (!Array.isArray(v)) return [];
  return v.map(mapper).filter((x): x is T => x !== null);
}

function str(v: unknown): string | undefined {
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}

function strArr(v: unknown): string[] {
  return arr(v, (x) => str(x) ?? null);
}

function num(v: unknown): number | undefined {
  return typeof v === "number" && !Number.isNaN(v) ? v : undefined;
}

export function validateKnowledge(input: unknown): ExtractedKnowledge {
  const o = (input ?? {}) as Record<string, unknown>;
  return {
    summary: str(o.summary) ?? "",
    organization: (() => {
      const org = (o.organization ?? {}) as Record<string, unknown>;
      const out: ExtractedKnowledge["organization"] = {};
      if (str(org.mission)) out.mission = str(org.mission);
      if (str(org.vision)) out.vision = str(org.vision);
      const values = strArr(org.values);
      if (values.length) out.values = values;
      return Object.keys(out).length ? out : undefined;
    })(),
    departments: arr(o.departments, (x) => {
      const d = (x ?? {}) as Record<string, unknown>;
      const name = str(d.name);
      if (!name) return null;
      return { name, description: str(d.description), confidence: num(d.confidence) };
    }),
    roles: arr(o.roles, (x) => {
      const r = (x ?? {}) as Record<string, unknown>;
      const title = str(r.title);
      if (!title) return null;
      return {
        title,
        department: str(r.department),
        description: str(r.description),
        responsibilities: strArr(r.responsibilities),
        confidence: num(r.confidence),
      };
    }),
    policies: arr(o.policies, (x) => {
      const p = (x ?? {}) as Record<string, unknown>;
      const title = str(p.title);
      if (!title) return null;
      return {
        title,
        description: str(p.description),
        category: str(p.category),
        rules: strArr(p.rules),
        confidence: num(p.confidence),
      };
    }),
    processes: arr(o.processes, (x) => {
      const p = (x ?? {}) as Record<string, unknown>;
      const name = str(p.name);
      if (!name) return null;
      return {
        name,
        description: str(p.description),
        steps: strArr(p.steps),
        triggers: strArr(p.triggers),
        outputs: strArr(p.outputs),
        confidence: num(p.confidence),
      };
    }),
    approval_chains: arr(o.approval_chains, (x) => {
      const a = (x ?? {}) as Record<string, unknown>;
      const name = str(a.name);
      if (!name) return null;
      const steps = arr(a.steps, (s) => {
        const ss = (s ?? {}) as Record<string, unknown>;
        const role = str(ss.role);
        const approver = str(ss.approver);
        const condition = str(ss.condition);
        if (!role && !approver && !condition) return null;
        return { role, approver, condition };
      });
      return {
        name,
        description: str(a.description),
        steps,
        confidence: num(a.confidence),
      };
    }),
    decision_points: strArr(o.decision_points),
    important_dates: arr(o.important_dates, (x) => {
      const d = (x ?? {}) as Record<string, unknown>;
      const label = str(d.label);
      if (!label) return null;
      return { label, date: str(d.date) };
    }),
    contacts: arr(o.contacts, (x) => {
      const c = (x ?? {}) as Record<string, unknown>;
      const name = str(c.name);
      const role = str(c.role);
      const contact = str(c.contact);
      if (!name && !role && !contact) return null;
      return { name, role, contact };
    }),
    tools: strArr(o.tools),
    risks: strArr(o.risks),
    compliance: strArr(o.compliance),
    terms: strArr(o.terms),
    unknowns: strArr(o.unknowns),
    confidence: num(o.confidence) ?? 0.5,
  };
}

export function mergeKnowledge(parts: ExtractedKnowledge[]): ExtractedKnowledge {
  if (parts.length === 0) return { ...EMPTY_KNOWLEDGE };
  if (parts.length === 1) return parts[0];
  const dedup = <T>(list: T[], key: (t: T) => string) => {
    const seen = new Map<string, T>();
    for (const item of list) {
      const k = key(item).toLowerCase().trim();
      if (!k) continue;
      if (!seen.has(k)) seen.set(k, item);
    }
    return Array.from(seen.values());
  };
  const merged: ExtractedKnowledge = {
    summary: parts.map((p) => p.summary).filter(Boolean).join("\n\n"),
    organization: parts.find((p) => p.organization)?.organization,
    departments: dedup(parts.flatMap((p) => p.departments), (d) => d.name),
    roles: dedup(parts.flatMap((p) => p.roles), (r) => r.title),
    policies: dedup(parts.flatMap((p) => p.policies), (p) => p.title),
    processes: dedup(parts.flatMap((p) => p.processes), (p) => p.name),
    approval_chains: dedup(parts.flatMap((p) => p.approval_chains), (a) => a.name),
    decision_points: Array.from(new Set(parts.flatMap((p) => p.decision_points))),
    important_dates: dedup(parts.flatMap((p) => p.important_dates), (d) => d.label),
    contacts: dedup(parts.flatMap((p) => p.contacts), (c) => `${c.name ?? ""}|${c.role ?? ""}`),
    tools: Array.from(new Set(parts.flatMap((p) => p.tools))),
    risks: Array.from(new Set(parts.flatMap((p) => p.risks))),
    compliance: Array.from(new Set(parts.flatMap((p) => p.compliance))),
    terms: Array.from(new Set(parts.flatMap((p) => p.terms))),
    unknowns: Array.from(new Set(parts.flatMap((p) => p.unknowns))),
    confidence:
      parts.reduce((s, p) => s + (p.confidence ?? 0), 0) / parts.length,
  };
  return merged;
}
