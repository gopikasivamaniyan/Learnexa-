import { createFileRoute } from "@tanstack/react-router";
import { GraduationCap, Mail, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { EmptyState, LoadingState, PageHeader } from "@/components/common/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { api, endpoints } from "@/lib/api";

type Teacher = {
  id: string;
  name: string;
  email: string;
  department: string;
  courses: number;
  students: number;
};

export const Route = createFileRoute("/institution/teachers")({
  head: () => ({
    meta: [
      { title: "Teachers — Learnexa for Institutions" },
      { name: "description", content: "Manage teaching staff, departments and course allocation." },
      { property: "og:title", content: "Teachers — Learnexa for Institutions" },
      { property: "og:description", content: "Your teaching team on Learnexa." },
    ],
  }),
  component: TeachersPage,
});

function TeachersPage() {
  const [items, setItems] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Teacher | null>(null);
  const [draft, setDraft] = useState({ name: "", email: "", department: "" });

  useEffect(() => {
    api
      .get<{ teachers: Teacher[] }>(endpoints.institution.teachers)
      .then((res) => setItems(res.teachers))
      .catch((err) => toast.error(err instanceof Error ? err.message : "Could not load teachers"))
      .finally(() => setLoading(false));
  }, []);

  const visible = useMemo(
    () =>
      items.filter(
        (t) =>
          t.name.toLowerCase().includes(query.toLowerCase()) ||
          t.department.toLowerCase().includes(query.toLowerCase()),
      ),
    [items, query],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Teachers"
        description="Faculty accounts, departments and workload at a glance."
        actions={
          <Button variant="hero" onClick={() => setAdding(true)}>
            <Plus className="size-4" /> Add teacher
          </Button>
        }
      />

      <div className="relative max-w-md">
        <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search teachers…"
          className="pl-9"
          aria-label="Search teachers"
        />
      </div>

      {loading ? (
        <LoadingState label="Loading teachers…" />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No teachers found"
          description="Try another search."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((t) => (
            <article key={t.id} className="card-surface hover-lift p-5">
              <div className="flex items-center gap-3">
                <span className="bg-gradient-brand text-primary-foreground grid size-11 place-items-center rounded-2xl text-sm font-semibold">
                  {t.name
                    .replace(/(Dr\.|Prof\.)\s*/g, "")
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-semibold">{t.name}</h2>
                  <p className="text-muted-foreground truncate text-xs">{t.department}</p>
                </div>
              </div>
              <p className="text-muted-foreground mt-3 flex items-center gap-1.5 text-xs">
                <Mail className="size-3.5" /> {t.email}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="bg-muted/50 rounded-xl p-3">
                  <p className="text-muted-foreground text-xs">Courses</p>
                  <p className="text-sm font-semibold">{t.courses}</p>
                </div>
                <div className="bg-muted/50 rounded-xl p-3">
                  <p className="text-muted-foreground text-xs">Students</p>
                  <p className="text-sm font-semibold">{t.students}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive mt-3"
                onClick={() => setPendingDelete(t)}
              >
                <Trash2 className="size-3.5" /> Remove
              </Button>
            </article>
          ))}
        </div>
      )}

      <Dialog open={adding} onOpenChange={setAdding}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a teacher</DialogTitle>
            <DialogDescription>They will receive an invitation by email.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="t-name">Full name</Label>
              <Input
                id="t-name"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="t-email">Email</Label>
              <Input
                id="t-email"
                type="email"
                value={draft.email}
                onChange={(e) => setDraft({ ...draft, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="t-dept">Department</Label>
              <Input
                id="t-dept"
                value={draft.department}
                onChange={(e) => setDraft({ ...draft, department: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdding(false)}>
              Cancel
            </Button>
            <Button
              variant="hero"
              onClick={async () => {
                if (!draft.name || !draft.email) {
                  toast.error("Name and email are required");
                  return;
                }
                try {
                  const res = await api.post<{ teacher: Teacher }>(
                    endpoints.institution.teachers,
                    draft,
                  );
                  setItems((l) => [res.teacher, ...l]);
                  setDraft({ name: "", email: "", department: "" });
                  setAdding(false);
                  toast.success("Teacher invited");
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Could not add teacher");
                }
              }}
            >
              Add teacher
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this teacher?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete?.name} will lose access to their courses and materials.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!pendingDelete) return;
                try {
                  await api.delete(`${endpoints.institution.teachers}/${pendingDelete.id}`);
                  setItems((l) => l.filter((x) => x.id !== pendingDelete.id));
                  toast.success("Teacher removed");
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Could not remove teacher");
                } finally {
                  setPendingDelete(null);
                }
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
