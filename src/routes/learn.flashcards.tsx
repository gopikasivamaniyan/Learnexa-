import { createFileRoute } from "@tanstack/react-router";
import { Check, ChevronLeft, ChevronRight, Flag, RotateCcw, Shuffle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { EmptyState, LoadingState, PageHeader } from "@/components/common/states";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { api, endpoints } from "@/lib/api";

export const Route = createFileRoute("/learn/flashcards")({
  head: () => ({
    meta: [
      { title: "Flashcards — Learnexa" },
      {
        name: "description",
        content: "Practise with flip cards, mark difficult topics and track what you've mastered.",
      },
      { property: "og:title", content: "Flashcards — Learnexa" },
      { property: "og:description", content: "Active recall practice inside Learnexa." },
    ],
  }),
  component: FlashcardsPage,
});

type Card = { id: string; front: string; back: string; subject: string; status?: string };

function FlashcardsPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [mastered, setMastered] = useState<string[]>([]);
  const [difficult, setDifficult] = useState<string[]>([]);

  useEffect(() => {
    api
      .get<{ flashcards: Card[] }>(endpoints.flashcards)
      .then((res) => {
        setCards(res.flashcards);
        setMastered(res.flashcards.filter((c) => c.status === "mastered").map((c) => c.id));
        setDifficult(res.flashcards.filter((c) => c.status === "difficult").map((c) => c.id));
      })
      .catch((err) => toast.error(err instanceof Error ? err.message : "Could not load flashcards"))
      .finally(() => setLoading(false));
  }, []);

  const card = cards[index]!;
  const go = (delta: number) => {
    setFlipped(false);
    setIndex((i) => (i + delta + cards.length) % cards.length);
  };

  const toggle = async (
    list: string[],
    set: (v: string[]) => void,
    id: string,
    label: "mastered" | "difficult",
  ) => {
    const removing = list.includes(id);
    const next = removing ? list.filter((x) => x !== id) : [...list, id];
    set(next);
    try {
      await api.patch(`${endpoints.flashcards}/${id}`, { status: removing ? "new" : label });
      toast.success(removing ? `Removed from ${label}` : `Marked as ${label}`);
    } catch (err) {
      set(list); // revert
      toast.error(err instanceof Error ? err.message : "Could not update flashcard");
    }
  };

  const [generating, setGenerating] = useState(false);
  const generateMore = async () => {
    setGenerating(true);
    try {
      const res = await api.post<{ flashcards: Card[] }>(endpoints.flashcards, {
        generate: true,
        subject: card?.subject ?? "General",
      });
      setCards((c) => [...c, ...res.flashcards]);
      toast.success("New flashcards generated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not generate flashcards");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <LoadingState label="Loading flashcards…" />;

  if (cards.length === 0)
    return (
      <div className="space-y-6">
        <PageHeader
          title="Flashcards"
          description="Flip, recall and master one concept at a time."
        />
        <EmptyState
          icon={Shuffle}
          title="No flashcards yet"
          description="Generate a deck to start practising."
          action={
            <Button variant="hero" onClick={generateMore} disabled={generating}>
              {generating ? "Generating…" : "Generate flashcards"}
            </Button>
          }
        />
      </div>
    );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Flashcards"
        description="Flip, recall and master one concept at a time."
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setCards((c) => [...c].sort(() => Math.random() - 0.5));
                setIndex(0);
                setFlipped(false);
                toast.success("Deck shuffled");
              }}
              disabled={cards.length === 0}
            >
              <Shuffle className="size-4" /> Shuffle
            </Button>
            <Button variant="soft" onClick={generateMore} disabled={generating}>
              {generating ? "Generating…" : "Generate more"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setMastered([]);
                setDifficult([]);
                setIndex(0);
                setFlipped(false);
                toast.success("Progress reset");
              }}
            >
              <RotateCcw className="size-4" /> Reset
            </Button>
          </>
        }
      />

      <div className="mx-auto max-w-2xl space-y-5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Card {index + 1} of {cards.length}
          </span>
          <span className="text-muted-foreground">
            {mastered.length} mastered · {difficult.length} difficult
          </span>
        </div>
        <Progress value={((index + 1) / cards.length) * 100} className="h-2" />

        <button
          onClick={() => setFlipped((f) => !f)}
          className="group relative block w-full [perspective:1600px]"
          aria-label="Flip card"
        >
          <div
            className="relative h-72 w-full transition-transform duration-500 [transform-style:preserve-3d]"
            style={{ transform: flipped ? "rotateY(180deg)" : undefined }}
          >
            <div className="card-surface absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center [backface-visibility:hidden]">
              <Badge variant="secondary" className="rounded-full">
                {card.subject}
              </Badge>
              <p className="text-xl font-semibold">{card.front}</p>
              <p className="text-muted-foreground text-xs">Click to reveal the answer</p>
            </div>
            <div className="bg-gradient-brand shadow-glow absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl p-8 text-center [backface-visibility:hidden] [transform:rotateY(180deg)]">
              <p className="text-primary-foreground text-lg leading-relaxed font-medium">
                {card.back}
              </p>
            </div>
          </div>
        </button>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button variant="outline" onClick={() => go(-1)}>
            <ChevronLeft className="size-4" /> Previous
          </Button>
          <div className="flex gap-2">
            <Button
              variant={difficult.includes(card.id) ? "destructive" : "outline"}
              onClick={() => toggle(difficult, setDifficult, card.id, "difficult")}
            >
              <Flag className="size-4" /> Difficult
            </Button>
            <Button
              variant={mastered.includes(card.id) ? "accent" : "outline"}
              onClick={() => toggle(mastered, setMastered, card.id, "mastered")}
            >
              <Check className="size-4" /> Mastered
            </Button>
          </div>
          <Button variant="hero" onClick={() => go(1)}>
            Next <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
