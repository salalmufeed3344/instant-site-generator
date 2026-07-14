import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Users, Search, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/layout/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/departments")({
  component: Departments,
});

type Dept = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
};

function Departments() {
  const [items, setItems] = useState<Dept[]>([]);
  const [loading, setLoading] = useState(true);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"name" | "created_at">("name");
  const [editing, setEditing] = useState<Dept | null>(null);
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Dept | null>(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [saving, setSaving] = useState(false);

  async function load() {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id")
      .eq("id", userData.user.id)
      .maybeSingle();
    if (!profile?.organization_id) {
      setLoading(false);
      return;
    }
    setOrgId(profile.organization_id);
    const { data } = await supabase
      .from("departments")
      .select("id,name,description,created_at")
      .eq("organization_id", profile.organization_id)
      .order("name");
    setItems((data ?? []) as Dept[]);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  function openCreate() {
    setForm({ name: "", description: "" });
    setEditing(null);
    setCreating(true);
  }

  function openEdit(d: Dept) {
    setForm({ name: d.name, description: d.description ?? "" });
    setEditing(d);
    setCreating(true);
  }

  async function save() {
    if (!orgId || !form.name.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        const { error } = await supabase
          .from("departments")
          .update({ name: form.name.trim(), description: form.description.trim() || null })
          .eq("id", editing.id);
        if (error) throw error;
        toast.success("Department updated");
      } else {
        const { error } = await supabase.from("departments").insert({
          organization_id: orgId,
          name: form.name.trim(),
          description: form.description.trim() || null,
        });
        if (error) throw error;
        toast.success("Department created");
      }
      setCreating(false);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  async function del() {
    if (!confirmDelete) return;
    const { error } = await supabase.from("departments").delete().eq("id", confirmDelete.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Department deleted");
    setConfirmDelete(null);
    await load();
  }

  const filtered = items
    .filter((d) =>
      query.trim() === "" ? true : d.name.toLowerCase().includes(query.toLowerCase()),
    )
    .sort((a, b) =>
      sort === "name"
        ? a.name.localeCompare(b.name)
        : b.created_at.localeCompare(a.created_at),
    );

  return (
    <div className="space-y-8">
      <PageHeader
        title="Departments"
        description="Model your organization structure. Each department will scope agents and memory in later phases."
        actions={
          <Button size="sm" onClick={openCreate}>
            <Plus className="mr-1.5 h-4 w-4" /> New department
          </Button>
        }
      />

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-28" />)}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No departments yet"
          description="Create departments manually or apply an industry template to get started."
          action={
            <Button size="sm" onClick={openCreate}>
              <Plus className="mr-1.5 h-4 w-4" /> Create first department
            </Button>
          }
        />
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search departments…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={sort} onValueChange={(v) => setSort(v as "name" | "created_at")}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Sort: Name</SelectItem>
                <SelectItem value="created_at">Sort: Newest</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((d) => (
              <Card key={d.id} className="group">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-sm">{d.name}</CardTitle>
                    <div className="flex opacity-0 transition group-hover:opacity-100">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(d)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setConfirmDelete(d)}>
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-muted-foreground line-clamp-2 min-h-8">
                    {d.description ?? "No description."}
                  </p>
                  <div className="flex justify-between text-[11px] text-muted-foreground">
                    <span>0 members</span>
                    <span>0 sources</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit department" : "New department"}</DialogTitle>
            <DialogDescription>Give it a name and a short description.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="dname">Name</Label>
              <Input
                id="dname"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Engineering"
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ddesc">Description</Label>
              <Textarea
                id="ddesc"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="What this team is responsible for."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreating(false)}>Cancel</Button>
            <Button onClick={save} disabled={!form.name.trim() || saving}>
              {saving ? "Saving…" : editing ? "Save changes" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete department?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDelete?.name} will be permanently removed. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={del} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
