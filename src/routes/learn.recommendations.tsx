import { createFileRoute } from "@tanstack/react-router";
import { Clock, Play, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { EmptyState, LoadingState, PageHeader } from "@/components/common/states";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api, endpoints } from "@/lib/api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/learn/recommendations")({
  head: () => ({
    meta: [
      { title: "Recommendations — Learnexa" },
      {
        name: "description",
        content: "Personalized next-best topics chosen from your quiz scores and revision gaps.",
      },
      { property: "og:title", content: "Recommendations — Learnexa" },
      { property: "og:description", content: "Know exactly what to study next." },
    ],
  }),
  component: RecommendationsPage,
});

type Recommendation = {
  id: string;
  title: string;
  reason: string;
  difficulty: string;
  minutes: number;
  subject: string;
};

function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ recommendations: Recommendation[] }>(endpoints.recommendations)
      .then((r) => setRecommendations(r.recommendations))
      .catch((err) =>
        toast.error(err instanceof Error ? err.message : "Could not load recommendations"),
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState label="Finding what to study next…" />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Recommendations"
        description="Chosen for you from your quiz results, revision gaps and upcoming exams."
      />

      {recommendations.length === 0 && (
        <EmptyState
          icon={Sparkles}
          title="No recommendations yet"
          description="Take a quiz or two and Learnexa will suggest what to revise next."
        />
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {recommendations.map((r) => (
          <article key={r.id} className="card-surface hover-lift flex flex-col p-5">
            <div className="flex items-start justify-between gap-3">
              <span className="bg-primary/10 text-primary grid size-10 place-items-center rounded-2xl">
                <Sparkles className="size-5" aria-hidden="true" />
              </span>
              <Badge
                variant="secondary"
                className={cn(
                  "rounded-full",
                  r.difficulty === "Hard" && "bg-destructive/10 text-destructive",
                  r.difficulty === "Medium" && "bg-warning/20 text-warning-foreground",
                  r.difficulty === "Easy" && "bg-success/15 text-success-foreground",
                )}
              >
                {r.difficulty}
              </Badge>
            </div>
            <h2 className="mt-4 text-base font-semibold">{r.title}</h2>
            <p className="text-muted-foreground mt-1.5 flex-1 text-sm">{r.reason}</p>
            <div className="text-muted-foreground mt-4 flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1">
                <Clock className="size-3.5" /> {r.minutes} min
              </span>
              <span>{r.subject}</span>
            </div>
            <Button
              variant="hero"
              className="mt-4"
              onClick={() => toast.success(`Starting: ${r.title}`)}
            >
              <Play className="size-4" /> Start
            </Button>
          </article>
        ))}
      </div>
    </div>
  );
}
