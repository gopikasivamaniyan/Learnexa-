import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { EmptyState, LoadingState, PageHeader } from "@/components/common/states";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api, endpoints } from "@/lib/api";

type Student = { id: string; name: string; course: string; progress: number; quizAverage: number };
type Course = { id: string; title: string; code: string; progress: number };

export const Route = createFileRoute("/institution/progress")({
  head: () => ({
    meta: [
      { title: "Student Progress — Learnexa for Institutions" },
      {
        name: "description",
        content: "Track course completion and quiz performance for every student.",
      },
      { property: "og:title", content: "Student Progress — Learnexa" },
      { property: "og:description", content: "See who is on track and who needs support." },
    ],
  }),
  component: ProgressPage,
});

function ProgressPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [course, setCourse] = useState("all");

  useEffect(() => {
    Promise.all([
      api.get<{ students: Student[] }>(endpoints.institution.progress),
      api.get<{ courses: Course[] }>(endpoints.institution.courses),
    ])
      .then(([p, c]) => {
        setStudents(p.students);
        setCourses(c.courses);
      })
      .catch((err) => toast.error(err instanceof Error ? err.message : "Could not load progress"))
      .finally(() => setLoading(false));
  }, []);

  const visible = useMemo(
    () =>
      students.filter(
        (s) =>
          s.name.toLowerCase().includes(query.toLowerCase()) &&
          (course === "all" || s.course === course),
      ),
    [query, course],
  );

  const courseNames = [...new Set(students.map((s) => s.course))];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Progress"
        description="Completion and performance across all enrolled students."
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search students…"
            className="pl-9"
            aria-label="Search students"
          />
        </div>
        <Select value={course} onValueChange={setCourse}>
          <SelectTrigger className="sm:w-56" aria-label="Filter by course">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All courses</SelectItem>
            {courseNames.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <LoadingState label="Loading progress…" />
      ) : visible.length === 0 ? (
        <EmptyState
          title="No matching students"
          description="Adjust your filters to see results."
        />
      ) : (
        <div className="card-surface overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead className="hidden sm:table-cell">Course</TableHead>
                <TableHead className="w-48">Course completion</TableHead>
                <TableHead>Quiz average</TableHead>
                <TableHead>Standing</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="text-sm font-medium">{s.name}</TableCell>
                  <TableCell className="hidden text-sm sm:table-cell">{s.course}</TableCell>
                  <TableCell>
                    <Progress value={s.progress} className="h-2" />
                    <span className="text-muted-foreground text-xs">{s.progress}%</span>
                  </TableCell>
                  <TableCell className="text-sm font-medium">{s.quizAverage}%</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={
                        s.quizAverage >= 80
                          ? "bg-success/15 text-success-foreground rounded-full"
                          : s.quizAverage >= 65
                            ? "bg-warning/20 text-warning-foreground rounded-full"
                            : "bg-destructive/10 text-destructive rounded-full"
                      }
                    >
                      {s.quizAverage >= 80 ? "On track" : s.quizAverage >= 65 ? "Watch" : "At risk"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        {courses.map((c) => (
          <div key={c.id} className="card-surface p-4">
            <p className="text-sm font-medium">{c.code}</p>
            <p className="text-muted-foreground truncate text-xs">{c.title}</p>
            <Progress value={c.progress} className="mt-3 h-2" />
            <p className="text-muted-foreground mt-1 text-xs">{c.progress}% average completion</p>
          </div>
        ))}
      </div>
    </div>
  );
}
