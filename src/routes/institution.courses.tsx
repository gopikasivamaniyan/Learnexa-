import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, Plus, Search, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { EmptyState, LoadingState, PageHeader } from "@/components/common/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input as TextInput } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api, endpoints } from "@/lib/api";

type Course = {
  id: string;
  title: string;
  code: string;
  teacher: string;
  students: number;
  progress: number;
};

export const Route = createFileRoute("/institution/courses")({
  head: () => ({
    meta: [
      { title: "Courses — Learnexa for Institutions" },
      {
        name: "description",
        content: "Create courses, assign teachers and monitor cohort progress.",
      },
      { property: "og:title", content: "Courses — Learnexa for Institutions" },
      { property: "og:description", content: "Course catalogue and progress tracking." },
    ],
  }),
  component: CoursesPage,
});

function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ title: "", code: "", teacher: "" });

  useEffect(() => {
    api
      .get<{ courses: Course[] }>(endpoints.institution.courses)
      .then((res) => setCourses(res.courses))
      .catch((err) => toast.error(err instanceof Error ? err.message : "Could not load courses"))
      .finally(() => setLoading(false));
  }, []);

  const visible = useMemo(
    () =>
      courses.filter(
        (c) =>
          c.title.toLowerCase().includes(query.toLowerCase()) ||
          c.code.toLowerCase().includes(query.toLowerCase()),
      ),
    [courses, query],
  );

  const addCourse = async () => {
    if (!draft.title || !draft.code) {
      toast.error("Title and code are required");
      return;
    }
    try {
      const res = await api.post<{ course: Course }>(endpoints.institution.courses, draft);
      setCourses((l) => [res.course, ...l]);
      setDraft({ title: "", code: "", teacher: "" });
      setAdding(false);
      toast.success("Course created");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create course");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Courses"
        description="Everything your students are enrolled in."
        actions={
          <Button variant="hero" onClick={() => setAdding(true)}>
            <Plus className="size-4" /> New course
          </Button>
        }
      />

      <div className="relative max-w-md">
        <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search courses…"
          className="pl-9"
          aria-label="Search courses"
        />
      </div>

      {loading ? (
        <LoadingState label="Loading courses…" />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No courses found"
          description="Try another search term."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((c) => (
            <article key={c.id} className="card-surface hover-lift p-5">
              <div className="flex items-start justify-between gap-3">
                <span className="bg-primary/10 text-primary grid size-11 place-items-center rounded-2xl">
                  <BookOpen className="size-5" aria-hidden="true" />
                </span>
                <Badge variant="secondary" className="rounded-full">
                  {c.code}
                </Badge>
              </div>
              <h2 className="mt-4 text-base font-semibold">{c.title}</h2>
              <p className="text-muted-foreground mt-1 text-xs">{c.teacher}</p>
              <p className="text-muted-foreground mt-3 flex items-center gap-1.5 text-xs">
                <Users className="size-3.5" /> {c.students} students
              </p>
              <div className="mt-4">
                <div className="mb-1.5 flex justify-between text-xs">
                  <span>Average progress</span>
                  <span className="text-muted-foreground">{c.progress}%</span>
                </div>
                <Progress value={c.progress} className="h-2" />
              </div>
            </article>
          ))}
        </div>
      )}

      <Dialog open={adding} onOpenChange={setAdding}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New course</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="c-title">Title</Label>
              <TextInput
                id="c-title"
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-code">Course code</Label>
              <TextInput
                id="c-code"
                value={draft.code}
                onChange={(e) => setDraft({ ...draft, code: e.target.value })}
                placeholder="CS201"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-teacher">Teacher</Label>
              <TextInput
                id="c-teacher"
                value={draft.teacher}
                onChange={(e) => setDraft({ ...draft, teacher: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdding(false)}>
              Cancel
            </Button>
            <Button variant="hero" onClick={addCourse}>
              Create course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
