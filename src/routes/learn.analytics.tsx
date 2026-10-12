import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, Brain, Clock, FileText, Flame, Target } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { StatCard } from "@/components/common/StatCard";
import { LoadingState, PageHeader } from "@/components/common/states";
import { Progress } from "@/components/ui/progress";
import { api, endpoints } from "@/lib/api";

type AnalyticsData = {
  stats: {
    learningTime: string;
    quizAverage: string;
    topicsCompleted: number;
    studyStreak: number;
    documentsStudied: number;
    aiInteractions: number;
  };
  weeklyActivity: { day: string; minutes: number; quiz: number }[];
  topicProgress: { topic: string; progress: number }[];
  learningTrend: { week: string; score: number }[];
  strongTopics: string[];
  weakTopics: string[];
};
type Recommendation = { id: string; title: string; minutes: number };

export const Route = createFileRoute("/learn/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — Learnexa" },
      {
        name: "description",
        content: "Study time, quiz performance, streaks and topic-level progress in one view.",
      },
      { property: "og:title", content: "Analytics — Learnexa" },
      { property: "og:description", content: "Understand how your learning is going." },
    ],
  }),
  component: AnalyticsPage,
});

const tooltipStyle = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "12px",
};

function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<AnalyticsData>(endpoints.analytics)
      .then(setData)
      .catch((err) => toast.error(err instanceof Error ? err.message : "Could not load analytics"))
      .finally(() => setLoading(false));
    api
      .get<{ recommendations: Recommendation[] }>(endpoints.recommendations)
      .then((r) => setRecommendations(r.recommendations))
      .catch(() => undefined);
  }, []);

  if (loading || !data) return <LoadingState label="Crunching your analytics…" />;

  const { stats, weeklyActivity, topicProgress, learningTrend, strongTopics, weakTopics } = data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Learning Analytics"
        description="Where your time goes and where your marks come from."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Learning Time"
          value={stats.learningTime}
          delta=""
          icon={Clock}
          tone="primary"
        />
        <StatCard
          label="Quiz Average"
          value={stats.quizAverage}
          delta=""
          icon={Target}
          tone="accent"
        />
        <StatCard
          label="Topics Completed"
          value={String(stats.topicsCompleted)}
          delta=""
          icon={BookOpen}
          tone="success"
        />
        <StatCard
          label="Study Streak"
          value={`${stats.studyStreak} days`}
          delta=""
          icon={Flame}
          tone="warning"
        />
        <StatCard
          label="Documents Studied"
          value={String(stats.documentsStudied)}
          delta=""
          icon={FileText}
          tone="info"
        />
        <StatCard
          label="AI Interactions"
          value={String(stats.aiInteractions)}
          delta=""
          icon={Brain}
          tone="primary"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <ChartCard title="Weekly Study Activity">
          <BarChart data={weeklyActivity}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} />
            <YAxis stroke="var(--muted-foreground)" fontSize={12} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="minutes" name="Minutes" fill="var(--chart-1)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ChartCard>

        <ChartCard title="Quiz Performance">
          <LineChart data={weeklyActivity}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} />
            <YAxis stroke="var(--muted-foreground)" fontSize={12} domain={[40, 100]} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line
              type="monotone"
              dataKey="quiz"
              name="Score %"
              stroke="var(--chart-2)"
              strokeWidth={3}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ChartCard>

        <div className="card-surface p-5">
          <h2 className="mb-4 text-sm font-semibold">Topic Progress</h2>
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
        </div>

        <ChartCard title="Learning Trend">
          <AreaChart data={learningTrend}>
            <defs>
              <linearGradient id="a-trend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.5} />
                <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="week" stroke="var(--muted-foreground)" fontSize={12} />
            <YAxis stroke="var(--muted-foreground)" fontSize={12} />
            <Tooltip contentStyle={tooltipStyle} />
            <Area
              type="monotone"
              dataKey="score"
              name="Overall score"
              stroke="var(--chart-1)"
              strokeWidth={2.5}
              fill="url(#a-trend)"
            />
          </AreaChart>
        </ChartCard>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <TopicPanel title="Strong Topics" items={strongTopics} tone="success" />
        <TopicPanel title="Weak Topics" items={weakTopics} tone="warning" />
        <div className="card-surface p-5">
          <h2 className="mb-3 text-sm font-semibold">Recommended Topics</h2>
          <ul className="space-y-2">
            {recommendations.map((r) => (
              <li key={r.id} className="bg-primary/5 rounded-xl px-3 py-2 text-sm">
                {r.title}
                <span className="text-muted-foreground block text-xs">{r.minutes} min</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactElement }) {
  return (
    <div className="card-surface p-5">
      <h2 className="mb-4 text-sm font-semibold">{title}</h2>
      <ResponsiveContainer width="100%" height={260}>
        {children}
      </ResponsiveContainer>
    </div>
  );
}

function TopicPanel({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "success" | "warning";
}) {
  return (
    <div className="card-surface p-5">
      <h2 className="mb-3 text-sm font-semibold">{title}</h2>
      <div className="flex flex-wrap gap-2">
        {items.map((t) => (
          <span
            key={t}
            className={
              tone === "success"
                ? "bg-success/15 text-success-foreground rounded-full px-3 py-1 text-xs font-medium"
                : "bg-warning/20 text-warning-foreground rounded-full px-3 py-1 text-xs font-medium"
            }
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
