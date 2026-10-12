import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  delta,
  trend = "up",
  icon: Icon,
  tone = "primary",
}: {
  label: string;
  value: string;
  delta?: string;
  trend?: "up" | "down";
  icon?: LucideIcon;
  tone?: "primary" | "accent" | "success" | "warning" | "info";
}) {
  const toneClass = {
    primary: "bg-primary/10 text-primary",
    accent: "bg-accent/15 text-accent-foreground",
    success: "bg-success/15 text-success-foreground",
    warning: "bg-warning/20 text-warning-foreground",
    info: "bg-info/15 text-info-foreground",
  }[tone];

  const TrendIcon = trend === "up" ? TrendingUp : TrendingDown;

  return (
    <div className="card-surface hover-lift p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">{label}</p>
        {Icon && (
          <span className={cn("grid size-9 place-items-center rounded-xl", toneClass)}>
            <Icon className="size-4.5" aria-hidden="true" />
          </span>
        )}
      </div>
      <p className="mt-3 text-2xl font-semibold">{value}</p>
      {delta && (
        <p
          className={cn(
            "mt-1 flex items-center gap-1 text-xs font-medium",
            trend === "up" ? "text-success-foreground" : "text-destructive",
          )}
        >
          <TrendIcon className="size-3.5" aria-hidden="true" />
          {delta}
        </p>
      )}
    </div>
  );
}
