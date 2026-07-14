import { createFileRoute } from "@tanstack/react-router";
import { Brain } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/layout/EmptyState";

export const Route = createFileRoute("/_authenticated/memory")({
  component: Memory,
});

function Memory() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Memory"
        description="A durable record of decisions, context, and shared understanding."
      />
      <EmptyState
        icon={Brain}
        title="Memory is empty"
        description="Long-term organizational memory begins recording once agents and workflows are activated in Phase 2."
      />
    </div>
  );
}
