import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Clock, RotateCcw, Sparkles, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/states";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { api, endpoints } from "@/lib/api";
import { EmptyState, LoadingState } from "@/components/common/states";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/learn/quiz")({
  head: () => ({
    meta: [
      { title: "Quiz — Learnexa" },
      {
        name: "description",
        content: "Take AI-generated quizzes with timing, scoring and weak-topic analysis.",
      },
      { property: "og:title", content: "Quiz — Learnexa" },
      { property: "og:description", content: "Test what you've learned with Learnexa." },
    ],
  }),
  component: QuizPage,
});

type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  answerIndex: number;
  topic: string;
  explanation: string;
};
type Recommendation = { id: string; title: string; reason: string };

function QuizPage() {
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [current, setCurrent] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [seconds, setSeconds] = useState(10 * 60);

  const loadQuiz = () => {
    setLoading(true);
    setSubmitted(false);
    api
      .get<{ questions: QuizQuestion[] }>(endpoints.quiz)
      .then((res) => setQuizQuestions(res.questions))
      .catch((err) => toast.error(err instanceof Error ? err.message : "Could not load the quiz"))
      .finally(() => setLoading(false));
  };

  useEffect(loadQuiz, []);

  useEffect(() => {
    if (submitted) return;
    const t = window.setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(t);
  }, [submitted]);

  useEffect(() => {
    if (seconds === 0 && !submitted) {
      void submitQuiz();
      toast.error("Time is up — quiz submitted automatically");
    }
  }, [seconds, submitted]);

  const result = useMemo(() => {
    const correct = quizQuestions.filter((q) => answers[q.id] === q.answerIndex);
    const wrong = quizQuestions.filter((q) => answers[q.id] !== q.answerIndex);
    return {
      correct,
      wrong,
      score: correct.length,
      percentage: Math.round((correct.length / quizQuestions.length) * 100),
    };
  }, [answers]);

  const reset = () => {
    setAnswers({});
    setCurrent(0);
    setSeconds(600);
    loadQuiz();
  };

  const submitQuiz = async () => {
    setSubmitting(true);
    try {
      const res = await api.post<{
        percentage: number;
        strongTopics: string[];
        weakTopics: string[];
      }>(endpoints.quiz + "/submit", { questions: quizQuestions, answers });
      setSubmitted(true);
      api
        .get<{ recommendations: Recommendation[] }>(endpoints.recommendations)
        .then((r) => setRecommendations(r.recommendations))
        .catch(() => undefined);
      toast.success(`Quiz submitted — ${res.percentage}%`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not submit the quiz");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState label="Generating your quiz…" />;

  if (quizQuestions.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Quiz"
          description="AI-generated questions from your recent study material."
        />
        <EmptyState
          icon={Sparkles}
          title="No quiz available"
          description="We couldn't generate quiz questions right now."
          action={
            <Button variant="hero" onClick={loadQuiz}>
              Try again
            </Button>
          }
        />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Quiz result"
          description="Here's how you performed and what to study next."
          actions={
            <Button variant="hero" onClick={reset}>
              <RotateCcw className="size-4" /> Retake quiz
            </Button>
          }
        />

        <div className="card-surface bg-gradient-soft flex flex-col items-center gap-3 p-10 text-center">
          <p className="text-muted-foreground text-sm">Your score</p>
          <p className="text-gradient-brand text-6xl font-semibold">{result.percentage}%</p>
          <p className="text-sm">
            {result.score} of {quizQuestions.length} correct
          </p>
          <Progress value={result.percentage} className="mt-2 h-2 max-w-sm" />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <ResultList
            title="Correct answers"
            tone="success"
            items={result.correct.map((q) => q.question)}
          />
          <ResultList
            title="Incorrect answers"
            tone="destructive"
            items={result.wrong.map((q) => q.question)}
          />
          <TopicList
            title="Strong topics"
            items={[...new Set(result.correct.map((q) => q.topic))]}
            tone="success"
          />
          <TopicList
            title="Weak topics"
            items={[...new Set(result.wrong.map((q) => q.topic))]}
            tone="warning"
          />
        </div>

        <div className="card-surface p-5">
          <h2 className="mb-3 flex items-center gap-2 text-base font-semibold">
            <Sparkles className="text-primary size-4" /> AI recommendations
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {recommendations.slice(0, 3).map((r) => (
              <div key={r.id} className="bg-primary/5 rounded-2xl p-4">
                <p className="text-sm font-medium">{r.title}</p>
                <p className="text-muted-foreground mt-1 text-xs">{r.reason}</p>
                <Button variant="soft" size="sm" className="mt-3" asChild>
                  <Link to="/learn/recommendations">Start</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-base font-semibold">Review answers</h2>
          {quizQuestions.map((q, i) => {
            const chosen = answers[q.id];
            const isCorrect = chosen === q.answerIndex;
            return (
              <div key={q.id} className="card-surface p-5">
                <div className="flex items-start gap-3">
                  {isCorrect ? (
                    <CheckCircle2 className="text-success-foreground mt-0.5 size-5 shrink-0" />
                  ) : (
                    <XCircle className="text-destructive mt-0.5 size-5 shrink-0" />
                  )}
                  <div>
                    <p className="text-sm font-medium">
                      {i + 1}. {q.question}
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      Your answer: {chosen != null ? q.options[chosen] : "Not answered"} · Correct:{" "}
                      {q.options[q.answerIndex]}
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">{q.explanation}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const q = quizQuestions[current]!;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quiz"
        description="AI-generated questions from your recent study material."
        actions={
          <span className="card-surface inline-flex items-center gap-2 px-3 py-2 text-sm font-medium">
            <Clock className="text-primary size-4" />
            {String(Math.floor(seconds / 60)).padStart(2, "0")}:
            {String(seconds % 60).padStart(2, "0")}
          </span>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_16rem]">
        <div className="card-surface p-6">
          <div className="mb-4 flex items-center justify-between">
            <Badge variant="secondary" className="rounded-full">
              {q.topic}
            </Badge>
            <span className="text-muted-foreground text-sm">
              Question {current + 1} of {quizQuestions.length}
            </span>
          </div>
          <Progress value={((current + 1) / quizQuestions.length) * 100} className="h-2" />

          <h2 className="mt-6 text-lg font-semibold">{q.question}</h2>
          <div className="mt-5 space-y-3">
            {q.options.map((opt, i) => {
              const selected = answers[q.id] === i;
              return (
                <button
                  key={opt}
                  onClick={() => setAnswers((a) => ({ ...a, [q.id]: i }))}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition-all",
                    selected
                      ? "border-primary bg-primary/5 shadow-soft"
                      : "border-border hover:border-primary/40 hover:bg-muted/60",
                  )}
                >
                  <span
                    className={cn(
                      "grid size-7 shrink-0 place-items-center rounded-lg text-xs font-semibold",
                      selected ? "bg-primary text-primary-foreground" : "bg-muted",
                    )}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex justify-between">
            <Button
              variant="outline"
              disabled={current === 0}
              onClick={() => setCurrent((c) => c - 1)}
            >
              Previous
            </Button>
            {current === quizQuestions.length - 1 ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="hero">Submit quiz</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Submit your quiz?</AlertDialogTitle>
                    <AlertDialogDescription>
                      You've answered {answeredCount} of {quizQuestions.length} questions. You can't
                      change answers after submitting.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep going</AlertDialogCancel>
                    <AlertDialogAction onClick={submitQuiz} disabled={submitting}>
                      {submitting ? "Submitting…" : "Submit"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <Button variant="hero" onClick={() => setCurrent((c) => c + 1)}>
                Next question
              </Button>
            )}
          </div>
        </div>

        <aside className="card-surface h-fit p-4">
          <h2 className="mb-3 text-sm font-semibold">Questions</h2>
          <div className="grid grid-cols-5 gap-2">
            {quizQuestions.map((item, i) => (
              <button
                key={item.id}
                onClick={() => setCurrent(i)}
                className={cn(
                  "grid size-9 place-items-center rounded-xl text-sm font-medium transition-colors",
                  i === current
                    ? "bg-gradient-brand text-primary-foreground"
                    : answers[item.id] != null
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground",
                )}
                aria-label={`Go to question ${i + 1}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <p className="text-muted-foreground mt-4 text-xs">
            {answeredCount} answered · {quizQuestions.length - answeredCount} remaining
          </p>
        </aside>
      </div>
    </div>
  );
}

function ResultList({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "success" | "destructive";
}) {
  return (
    <div className="card-surface p-5">
      <h2 className="mb-3 text-sm font-semibold">
        {title} ({items.length})
      </h2>
      {items.length === 0 ? (
        <p className="text-muted-foreground text-sm">None</p>
      ) : (
        <ul className="space-y-2">
          {items.map((t) => (
            <li key={t} className="flex items-start gap-2 text-sm">
              {tone === "success" ? (
                <CheckCircle2 className="text-success-foreground mt-0.5 size-4 shrink-0" />
              ) : (
                <XCircle className="text-destructive mt-0.5 size-4 shrink-0" />
              )}
              {t}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function TopicList({
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
        {items.length === 0 && <p className="text-muted-foreground text-sm">None</p>}
        {items.map((t) => (
          <span
            key={t}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium",
              tone === "success"
                ? "bg-success/15 text-success-foreground"
                : "bg-warning/20 text-warning-foreground",
            )}
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
