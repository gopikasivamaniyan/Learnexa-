import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Sparkles } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { EmptyState, PageHeader } from "@/components/common/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api, endpoints } from "@/lib/api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/learn/planner")({
  head: () => ({
    meta: [
      { title: "Study Planner — Learnexa" },
      {
        name: "description",
        content: "Generate an exam-aware daily study plan built around your available hours.",
      },
      { property: "og:title", content: "Study Planner — Learnexa" },
      { property: "og:description", content: "Plan your study days with Learnexa." },
    ],
  }),
  component: PlannerPage,
});

type Task = { id: string; topic: string; duration: string; priority: string; done: boolean };

function PlannerPage() {
  const [form, setForm] = useState({
    subject: "",
    topics: "",
    examDate: "",
    hours: "",
    difficulty: "",
    time: "",
  });
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api
      .get<{ tasks: Task[] }>(endpoints.studyPlan)
      .then((res) => res.tasks.length > 0 && setTasks(res.tasks))
      .catch(() => undefined);
  }, []);

  const generate = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.subject || !form.topics) {
      toast.error("Add a subject and at least one topic");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post<{ tasks: Task[] }>(endpoints.studyPlan, form);
      setTasks(res.tasks);
      toast.success("Study plan generated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not generate a study plan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Study Planner"
        description="Tell Learnexa what's coming up and get a realistic daily plan."
      />

      <div className="grid gap-5 lg:grid-cols-[22rem_1fr]">
        <form onSubmit={generate} className="card-surface h-fit space-y-4 p-5">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              placeholder="Operating Systems"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="topics">Topics</Label>
            <Textarea
              id="topics"
              value={form.topics}
              onChange={(e) => setForm({ ...form, topics: e.target.value })}
              placeholder="Paging, Segmentation, Deadlocks…"
              className="min-h-24"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="exam">Exam date</Label>
            <Input
              id="exam"
              type="date"
              value={form.examDate}
              onChange={(e) => setForm({ ...form, examDate: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hours">Available study hours per day</Label>
            <Input
              id="hours"
              type="number"
              min={1}
              max={16}
              value={form.hours}
              onChange={(e) => setForm({ ...form, hours: e.target.value })}
              placeholder="4"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty</Label>
            <Select
              value={form.difficulty}
              onValueChange={(v) => setForm({ ...form, difficulty: v })}
            >
              <SelectTrigger id="difficulty">
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="time">Preferred study time</Label>
            <Select value={form.time} onValueChange={(v) => setForm({ ...form, time: v })}>
              <SelectTrigger id="time">
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="morning">Morning</SelectItem>
                <SelectItem value="afternoon">Afternoon</SelectItem>
                <SelectItem value="evening">Evening</SelectItem>
                <SelectItem value="night">Night</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" variant="hero" className="w-full" disabled={loading}>
            <Sparkles className="size-4" /> {loading ? "Generating…" : "Generate Study Plan"}
          </Button>
        </form>

        <div className="space-y-4">
          {!tasks ? (
            <EmptyState
              icon={CalendarDays}
              title="No plan yet"
              description="Fill in your subject, topics and exam date, then generate a plan."
            />
          ) : (
            <>
              <h2 className="text-base font-semibold">Daily tasks</h2>
              <div className="card-surface divide-border divide-y p-2">
                {tasks.map((t) => (
                  <label
                    key={t.id}
                    className="hover:bg-muted/60 flex cursor-pointer items-center gap-3 rounded-xl p-4 transition-colors"
                  >
                    <Checkbox
                      checked={t.done}
                      onCheckedChange={(v) => {
                        const done = v === true;
                        setTasks((list) => list!.map((x) => (x.id === t.id ? { ...x, done } : x)));
                        void api
                          .patch(`${endpoints.studyPlan}/${t.id}`, { done })
                          .catch(() => toast.error("Could not save that change"));
                      }}
                      aria-label={`Mark ${t.topic} complete`}
                    />
                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          "block text-sm font-medium",
                          t.done && "text-muted-foreground line-through",
                        )}
                      >
                        {t.topic}
                      </span>
                      <span className="text-muted-foreground text-xs">{t.duration}</span>
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-[11px] font-medium",
                        t.priority === "High"
                          ? "bg-destructive/10 text-destructive"
                          : t.priority === "Medium"
                            ? "bg-warning/20 text-warning-foreground"
                            : "bg-success/15 text-success-foreground",
                      )}
                    >
                      {t.priority}
                    </span>
                  </label>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
