import { BarChart3, BookOpen, Brain, FileText, Flame, Sparkles } from "lucide-react";

/** Static, purely decorative dashboard preview used in the landing hero. */
export function HeroPreview() {
  const bars = [42, 66, 38, 88, 60, 96, 52];

  return (
    <div className="relative" aria-hidden="true">
      <div className="bg-primary/20 absolute -top-10 -left-10 size-48 rounded-full blur-3xl" />
      <div className="bg-accent/25 absolute -right-8 -bottom-10 size-56 rounded-full blur-3xl" />

      <div className="card-surface shadow-glow relative overflow-hidden rounded-3xl p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">Good Morning, Gopika 👋</p>
            <p className="text-muted-foreground text-xs">Ready to continue learning?</p>
          </div>
          <span className="bg-warning/20 text-warning-foreground inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium">
            <Flame className="size-3.5" /> 12 day streak
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {[
            { icon: BookOpen, label: "Learning", value: "28h" },
            { icon: Brain, label: "AI Chats", value: "164" },
            { icon: BarChart3, label: "Quiz Avg", value: "86%" },
          ].map((s) => (
            <div key={s.label} className="bg-muted/60 rounded-2xl p-3">
              <s.icon className="text-primary mb-2 size-4" />
              <p className="text-base font-semibold">{s.value}</p>
              <p className="text-muted-foreground text-[11px]">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-5">
          <div className="border-border rounded-2xl border p-3 sm:col-span-3">
            <p className="mb-3 text-xs font-medium">Weekly Learning Activity</p>
            <div className="flex h-24 items-end gap-2">
              {bars.map((h, i) => (
                <div
                  key={i}
                  className="bg-gradient-brand flex-1 rounded-t-md"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>
          <div className="border-border space-y-2 rounded-2xl border p-3 sm:col-span-2">
            <p className="text-xs font-medium">AI Recommends</p>
            {["Revise Python Functions", "Practice SQL Queries"].map((t) => (
              <div key={t} className="bg-primary/5 flex items-start gap-2 rounded-xl p-2">
                <Sparkles className="text-primary mt-0.5 size-3.5 shrink-0" />
                <p className="text-[11px] leading-snug">{t}</p>
              </div>
            ))}
            <div className="bg-accent/10 flex items-center gap-2 rounded-xl p-2">
              <FileText className="text-accent-foreground size-3.5 shrink-0" />
              <p className="text-[11px]">OS Unit 3.pdf · 38 pages</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card-surface animate-float absolute -bottom-6 -left-4 hidden items-center gap-2 rounded-2xl px-3 py-2 sm:flex">
        <span className="bg-success/20 grid size-8 place-items-center rounded-xl">
          <Brain className="text-success-foreground size-4" />
        </span>
        <div>
          <p className="text-xs font-semibold">Summary ready</p>
          <p className="text-muted-foreground text-[11px]">in 4 seconds</p>
        </div>
      </div>
    </div>
  );
}
