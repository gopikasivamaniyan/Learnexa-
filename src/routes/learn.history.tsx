import { createFileRoute, Link } from "@tanstack/react-router";
import { History, MessageSquare, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { EmptyState, LoadingState, PageHeader } from "@/components/common/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { api, endpoints } from "@/lib/api";

export const Route = createFileRoute("/learn/history")({
  head: () => ({
    meta: [
      { title: "Chat History — Learnexa" },
      {
        name: "description",
        content: "Search and resume any past conversation with your AI tutor.",
      },
      { property: "og:title", content: "Chat History — Learnexa" },
      { property: "og:description", content: "Every learning conversation, saved." },
    ],
  }),
  component: HistoryPage,
});

type ChatSession = { id: string; title: string; preview: string; date: string; messages: number };

function HistoryPage() {
  const [items, setItems] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [pendingDelete, setPendingDelete] = useState<ChatSession | null>(null);

  useEffect(() => {
    api
      .get<{ sessions: ChatSession[] }>(endpoints.chatHistory)
      .then((res) => setItems(res.sessions))
      .catch((err) =>
        toast.error(err instanceof Error ? err.message : "Could not load chat history"),
      )
      .finally(() => setLoading(false));
  }, []);

  const visible = useMemo(
    () =>
      items.filter(
        (c) =>
          c.title.toLowerCase().includes(query.toLowerCase()) ||
          c.preview.toLowerCase().includes(query.toLowerCase()),
      ),
    [items, query],
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Chat History" description="Pick up any conversation where you left off." />

      <div className="relative max-w-md">
        <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search conversations…"
          className="pl-9"
          aria-label="Search conversations"
        />
      </div>

      {loading ? (
        <LoadingState label="Loading your conversations…" />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={History}
          title="No conversations found"
          description="Start a new chat with the AI Tutor to see it here."
          action={
            <Button variant="hero" asChild>
              <Link to="/learn/tutor">Open AI Tutor</Link>
            </Button>
          }
        />
      ) : (
        <div className="card-surface divide-border divide-y p-2">
          {visible.map((c) => (
            <div key={c.id} className="hover:bg-muted/60 flex items-center gap-3 rounded-xl p-4">
              <span className="bg-primary/10 text-primary grid size-10 shrink-0 place-items-center rounded-xl">
                <MessageSquare className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{c.title}</p>
                <p className="text-muted-foreground truncate text-xs">{c.preview}</p>
              </div>
              <span className="text-muted-foreground hidden text-xs sm:block">
                {c.date} · {c.messages} messages
              </span>
              <Button variant="soft" size="sm" asChild>
                <Link to="/learn/tutor">Resume</Link>
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-destructive"
                aria-label={`Delete ${c.title}`}
                onClick={() => setPendingDelete(c)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              "{pendingDelete?.title}" will be permanently removed from your history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!pendingDelete) return;
                try {
                  await api.delete(endpoints.chatSession(pendingDelete.id));
                  setItems((l) => l.filter((c) => c.id !== pendingDelete.id));
                  toast.success("Conversation deleted");
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Could not delete conversation");
                } finally {
                  setPendingDelete(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
