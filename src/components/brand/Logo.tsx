import { Link } from "@tanstack/react-router";
import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  showWordmark = true,
  to = "/",
}: {
  className?: string;
  showWordmark?: boolean;
  to?: string;
}) {
  return (
    <Link
      to={to}
      className={cn("group inline-flex items-center gap-2.5", className)}
      aria-label="Learnexa home"
    >
      <span className="bg-gradient-brand shadow-soft grid size-9 place-items-center rounded-xl transition-transform duration-300 group-hover:scale-105">
        <GraduationCap className="text-primary-foreground size-5" aria-hidden="true" />
      </span>
      {showWordmark && (
        <span className="text-foreground text-lg font-semibold tracking-tight">Learnexa</span>
      )}
    </Link>
  );
}
