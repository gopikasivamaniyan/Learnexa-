import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, GraduationCap, Target, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { StatCard } from "@/components/common/StatCard";
import { LoadingState, PageHeader } from "@/components/common/states";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { api, endpoints, getStoredUser } from "@/lib/api";

type Stat = { id: string; label: string; value: string; delta: string; trend: "up" | "down" };
type Course = {
  id: string;
  title: string;
  code: string;
  teacher: string;
  students: number;
  progress: number;
};
type Student = { id: string; name: string; course: string; quizAverage: number };

export const Route = createFileRoute("/institution/")({
  head: () => ({
    meta: [
      { title: "Institution Dashboard — Learnexa" },
      {
        name: "description",
        content:
          "Monitor students, courses, progress and quiz performance across your institution.",
      },
      { property: "og:title", content: "Institution Dashboard — Learnexa" },
      { property: "og:description", content: "Cohort-level learning insight for institutions." },
    ],
  }),
  component: InstitutionDashboard,
});

const icons = [Users, TrendingUp, BookOpen, Target, GraduationCap];

function InstitutionDashboard() {
  const user = getStoredUser();
  const [stats, setStats] = useState<Stat[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ stats: Stat[]; courses: Course[]; students: Student[] }>(
        endpoints.institution.dashboard,
      )
      .then((res) => {
        setStats(res.stats);
        setCourses(res.courses);
        setStudents(res.students);
      })
      .catch((err) =>
        toast.error(err instanceof Error ? err.message : "Could not load the dashboard"),
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState label="Loading institution dashboard…" />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Institution Dashboard"
        description={`${user?.name ?? "Your institution"} · Academic year 2026`}
        actions={
          <Button variant="hero" asChild>
            <Link to="/institution/students">Manage students</Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((s, i) => (
          <StatCard
            key={s.id}
            label={s.label}
            value={s.value}
            delta={s.delta}
            trend={s.trend}
            icon={icons[i]!}
            tone={(["primary", "accent", "success", "info", "warning"] as const)[i % 5]!}
          />
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="card-surface p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Course progress</h2>
            <Link
              to="/institution/courses"
              className="text-primary inline-flex items-center gap-1 text-xs font-medium hover:underline"
            >
              All courses <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <div className="space-y-4">
            {courses.length === 0 && (
              <p className="text-muted-foreground text-sm">No courses yet.</p>
            )}
            {courses.map((c) => (
              <div key={c.id}>
                <div className="mb-1.5 flex justify-between text-xs">
                  <span className="font-medium">
                    {c.code} · {c.title}
                  </span>
                  <span className="text-muted-foreground">{c.progress}%</span>
                </div>
                <Progress value={c.progress} className="h-2" />
              </div>
            ))}
          </div>
        </section>

        <section className="card-surface p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Top performing students</h2>
            <Link
              to="/institution/students"
              className="text-primary inline-flex items-center gap-1 text-xs font-medium hover:underline"
            >
              All students <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {[...students]
              .sort((a, b) => b.quizAverage - a.quizAverage)
              .slice(0, 4)
              .map((s) => (
                <div key={s.id} className="flex items-center gap-3">
                  <span className="bg-primary/10 text-primary grid size-9 place-items-center rounded-xl text-xs font-semibold">
                    {s.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{s.name}</p>
                    <p className="text-muted-foreground text-xs">{s.course}</p>
                  </div>
                  <span className="text-sm font-semibold">{s.quizAverage}%</span>
                </div>
              ))}
          </div>
        </section>
      </div>
    </div>
  );
}
