import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  Brain,
  CalendarDays,
  FileText,
  Image as ImageIcon,
  Layers,
  ListChecks,
  MessageSquare,
  Mic,
  Sparkles,
  StickyNote,
  Upload,
  Waypoints,
} from "lucide-react";
import { PublicFooter, PublicHeader } from "@/components/layout/PublicHeader";
import { HeroPreview } from "@/components/marketing/HeroPreview";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Learnexa — Your AI-Powered Learning Companion" },
      {
        name: "description",
        content:
          "Learnexa understands your documents, questions, voice and images to create a personalized learning experience. Learn Smarter. Understand Deeper. Grow Faster.",
      },
      { property: "og:title", content: "Learnexa — Your AI-Powered Learning Companion" },
      {
        property: "og:description",
        content:
          "Upload, understand, practice, revise and track your learning with a multimodal AI tutor.",
      },
    ],
  }),
  component: Landing,
});

const features = [
  {
    icon: Waypoints,
    title: "Multimodal Learning",
    text: "Text, PDFs, voice and images understood in one continuous learning flow.",
  },
  {
    icon: Brain,
    title: "AI Tutor",
    text: "Ask anything and get structured, step-by-step explanations at your level.",
  },
  {
    icon: FileText,
    title: "Smart PDF Learning",
    text: "Chat with any chapter and get page-aware answers you can trust.",
  },
  {
    icon: Mic,
    title: "Voice Tutor",
    text: "Speak your doubt in English, Tamil, Hindi, Malayalam, Telugu or Kannada.",
  },
  {
    icon: ImageIcon,
    title: "Image Learning",
    text: "Photograph a diagram or a sum and get it explained or solved.",
  },
  {
    icon: ListChecks,
    title: "AI Quiz",
    text: "Auto-generated quizzes with timing, scoring and weak-topic analysis.",
  },
  {
    icon: Layers,
    title: "Flashcards",
    text: "Flip-card practice with mastery tracking and difficulty marking.",
  },
  {
    icon: StickyNote,
    title: "Notes",
    text: "AI-generated and handwritten notes, searchable in one workspace.",
  },
  {
    icon: CalendarDays,
    title: "Study Planner",
    text: "Exam-aware daily plans built around your available study hours.",
  },
  {
    icon: BarChart3,
    title: "Learning Analytics",
    text: "See study time, quiz trends, streaks and topic-level progress.",
  },
  {
    icon: Sparkles,
    title: "Personalized Recommendations",
    text: "The next best topic to study, with the reason it was chosen.",
  },
  {
    icon: MessageSquare,
    title: "Chat History",
    text: "Every conversation saved, searchable and ready to resume.",
  },
];

const steps = [
  { icon: Upload, title: "Upload or Ask", text: "Add a PDF, snap an image, speak or simply type." },
  {
    icon: Brain,
    title: "AI Understands",
    text: "Learnexa reads, extracts and structures the content.",
  },
  {
    icon: ListChecks,
    title: "Learn Interactively",
    text: "Summaries, notes, flashcards and quizzes generated for you.",
  },
  {
    icon: BarChart3,
    title: "Track Your Progress",
    text: "Streaks, scores and weak topics guide what to study next.",
  },
];

const flow = ["Upload", "Understand", "Practice", "Revise", "Track"];

function Landing() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-surface relative overflow-hidden">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
            <div className="space-y-7">
              <span className="border-primary/20 bg-primary/5 text-primary inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium">
                <Sparkles className="size-3.5" /> Learn Smarter. Understand Deeper. Grow Faster.
              </span>
              <h1 className="text-4xl leading-[1.1] font-semibold sm:text-5xl lg:text-6xl">
                Your <span className="text-gradient-brand">AI-Powered</span> Learning Companion
              </h1>
              <p className="text-muted-foreground max-w-xl text-base sm:text-lg">
                Learnexa understands your documents, questions, voice and images to create a
                personalized learning experience.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button variant="hero" size="lg" asChild>
                  <Link to="/role">
                    Get Started <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <a href="#features">Explore Features</a>
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-2">
                {flow.map((item, i) => (
                  <div key={item} className="flex items-center gap-2">
                    <span className="bg-card border-border shadow-soft rounded-full border px-3 py-1.5 text-xs font-medium">
                      {item}
                    </span>
                    {i < flow.length - 1 && (
                      <ArrowRight className="text-muted-foreground size-3.5" aria-hidden="true" />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <HeroPreview />
          </div>
        </section>

        {/* Features */}
        <section
          id="features"
          className="mx-auto max-w-7xl scroll-mt-20 px-4 py-20 sm:px-6 lg:px-8"
        >
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold sm:text-4xl">Everything you need to learn</h2>
            <p className="text-muted-foreground mt-3">
              One assistant for reading, practising, revising and tracking — across every format
              your syllabus throws at you.
            </p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <article key={f.title} className="card-surface hover-lift p-6">
                <span className="bg-primary/10 text-primary mb-4 grid size-11 place-items-center rounded-2xl">
                  <f.icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="text-base font-semibold">{f.title}</h3>
                <p className="text-muted-foreground mt-1.5 text-sm">{f.text}</p>
              </article>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="bg-gradient-soft scroll-mt-20 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-semibold sm:text-4xl">How it works</h2>
              <p className="text-muted-foreground mt-3">
                From raw material to measurable progress in four steps.
              </p>
            </div>
            <ol className="mt-12 grid gap-5 md:grid-cols-4">
              {steps.map((s, i) => (
                <li key={s.title} className="card-surface hover-lift relative p-6">
                  <span className="bg-gradient-brand text-primary-foreground absolute -top-3 left-6 grid size-7 place-items-center rounded-lg text-xs font-semibold">
                    {i + 1}
                  </span>
                  <s.icon className="text-primary mt-3 size-6" aria-hidden="true" />
                  <h3 className="mt-3 text-base font-semibold">{s.title}</h3>
                  <p className="text-muted-foreground mt-1.5 text-sm">{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="bg-gradient-brand shadow-glow relative overflow-hidden rounded-3xl px-6 py-14 text-center sm:px-12">
            <h2 className="text-primary-foreground text-3xl font-semibold sm:text-4xl">
              Start learning with Learnexa today
            </h2>
            <p className="text-primary-foreground/85 mx-auto mt-3 max-w-xl">
              Individual learners and institutions both get a workspace built around real progress.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button size="lg" variant="secondary" asChild>
                <Link to="/role">Get Started</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent text-primary-foreground border-primary-foreground/40 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                asChild
              >
                <Link to="/login">I already have an account</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
