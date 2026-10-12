import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  MessageSquare,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { StatCard } from "@/components/common/StatCard";
import { LoadingState } from "@/components/common/states";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { api, endpoints, getStoredUser } from "@/lib/api";

export const Route = createFileRoute("/learn/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Learnexa" },
      {
        name: "description",
        content:
          "Your learning dashboard: progress, recent documents, AI recommendations and today's plan.",
      },
      { property: "og:title", content: "Dashboard — Learnexa" },
      { property: "og:description", content: "Track your learning progress with Learnexa." },
    ],
  }),
  component: Dashboard,
});

const icons = {
  clock: Clock,
  message: MessageSquare,
  check: CheckCircle2,
  target: Target,
  trending: TrendingUp,
} as const;

type Task = { id: string; topic: string; duration: string; priority: string; done: boolean };
type DocItem = { id: string; name: string; subject: string; size: string };
type Stat = {
  id: string;
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down";
  icon: string;
};
type Recommendation = { id: string; title: string; reason: string };

function Dashboard() {
  const user = getStoredUser();
  const [stats, setStats] = useState<Stat[]>([]);
  const [plan, setPlan] = useState<Task[]>([]);
  const [recentDocuments, setRecentDocuments] = useState<DocItem[]>([]);
  const [weeklyActivity, setWeeklyActivity] = useState<
    { day: string; minutes: number; quiz: number }[]
  >([]);
  const [topicProgress, setTopicProgress] = useState<{ topic: string; progress: number }[]>([]);
  const [learningTrend, setLearningTrend] = useState<{ week: string; score: number }[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<{ stats: Stat[]; recentDocuments: DocItem[]; todayPlan: Task[] }>(
        endpoints.dashboard,
      ),
      api.get<{
        weeklyActivity: typeof weeklyActivity;
        topicProgress: typeof topicProgress;
        learningTrend: typeof learningTrend;
      }>(endpoints.analytics),
      api.get<{ recommendations: Recommendation[] }>(endpoints.recommendations),
    ])
      .then(([dash, an, rec]) => {
        setStats(dash.stats);
        setRecentDocuments(dash.recentDocuments);
        setPlan(dash.todayPlan);
        setWeeklyActivity(an.weeklyActivity);
        setTopicProgress(an.topicProgress);
        setLearningTrend(an.learningTrend);
        setRecommendations(rec.recommendations);
      })
      .catch((err) =>
        toast.error(err instanceof Error ? err.message : "Could not load your dashboard"),
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState label="Loading your dashboard…" />;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-brand shadow-glow relative overflow-hidden rounded-3xl px-6 py-8 sm:px-8">
        <div className="bg-primary-foreground/10 absolute -top-16 -right-10 size-56 rounded-full blur-3xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-primary-foreground text-2xl font-semibold sm:text-3xl">
              Good Morning, {user?.name.split(" ")[0] ?? "there"} 👋
            </h1>
            <p className="text-primary-foreground/85 mt-1.5 text-sm">Ready to continue learning?</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" asChild>
              <Link to="/learn/tutor">Ask AI Tutor</Link>
            </Button>
            <Button
              variant="outline"
              className="text-primary-foreground border-primary-foreground/40 hover:bg-primary-foreground/10 hover:text-primary-foreground bg-transparent"
              asChild
            >
              <Link to="/learn/documents">Upload document</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((s, i) => (
          <StatCard
            key={s.id}
            label={s.label}
            value={s.value}
            delta={s.delta}
            trend={s.trend}
            icon={icons[s.icon as keyof typeof icons]}
            tone={(["primary", "accent", "success", "warning", "info"] as const)[i % 5]!}
          />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="space-y-4 lg:col-span-2">
          <SectionHeader title="Recent Documents" to="/learn/documents" />
          {recentDocuments.length === 0 ? (
            <p className="text-muted-foreground text-sm">Upload a document to start learning.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-3">
              {recentDocuments.map((d) => (
                <article key={d.id} className="card-surface hover-lift p-5">
                  <Badge variant="secondary" className="rounded-full">
                    {d.subject}
                  </Badge>
                  <h3 className="mt-3 truncate text-sm font-semibold">{d.name}</h3>
                  <p className="text-muted-foreground mt-1 text-xs">{d.size}</p>
                </article>
              ))}
            </div>
          )}

          <SectionHeader title="Weekly Learning Activity" />
          <div className="card-surface p-5">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={weeklyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                  }}
                />
                <Bar dataKey="minutes" fill="var(--chart-1)" radius={[8, 8, 0, 0]} name="Minutes" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <SectionHeader title="Progress Overview" to="/learn/analytics" />
          <div className="card-surface grid gap-6 p-5 md:grid-cols-2">
            <div className="space-y-4">
              {topicProgress.map((t) => (
                <div key={t.topic}>
                  <div className="mb-1.5 flex justify-between text-xs">
                    <span className="font-medium">{t.topic}</span>
                    <span className="text-muted-foreground">{t.progress}%</span>
                  </div>
                  <Progress value={t.progress} className="h-2" />
                </div>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={learningTrend}>
                <defs>
                  <linearGradient id="trend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="week" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="var(--chart-1)"
                  strokeWidth={2.5}
                  fill="url(#trend)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <aside className="space-y-4">
          <SectionHeader title="Today's Study Plan" to="/learn/planner" />
          <div className="card-surface divide-border divide-y p-2">
            {plan.map((t) => (
              <label
                key={t.id}
                className="hover:bg-muted/60 flex cursor-pointer items-center gap-3 rounded-xl p-3 transition-colors"
              >
                <Checkbox
                  checked={t.done}
                  onCheckedChange={(v) => {
                    const done = v === true;
                    setPlan((p) => p.map((x) => (x.id === t.id ? { ...x, done } : x)));
                    void api
                      .patch(`${endpoints.studyPlan}/${t.id}`, { done })
                      .catch(() => undefined);
                  }}
                  aria-label={`Mark ${t.topic} complete`}
                />
                <span className="min-w-0 flex-1">
                  <span
                    className={`block truncate text-sm font-medium ${t.done ? "text-muted-foreground line-through" : ""}`}
                  >
                    {t.topic}
                  </span>
                  <span className="text-muted-foreground text-xs">{t.duration}</span>
                </span>
                <PriorityBadge priority={t.priority} />
              </label>
            ))}
          </div>

          <SectionHeader title="AI Recommendations" to="/learn/recommendations" />
          <div className="card-surface space-y-3 p-4">
            {recommendations.slice(0, 3).map((r) => (
              <div key={r.id} className="bg-primary/5 rounded-2xl p-3">
                <div className="flex items-start gap-2">
                  <Sparkles className="text-primary mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-medium">{r.title}</p>
                    <p className="text-muted-foreground mt-0.5 text-xs">{r.reason}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

function SectionHeader({ title, to }: { title: string; to?: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-base font-semibold">{title}</h2>
      {to && (
        <Link
          to={to}
          className="text-primary inline-flex items-center gap-1 text-xs font-medium hover:underline"
        >
          View all <ArrowRight className="size-3.5" />
        </Link>
      )}
    </div>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  const tone =
    priority === "High"
      ? "bg-destructive/10 text-destructive"
      : priority === "Medium"
        ? "bg-warning/20 text-warning-foreground"
        : "bg-success/15 text-success-foreground";
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${tone}`}>{priority}</span>
  );
}
