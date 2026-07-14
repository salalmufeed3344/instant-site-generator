// AI Workforce server functions (Phase 4).
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  aggregateResponses,
  calculateConfidence,
  checkApproval,
  routeTask,
  runDepartmentStep,
  type AiDepartmentRow,
  type RoutedDepartment,
} from "@/lib/orchestration.server";

const DEFAULT_DEPARTMENTS: Array<{
  slug: string;
  name: string;
  icon: string;
  purpose: string;
  responsibilities: string[];
}> = [
  {
    slug: "human-resources",
    name: "Human Resources",
    icon: "users",
    purpose: "Manage people, policies, benefits, leave, and employee lifecycle.",
    responsibilities: [
      "Answer questions about leave and time off",
      "Explain onboarding and offboarding",
      "Clarify code of conduct and workplace policies",
      "Route hiring questions to the correct owner",
    ],
  },
  {
    slug: "finance",
    name: "Finance",
    icon: "wallet",
    purpose: "Handle budgeting, expenses, invoicing, reimbursements, and approvals.",
    responsibilities: [
      "Explain expense reimbursement policy",
      "Clarify purchase approval chains",
      "Answer budget and spending questions",
      "Guide invoicing and payment processes",
    ],
  },
  {
    slug: "sales",
    name: "Sales",
    icon: "trending-up",
    purpose: "Own the pipeline, deals, pricing, and customer acquisition.",
    responsibilities: [
      "Explain sales process and stages",
      "Clarify pricing and discount policy",
      "Route deal-desk approval questions",
    ],
  },
  {
    slug: "marketing",
    name: "Marketing",
    icon: "megaphone",
    purpose: "Handle brand, content, campaigns, and demand generation.",
    responsibilities: [
      "Explain brand and content guidelines",
      "Clarify campaign approval workflow",
      "Answer messaging and positioning questions",
    ],
  },
  {
    slug: "customer-support",
    name: "Customer Support",
    icon: "life-buoy",
    purpose: "Resolve customer issues and maintain SLAs.",
    responsibilities: [
      "Explain support tiers and escalation",
      "Clarify refund and credit policy",
      "Answer SLA and response-time questions",
    ],
  },
  {
    slug: "operations",
    name: "Operations",
    icon: "settings-2",
    purpose: "Keep the business running: processes, vendors, and internal tools.",
    responsibilities: [
      "Explain internal operating procedures",
      "Clarify vendor and procurement flow",
      "Answer facility and tooling questions",
    ],
  },
  {
    slug: "it",
    name: "IT",
    icon: "server",
    purpose: "Manage systems, access, security, and technical infrastructure.",
    responsibilities: [
      "Handle access and account requests",
      "Explain software and hardware policy",
      "Clarify security and incident response",
    ],
  },
  {
    slug: "legal",
    name: "Legal",
    icon: "scale",
    purpose: "Advise on contracts, compliance, and risk.",
    responsibilities: [
      "Explain contract review process",
      "Clarify compliance obligations",
      "Answer NDA and data-handling questions",
    ],
  },
];

/** Seed default AI departments for the current organization. */
export const seedAiDepartments = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as unknown as { supabase: any; userId: string };
    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id")
      .eq("id", userId)
      .maybeSingle();
    const orgId = profile?.organization_id as string | undefined;
    if (!orgId) throw new Error("No organization for current user");

    // Try to enrich from analyzed knowledge (Phase 3 output)
    const { data: existingDeptNames } = await supabase
      .from("departments")
      .select("name")
      .eq("organization_id", orgId);
    const analyzed = new Set(
      (existingDeptNames ?? []).map((d: { name: string }) => d.name.toLowerCase().trim()),
    );

    let inserted = 0;
    for (const tmpl of DEFAULT_DEPARTMENTS) {
      const { data: exists } = await supabase
        .from("ai_departments")
        .select("id")
        .eq("organization_id", orgId)
        .eq("slug", tmpl.slug)
        .maybeSingle();
      if (exists?.id) continue;

      const boost = analyzed.has(tmpl.name.toLowerCase()) ? 0.3 : 0;
      const { data: created, error: insErr } = await supabase
        .from("ai_departments")
        .insert({
          organization_id: orgId,
          name: tmpl.name,
          slug: tmpl.slug,
          description: tmpl.purpose,
          purpose: tmpl.purpose,
          responsibilities: tmpl.responsibilities,
          confidence: 0.5 + boost,
          status: "active",
          icon: tmpl.icon,
        })
        .select("id")
        .single();
      if (insErr || !created) continue;

      await supabase.from("department_configs").insert({
        organization_id: orgId,
        department_id: created.id,
        system_prompt: `You are the ${tmpl.name} department. ${tmpl.purpose}`,
        allowed_knowledge_sources: ["documents", "policies", "processes"],
        allowed_actions: ["answer", "explain", "reference"],
        escalation_rules: [],
        approval_requirements: [],
        available_tools: [],
        model_config: { model: "qwen-plus", temperature: 0.2 },
      });
      inserted++;
    }
    return { inserted };
  });

/** Create a manual AI department. */
export const createAiDepartment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        name: z.string().min(1),
        description: z.string().optional(),
        purpose: z.string().optional(),
        responsibilities: z.array(z.string()).default([]),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as unknown as { supabase: any; userId: string };
    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id")
      .eq("id", userId)
      .maybeSingle();
    const orgId = profile?.organization_id;
    if (!orgId) throw new Error("No organization for current user");
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || `dept-${Date.now()}`;
    const { data: created, error } = await supabase
      .from("ai_departments")
      .insert({
        organization_id: orgId,
        name: data.name,
        slug,
        description: data.description ?? null,
        purpose: data.purpose ?? null,
        responsibilities: data.responsibilities,
        confidence: 0.5,
        status: "active",
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    await supabase.from("department_configs").insert({
      organization_id: orgId,
      department_id: created.id,
      system_prompt: `You are the ${data.name} department. ${data.purpose ?? data.description ?? ""}`.trim(),
      allowed_knowledge_sources: ["documents", "policies", "processes"],
      allowed_actions: ["answer", "explain", "reference"],
      escalation_rules: [],
      approval_requirements: [],
      available_tools: [],
      model_config: { model: "qwen-plus", temperature: 0.2 },
    });
    return { id: created.id };
  });

/** Run a task: route, execute, aggregate, persist. */
export const runTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ title: z.string().min(1).max(200), request: z.string().min(3) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as unknown as { supabase: any; userId: string };
    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id")
      .eq("id", userId)
      .maybeSingle();
    const orgId = profile?.organization_id;
    if (!orgId) throw new Error("No organization for current user");

    // 1. Create task
    const { data: task, error: taskErr } = await supabase
      .from("tasks")
      .insert({
        organization_id: orgId,
        created_by: userId,
        title: data.title,
        request: data.request,
        status: "running",
      })
      .select("id")
      .single();
    if (taskErr || !task) throw new Error(taskErr?.message ?? "Failed to create task");
    const taskId = task.id as string;

    const addStep = async (stage: string, message: string, order: number) => {
      await supabase.from("task_steps").insert({
        organization_id: orgId,
        task_id: taskId,
        stage,
        message,
        status: "complete",
        order_index: order,
      });
    };

    try {
      await addStep("Understanding Request", `Received: "${data.title}"`, 0);

      // 2. Load departments
      const { data: depts } = await supabase
        .from("ai_departments")
        .select(
          "id, name, slug, description, purpose, responsibilities, status, confidence",
        )
        .eq("organization_id", orgId);

      if (!depts || depts.length === 0) {
        await supabase
          .from("tasks")
          .update({
            status: "failed",
            final_response: "No AI departments configured. Seed default departments first.",
            confidence: 0,
          })
          .eq("id", taskId);
        return { taskId, ok: false };
      }

      await addStep(
        "Selecting Department",
        `Evaluating ${depts.length} department${depts.length === 1 ? "" : "s"}...`,
        1,
      );

      const routed = await routeTask(data.request, depts as AiDepartmentRow[]);
      const chosen = routed.routed;

      await addStep(
        "Selecting Department",
        chosen.length
          ? `Selected: ${chosen.map((c) => c.department_name).join(" → ")}`
          : "No department matched.",
        2,
      );

      // Approval check
      const approval = checkApproval(data.request, routed.requires_approval);

      // 3. Gather org knowledge context (policies + processes summaries)
      await addStep("Gathering Knowledge", "Loading relevant policies and processes...", 3);
      const [{ data: policies }, { data: processes }] = await Promise.all([
        supabase
          .from("policies")
          .select("id, title, description, category")
          .eq("organization_id", orgId)
          .limit(20),
        supabase
          .from("processes")
          .select("id, name, description")
          .eq("organization_id", orgId)
          .limit(20),
      ]);
      const contextText = [
        (policies ?? []).length ? "Policies:" : "",
        ...(policies ?? []).map(
          (p: any) => `- ${p.title}${p.description ? ` — ${p.description}` : ""}`,
        ),
        (processes ?? []).length ? "\nProcesses:" : "",
        ...(processes ?? []).map(
          (p: any) => `- ${p.name}${p.description ? ` — ${p.description}` : ""}`,
        ),
      ]
        .filter(Boolean)
        .join("\n");

      await addStep("Consulting Policies", "Applying department scope and guardrails...", 4);

      // 4. Execute each department in order
      const executions: Array<{
        department: RoutedDept;
        response: string;
        confidence: number;
        durationMs: number;
      }> = [];

      type RoutedDept = (typeof chosen)[number];
      for (let i = 0; i < chosen.length; i++) {
        const r = chosen[i];
        const dept = (depts as AiDepartmentRow[]).find((d) => d.id === r.department_id);
        if (!dept) continue;
        const { data: cfg } = await supabase
          .from("department_configs")
          .select("system_prompt")
          .eq("department_id", dept.id)
          .maybeSingle();
        const step = await runDepartmentStep(
          dept,
          cfg?.system_prompt ?? null,
          data.request,
          contextText,
        );
        executions.push({ department: r, ...step });
        await supabase.from("task_executions").insert({
          organization_id: orgId,
          task_id: taskId,
          department_id: r.department_id,
          department_name: r.department_name,
          reason: r.reason,
          response: step.response,
          confidence: step.confidence,
          order_index: i,
          duration_ms: step.durationMs,
        });
      }

      await addStep("Building Response", "Merging department contributions...", 5);

      // 5. Aggregate
      const { finalResponse, confidence: aggConf } = await aggregateResponses(
        data.request,
        executions.map((e) => ({
          department_name: e.department.department_name,
          response: e.response,
        })),
      );
      const finalConfidence = calculateConfidence(chosen, executions, aggConf);

      // 6. Sources
      const sourceInserts = [
        ...(policies ?? []).slice(0, 5).map((p: any) => ({
          organization_id: orgId,
          task_id: taskId,
          source_type: "policy" as const,
          source_id: p.id,
          title: p.title,
          snippet: p.description ?? null,
        })),
        ...(processes ?? []).slice(0, 5).map((p: any) => ({
          organization_id: orgId,
          task_id: taskId,
          source_type: "process" as const,
          source_id: p.id,
          title: p.name,
          snippet: p.description ?? null,
        })),
      ];
      if (sourceInserts.length) {
        await supabase.from("task_sources").insert(sourceInserts);
      }

      // 7. Approval record
      if (approval.requires) {
        await supabase.from("approvals").insert({
          organization_id: orgId,
          task_id: taskId,
          approver_role: "Manager",
          reason: approval.reason,
          status: "pending",
        });
      }

      await addStep("Finalizing", "Task complete.", 6);

      await supabase
        .from("tasks")
        .update({
          status: "completed",
          final_response: finalResponse,
          confidence: finalConfidence,
          requires_approval: approval.requires,
          approval_status: approval.requires ? "pending" : null,
        })
        .eq("id", taskId);

      return { taskId, ok: true };
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      await supabase
        .from("tasks")
        .update({ status: "failed", final_response: message })
        .eq("id", taskId);
      await addStep("Finalizing", `Failed: ${message}`, 99);
      return { taskId, ok: false };
    }
  });

/** Approve or reject a task. */
export const decideApproval = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({ approvalId: z.string().uuid(), decision: z.enum(["approved", "rejected"]) })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as unknown as { supabase: any; userId: string };
    const { data: appr, error } = await supabase
      .from("approvals")
      .update({
        status: data.decision,
        decided_at: new Date().toISOString(),
        approver_user_id: userId,
      })
      .eq("id", data.approvalId)
      .select("task_id")
      .single();
    if (error || !appr) throw new Error(error?.message ?? "Approval not found");
    await supabase
      .from("tasks")
      .update({ approval_status: data.decision })
      .eq("id", appr.task_id);
    return { ok: true };
  });
