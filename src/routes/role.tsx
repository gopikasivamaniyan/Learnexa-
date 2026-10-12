import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Building2, Check, GraduationCap, Info } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/role")({
  head: () => ({
    meta: [
      { title: "Choose your role — Learnexa" },
      {
        name: "description",
        content:
          "Continue as an individual learner or as an institution managing students, teachers and courses on Learnexa.",
      },
      { property: "og:title", content: "Choose your role — Learnexa" },
      {
        property: "og:description",
        content: "Individual learner or institutional user — pick how you want to use Learnexa.",
      },
    ],
  }),
  component: RoleSelection,
});

const learnerPoints = ["Personal AI tutor", "PDF, voice & image learning", "Quizzes and analytics"];
const institutionPoints = [
  "Manage students & teachers",
  "Courses and materials",
  "Progress reporting",
];

function RoleSelection() {
  return (
    <div className="bg-gradient-surface flex min-h-screen flex-col">
      <header className="mx-auto flex h-16 w-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        <Logo />
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-4 py-12 sm:px-6">
        <div className="text-center">
          <h1 className="text-3xl font-semibold sm:text-4xl">How will you use Learnexa?</h1>
          <p className="text-muted-foreground mt-3">
            Pick the experience that fits you. You can always contact us to switch later.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <RoleCard
            icon={GraduationCap}
            title="Individual Learner"
            description="Learn independently with your personal AI learning assistant."
            points={learnerPoints}
            primaryLabel="Continue as Learner"
            primaryTo="/register/learner"
            tone="primary"
          />
          <RoleCard
            icon={Building2}
            title="Institutional User"
            description="Manage students, teachers, courses and learning progress."
            points={institutionPoints}
            primaryLabel="Register Institution"
            primaryTo="/register/institution"
            tone="accent"
          />
        </div>

        <div className="border-border bg-card text-muted-foreground mx-auto mt-8 flex max-w-2xl items-start gap-3 rounded-2xl border p-4 text-sm">
          <Info className="text-primary mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p>
            Institution students cannot self-register. Their accounts are created and managed by
            their institution's administrator.
          </p>
        </div>

        <p className="text-muted-foreground mt-6 text-center text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Log in
          </Link>
        </p>
      </main>
    </div>
  );
}

function RoleCard({
  icon: Icon,
  title,
  description,
  points,
  primaryLabel,
  primaryTo,
  tone,
}: {
  icon: typeof GraduationCap;
  title: string;
  description: string;
  points: string[];
  primaryLabel: string;
  primaryTo: string;
  tone: "primary" | "accent";
}) {
  return (
    <article className="card-surface hover-lift flex flex-col p-7">
      <span
        className={
          tone === "primary"
            ? "bg-primary/10 text-primary grid size-14 place-items-center rounded-2xl"
            : "bg-accent/15 text-accent-foreground grid size-14 place-items-center rounded-2xl"
        }
      >
        <Icon className="size-7" aria-hidden="true" />
      </span>
      <h2 className="mt-5 text-xl font-semibold">{title}</h2>
      <p className="text-muted-foreground mt-2 text-sm">{description}</p>
      <ul className="mt-5 space-y-2">
        {points.map((p) => (
          <li key={p} className="flex items-center gap-2 text-sm">
            <Check className="text-success-foreground size-4" aria-hidden="true" /> {p}
          </li>
        ))}
      </ul>
      <div className="mt-7 flex flex-col gap-2">
        <Button variant={tone === "primary" ? "hero" : "accent"} asChild>
          <Link to={primaryTo}>
            {primaryLabel} <ArrowRight className="size-4" />
          </Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link to="/login">Log in instead</Link>
        </Button>
      </div>
    </article>
  );
}
