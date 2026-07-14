import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, Upload } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/layout/EmptyState";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/knowledge")({
  component: Knowledge,
});

function Knowledge() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Knowledge"
        description="Your organization's documents, policies, and reference material."
        actions={
          <Button size="sm">
            <Upload className="mr-1.5 h-4 w-4" />
            Upload document
          </Button>
        }
      />
      <EmptyState
        icon={BookOpen}
        title="No documents yet"
        description="Upload PDFs, playbooks, and policies. In Phase 2, agents will read and reason over them."
        action={
          <Button size="sm">
            <Upload className="mr-1.5 h-4 w-4" />
            Upload your first document
          </Button>
        }
      />
    </div>
  );
}
