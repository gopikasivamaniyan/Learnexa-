import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand/Logo";

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
  highlights = [
    "Multimodal AI tutor for text, PDFs, voice and images",
    "Auto-generated notes, flashcards and quizzes",
    "Progress analytics and smart revision scheduling",
  ],
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
  highlights?: string[];
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="bg-gradient-brand relative hidden flex-col justify-between overflow-hidden p-12 lg:flex">
        <div className="bg-primary-foreground/10 absolute -top-20 -left-20 size-72 rounded-full blur-3xl" />
        <div className="bg-primary-foreground/10 absolute -right-16 bottom-0 size-80 rounded-full blur-3xl" />
        <Logo className="relative [&_span:last-child]:text-primary-foreground" />
        <div className="relative space-y-6">
          <h2 className="text-primary-foreground max-w-sm text-3xl font-semibold">
            Learn Smarter. Understand Deeper. Grow Faster.
          </h2>
          <ul className="space-y-3">
            {highlights.map((h) => (
              <li key={h} className="text-primary-foreground/90 flex items-start gap-3 text-sm">
                <span className="bg-primary-foreground/15 mt-0.5 grid size-5 shrink-0 place-items-center rounded-full">
                  <Check className="size-3" aria-hidden="true" />
                </span>
                {h}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-primary-foreground/70 relative text-xs">
          Upload → Understand → Practice → Revise → Track
        </p>
      </div>

      <div className="bg-gradient-surface flex flex-col px-4 py-8 sm:px-8">
        <div className="lg:hidden">
          <Logo />
        </div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
          <p className="text-muted-foreground mt-2 text-sm">{subtitle}</p>
          <div className="mt-8">{children}</div>
          {footer && <div className="text-muted-foreground mt-6 text-center text-sm">{footer}</div>}
          <p className="text-muted-foreground mt-8 text-center text-xs">
            <Link to="/" className="hover:text-foreground">
              ← Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
