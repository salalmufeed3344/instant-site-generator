import { useCallback, useState } from "react";
import { UploadCloud, X, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { analyzeDocument } from "@/lib/analyze-document.functions";

const ACCEPTED = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/markdown",
];
const ACCEPT_ATTR = ".pdf,.docx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown";
const MAX_SIZE = 25 * 1024 * 1024;

export type UploadedDoc = {
  id: string;
  title: string;
  mime_type: string | null;
  file_size: number | null;
  upload_status: string;
  storage_path: string | null;
  created_at?: string;
};

type Props = {
  organizationId: string;
  onUploaded?: (doc: UploadedDoc) => void;
};

export function DocumentUploadZone({ organizationId, onUploaded }: Props) {
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const analyze = useServerFn(analyzeDocument);

  const upload = useCallback(
    async (files: File[]) => {
      for (const file of files) {
        if (!ACCEPTED.includes(file.type) && !/\.(pdf|docx|txt|md)$/i.test(file.name)) {
          toast.error(`${file.name}: unsupported file type`);
          continue;
        }
        if (file.size > MAX_SIZE) {
          toast.error(`${file.name}: exceeds 25 MB limit`);
          continue;
        }
        const key = `${Date.now()}-${file.name}`;
        setProgress((p) => ({ ...p, [key]: 10 }));
        const path = `${organizationId}/${crypto.randomUUID()}-${file.name}`;
        const { error: upErr } = await supabase.storage
          .from("company-documents")
          .upload(path, file, { contentType: file.type || undefined });
        if (upErr) {
          toast.error(`${file.name}: ${upErr.message}`);
          setProgress((p) => {
            const n = { ...p };
            delete n[key];
            return n;
          });
          continue;
        }
        setProgress((p) => ({ ...p, [key]: 70 }));
        const { data: row, error: rowErr } = await supabase
          .from("documents")
          .insert({
            organization_id: organizationId,
            title: file.name,
            file_url: path,
            storage_path: path,
            mime_type: file.type || null,
            file_size: file.size,
            upload_status: "uploaded",
          })
          .select("id, title, mime_type, file_size, upload_status, storage_path, created_at")
          .single();

        if (rowErr || !row) {
          toast.error(`${file.name}: ${rowErr?.message ?? "failed to save"}`);
          setProgress((p) => {
            const n = { ...p };
            delete n[key];
            return n;
          });
          continue;
        }
        await supabase.from("knowledge_sources").insert({
          organization_id: organizationId,
          title: row.title,
          category: "document",
          status: "ready",
          reference_id: row.id,
        });
        setProgress((p) => {
          const n = { ...p };
          delete n[key];
          return n;
        });
        toast.success(`${file.name} uploaded. Analyzing…`);
        onUploaded?.(row as UploadedDoc);
        // Fire and forget: kick off Qwen analysis
        void analyze({ data: { documentId: row.id } })
          .then((res) => {
            if (res?.ok) toast.success(`${file.name}: knowledge extracted`);
            else toast.warning(`${file.name}: analysis finished with warnings`);
          })
          .catch((e) => toast.error(`Analysis failed: ${e instanceof Error ? e.message : String(e)}`));
      }
    },
    [organizationId, onUploaded, analyze],
  );

  return (
    <div>
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const files = Array.from(e.dataTransfer.files);
          if (files.length) void upload(files);
        }}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 text-center transition ${
          dragging ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-muted/40"
        }`}
      >
        <UploadCloud className="h-8 w-8 text-muted-foreground" />
        <p className="mt-3 text-sm font-medium text-foreground">
          Drag & drop or click to upload
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          PDF, DOCX, TXT, Markdown · up to 25 MB
        </p>
        <input
          type="file"
          multiple
          accept={ACCEPT_ATTR}
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            if (files.length) void upload(files);
            e.target.value = "";
          }}
        />
        <Button type="button" variant="outline" size="sm" className="mt-4 pointer-events-none">
          Choose files
        </Button>
      </label>

      {Object.entries(progress).length > 0 && (
        <ul className="mt-4 space-y-2">
          {Object.entries(progress).map(([k, v]) => (
            <li key={k} className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-xs">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="truncate flex-1">{k.split("-").slice(1).join("-")}</span>
              <span className="text-muted-foreground">{v}%</span>
              <X className="h-3 w-3 text-muted-foreground" />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
