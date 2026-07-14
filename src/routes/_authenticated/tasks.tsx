import { createFileRoute } from "@tanstack/react-router";
import { ListChecks, Plus } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/layout/EmptyState";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/tasks")({
  component: Tasks,
});

function Tasks() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Tasks"
        description="Assign work to your team — and, in Phase 2, to AI agents."
        actions={
          <Button size="sm">
            <Plus className="mr-1.5 h-4 w-4" />
            New task
          </Button>
        }
      />
      <EmptyState
        icon={ListChecks}
        title="No tasks yet"
        description="Nothing on the board. Create a task or wait for Phase 2 to auto-generate them from workflows."
      />
    </div>
  );
}
