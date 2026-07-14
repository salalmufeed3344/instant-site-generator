import { createFileRoute } from "@tanstack/react-router";
import { Plus, Users } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/layout/EmptyState";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/departments")({
  component: Departments,
});

function Departments() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Departments"
        description="Model the structure of your organization. Departments will scope agents and memory in Phase 2."
        actions={
          <Button size="sm">
            <Plus className="mr-1.5 h-4 w-4" />
            New department
          </Button>
        }
      />
      <EmptyState
        icon={Users}
        title="No departments yet"
        description="Create departments like Engineering, Sales, or People Ops to organize knowledge and roles."
      />
    </div>
  );
}
