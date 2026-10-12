import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, GraduationCap, Target, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { StatCard } from "@/components/common/StatCard";
import { LoadingState, PageHeader } from "@/components/common/states";
import { Progress } from "@/components/ui/progress";
import { api, endpoints } from "@/lib/api";

type Course = { id: string; title: string; code: string; progress: number };
type Stats = {
  averageProgress: number;
  averageQuiz: number;
  totalStudents: number;
  totalCourses: number;
};

export const Route = createFileRoute("/institution/analytics")({
  head: () => ({
    meta: [
      { title: "Institution Analytics — Learnexa" },
      {
        name: "description",
        content: "Engagement, quiz performance and course completion across your institution.",
      },
      { property: "og:title", content: "Institution Analytics — Learnexa" },
      { property: "og:description", content: "Data-backed decisions for your academic team." },
    ],
  }),
  component: InstitutionAnalytics,
});

function InstitutionAnalytics() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ stats: Stats; courses: Course[] }>(endpoints.institution.analytics)
      .then((res) => {
        setStats(res.stats);
        setCourses(res.courses);
      })
      .catch((err) => toast.error(err instanceof Error ? err.message : "Could not load analytics"))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) return <LoadingState label="Loading institution analytics…" />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Institution Analytics"
        description="How your cohorts are engaging with Learnexa."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          label="Total Students"
          value={String(stats.totalStudents)}
          delta=""
          icon={Users}
          tone="primary"
        />
        <StatCard
          label="Courses"
          value={String(stats.totalCourses)}
          delta=""
          icon={BookOpen}
          tone="success"
        />
        <StatCard
          label="Average Progress"
          value={`${stats.averageProgress}%`}
          delta=""
          icon={TrendingUp}
          tone="accent"
        />
        <StatCard
          label="Average Quiz"
          value={`${stats.averageQuiz}%`}
          delta=""
          icon={Target}
          tone="warning"
        />
        <StatCard
          label="Students at risk"
          value={String(courses.filter((c) => c.progress < 65).length)}
          delta="Needs attention"
          trend="down"
          icon={GraduationCap}
          tone="info"
        />
      </div>

      <div className="card-surface p-5">
        <h2 className="mb-4 text-sm font-semibold">Completion by course</h2>
        <div className="grid gap-5 md:grid-cols-2">
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
      </div>
    </div>
  );
}
