import { createFileRoute } from "@tanstack/react-router";
import { Plus, Workflow } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/layout/EmptyState";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/workflows")({
  component: Workflows,
});

function Workflows() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Workflows"
        description="Define how work gets done. In Phase 2, agents will execute these workflows on your behalf."
        actions={
          <Button size="sm">
            <Plus className="mr-1.5 h-4 w-4" />
            New workflow
          </Button>
        }
      />
      <EmptyState
        icon={Workflow}
        title="No workflows yet"
        description="Workflow authoring ships in Phase 2. This surface is scaffolded now so agents plug in cleanly later."
      />
    </div>
  );
}
