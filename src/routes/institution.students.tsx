import { createFileRoute } from "@tanstack/react-router";
import { Ban, Eye, MoreVertical, Plus, Search, ShieldCheck, Trash2, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { EmptyState, LoadingState, PageHeader } from "@/components/common/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

type Student = {
  id: string;
  name: string;
  email: string;
  course: string;
  progress: number;
  quizAverage: number;
  status: "active" | "blocked";
};

export const Route = createFileRoute("/institution/students")({
  head: () => ({
    meta: [
      { title: "Students — Learnexa for Institutions" },
      {
        name: "description",
        content: "Add, view, block and manage every student account in your institution.",
      },
      { property: "og:title", content: "Students — Learnexa for Institutions" },
      { property: "og:description", content: "Central student account management." },
    ],
  }),
  component: StudentsPage,
});

function StudentsPage() {
  const [items, setItems] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(false);
  const [viewing, setViewing] = useState<Student | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Student | null>(null);
  const [draft, setDraft] = useState({ name: "", email: "", course: "" });

  useEffect(() => {
    api
      .get<{ students: Student[] }>(endpoints.institution.students)
      .then((res) => setItems(res.students))
      .catch((err) => toast.error(err instanceof Error ? err.message : "Could not load students"))
      .finally(() => setLoading(false));
  }, []);

  const visible = useMemo(
    () =>
      items.filter(
        (s) =>
          s.name.toLowerCase().includes(query.toLowerCase()) ||
          s.email.toLowerCase().includes(query.toLowerCase()) ||
          s.course.toLowerCase().includes(query.toLowerCase()),
      ),
    [items, query],
  );

  const addStudent = async () => {
    if (!draft.name || !draft.email) {
      toast.error("Name and email are required");
      return;
    }
    try {
      const res = await api.post<{ student: Student }>(endpoints.institution.students, draft);
      setItems((l) => [res.student, ...l]);
      setDraft({ name: "", email: "", course: "" });
      setAdding(false);
      toast.success("Student added and invited");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add student");
    }
  };

  const toggleBlock = async (s: Student) => {
    const nextStatus = s.status === "active" ? "blocked" : "active";
    setItems((l) => l.map((x) => (x.id === s.id ? { ...x, status: nextStatus } : x)));
    try {
      await api.patch(`${endpoints.institution.students}/${s.id}`, { status: nextStatus });
      toast.success(nextStatus === "blocked" ? "Student blocked" : "Student unblocked");
    } catch (err) {
      setItems((l) => l.map((x) => (x.id === s.id ? { ...x, status: s.status } : x)));
      toast.error(err instanceof Error ? err.message : "Could not update student");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Students"
        description="Institution students are created here — they cannot self-register."
        actions={
          <Button variant="hero" onClick={() => setAdding(true)}>
            <Plus className="size-4" /> Add student
          </Button>
        }
      />

      <div className="relative max-w-md">
        <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, email or course…"
          className="pl-9"
          aria-label="Search students"
        />
      </div>

      {loading ? (
        <LoadingState label="Loading students…" />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No students found"
          description="Adjust your search or add a new student account."
        />
      ) : (
        <div className="card-surface overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead className="hidden md:table-cell">Course</TableHead>
                <TableHead className="hidden lg:table-cell">Progress</TableHead>
                <TableHead>Quiz avg</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <p className="text-sm font-medium">{s.name}</p>
                    <p className="text-muted-foreground text-xs">{s.email}</p>
                  </TableCell>
                  <TableCell className="hidden text-sm md:table-cell">{s.course}</TableCell>
                  <TableCell className="hidden w-40 lg:table-cell">
                    <Progress value={s.progress} className="h-2" />
                    <span className="text-muted-foreground text-xs">{s.progress}%</span>
                  </TableCell>
                  <TableCell className="text-sm font-medium">{s.quizAverage}%</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={
                        s.status === "active"
                          ? "bg-success/15 text-success-foreground rounded-full"
                          : "bg-destructive/10 text-destructive rounded-full"
                      }
                    >
                      {s.status === "active" ? "Active" : "Blocked"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${s.name}`}>
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setViewing(s)}>
                          <Eye className="mr-2 size-4" /> View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleBlock(s)}>
                          {s.status === "active" ? (
                            <>
                              <Ban className="mr-2 size-4" /> Block
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="mr-2 size-4" /> Unblock
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setPendingDelete(s)}
                        >
                          <Trash2 className="mr-2 size-4" /> Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={adding} onOpenChange={setAdding}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a student</DialogTitle>
            <DialogDescription>
              The student receives login credentials by email. Self-registration stays disabled.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="s-name">Full name</Label>
              <Input
                id="s-name"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="s-email">Email</Label>
              <Input
                id="s-email"
                type="email"
                value={draft.email}
                onChange={(e) => setDraft({ ...draft, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="s-course">Course</Label>
              <Input
                id="s-course"
                value={draft.course}
                onChange={(e) => setDraft({ ...draft, course: e.target.value })}
                placeholder="B.Tech CSE"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdding(false)}>
              Cancel
            </Button>
            <Button variant="hero" onClick={addStudent}>
              Add student
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{viewing?.name}</DialogTitle>
            <DialogDescription>{viewing?.email}</DialogDescription>
          </DialogHeader>
          {viewing && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Detail label="Course" value={viewing.course} />
              <Detail label="Status" value={viewing.status === "active" ? "Active" : "Blocked"} />
              <Detail label="Progress" value={`${viewing.progress}%`} />
              <Detail label="Quiz average" value={`${viewing.quizAverage}%`} />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this student?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete?.name} will lose access to Learnexa and their institution data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!pendingDelete) return;
                try {
                  await api.delete(`${endpoints.institution.students}/${pendingDelete.id}`);
                  setItems((l) => l.filter((x) => x.id !== pendingDelete.id));
                  toast.success("Student removed");
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Could not remove student");
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

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted/50 rounded-xl p-3">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}
