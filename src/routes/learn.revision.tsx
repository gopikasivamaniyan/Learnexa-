import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, CalendarClock, CheckCircle2, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/states";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { api, endpoints } from "@/lib/api";
import { LoadingState } from "@/components/common/states";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/learn/revision")({
  head: () => ({
    meta: [
      { title: "Revision Scheduler — Learnexa" },
      {
        name: "description",
        content: "Spaced revision for today, upcoming topics and anything overdue.",
      },
      { property: "og:title", content: "Revision Scheduler — Learnexa" },
      { property: "og:description", content: "Never forget what you learned." },
    ],
  }),
  component: RevisionPage,
});

type RevisionItem = { id: string; topic: string; subject: string; strength: number; due?: string };
type RevisionData = { today: RevisionItem[]; upcoming: RevisionItem[]; overdue: RevisionItem[] };

function RevisionPage() {
  const [revisionItems, setRevisionItems] = useState<RevisionData>({
    today: [],
    upcoming: [],
    overdue: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<RevisionData>(endpoints.revision)
      .then(setRevisionItems)
      .catch((err) =>
        toast.error(err instanceof Error ? err.message : "Could not load revision items"),
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState label="Loading your revision schedule…" />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Revision Scheduler"
        description="Spaced repetition based on how well you remembered each topic."
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <Column
          title="Today's Revision"
          icon={CalendarClock}
          tone="primary"
          count={revisionItems.today.length}
        >
          {revisionItems.today.map((r) => (
            <RevisionCard key={r.id} topic={r.topic} subject={r.subject} strength={r.strength} />
          ))}
        </Column>

        <Column
          title="Upcoming Revision"
          icon={Clock}
          tone="info"
          count={revisionItems.upcoming.length}
        >
          {revisionItems.upcoming.map((r) => (
            <RevisionCard
              key={r.id}
              topic={r.topic}
              subject={r.subject}
              strength={r.strength}
              meta={`Due ${r.due}`}
            />
          ))}
        </Column>

        <Column
          title="Overdue Topics"
          icon={AlertTriangle}
          tone="destructive"
          count={revisionItems.overdue.length}
        >
          {revisionItems.overdue.map((r) => (
            <RevisionCard
              key={r.id}
              topic={r.topic}
              subject={r.subject}
              strength={r.strength}
              meta={`Was due ${r.due}`}
              overdue
            />
          ))}
        </Column>
      </div>
    </div>
  );
}

function Column({
  title,
  icon: Icon,
  tone,
  count,
  children,
}: {
  title: string;
  icon: typeof Clock;
  tone: "primary" | "info" | "destructive";
  count: number;
  children: React.ReactNode;
}) {
  const toneClass = {
    primary: "bg-primary/10 text-primary",
    info: "bg-info/15 text-info-foreground",
    destructive: "bg-destructive/10 text-destructive",
  }[tone];
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <span className={cn("grid size-9 place-items-center rounded-xl", toneClass)}>
          <Icon className="size-4" aria-hidden="true" />
        </span>
        <h2 className="text-base font-semibold">{title}</h2>
        <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs">
          {count}
        </span>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function RevisionCard({
  topic,
  subject,
  strength,
  meta,
  overdue,
}: {
  topic: string;
  subject: string;
  strength: number;
  meta?: string;
  overdue?: boolean;
}) {
  return (
    <article className={cn("card-surface hover-lift p-4", overdue && "border-destructive/40")}>
      <h3 className="text-sm font-semibold">{topic}</h3>
      <p className="text-muted-foreground mt-0.5 text-xs">
        {subject}
        {meta ? ` · ${meta}` : ""}
      </p>
      <div className="mt-3">
        <div className="text-muted-foreground mb-1 flex justify-between text-[11px]">
          <span>Memory strength</span>
          <span>{strength}%</span>
        </div>
        <Progress value={strength} className="h-1.5" />
      </div>
      <Button
        variant="soft"
        size="sm"
        className="mt-3 w-full"
        onClick={() => toast.success(`Revision started: ${topic}`)}
      >
        <CheckCircle2 className="size-3.5" /> Revise now
      </Button>
    </article>
  );
}
