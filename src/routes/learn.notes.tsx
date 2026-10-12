import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus, Search, Sparkles, StickyNote, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { EmptyState, LoadingState, PageHeader } from "@/components/common/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

export const Route = createFileRoute("/learn/notes")({
  head: () => ({
    meta: [
      { title: "Notes — Learnexa" },
      {
        name: "description",
        content: "Search, write and auto-generate study notes in one organised workspace.",
      },
      { property: "og:title", content: "Notes — Learnexa" },
      { property: "og:description", content: "AI-generated and handwritten notes together." },
    ],
  }),
  component: NotesPage,
});

type Note = {
  id: string;
  title: string;
  subject: string;
  source: "ai" | "manual";
  updatedAt: string;
  content: string;
};

function NotesPage() {
  const [items, setItems] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Note | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Note | null>(null);

  useEffect(() => {
    api
      .get<{ notes: Note[] }>(endpoints.notes)
      .then((res) => setItems(res.notes))
      .catch((err) => toast.error(err instanceof Error ? err.message : "Could not load notes"))
      .finally(() => setLoading(false));
  }, []);

  const visible = useMemo(
    () =>
      items.filter(
        (n) =>
          n.title.toLowerCase().includes(query.toLowerCase()) ||
          n.content.toLowerCase().includes(query.toLowerCase()),
      ),
    [items, query],
  );

  const startNew = () =>
    setEditing({
      id: crypto.randomUUID(),
      title: "",
      subject: "General",
      source: "manual",
      updatedAt: new Date().toISOString().slice(0, 10),
      content: "",
    });

  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!editing) return;
    if (!editing.title.trim()) {
      toast.error("Please add a title");
      return;
    }
    setSaving(true);
    try {
      const isNew = !items.some((n) => n.id === editing.id);
      if (isNew) {
        const res = await api.post<{ note: Note }>(endpoints.notes, {
          title: editing.title,
          subject: editing.subject,
          content: editing.content,
        });
        setItems((list) => [res.note, ...list]);
      } else {
        const res = await api.put<{ note: Note }>(`${endpoints.notes}/${editing.id}`, {
          title: editing.title,
          subject: editing.subject,
          content: editing.content,
        });
        setItems((list) => list.map((n) => (n.id === editing.id ? res.note : n)));
      }
      toast.success("Note saved");
      setEditing(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save note");
    } finally {
      setSaving(false);
    }
  };

  const [generating, setGenerating] = useState(false);
  const generateWithAi = async () => {
    setGenerating(true);
    try {
      const res = await api.post<{ note: Note }>(endpoints.notes, {
        title: "AI note",
        subject: "General",
        content: "",
        generate: true,
      });
      setItems((list) => [res.note, ...list]);
      toast.success("Note generated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not generate a note");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <LoadingState label="Loading notes…" />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notes"
        description="Everything you've written and everything Learnexa generated for you."
        actions={
          <>
            <Button variant="outline" onClick={generateWithAi} disabled={generating}>
              <Sparkles className="size-4" /> {generating ? "Generating…" : "Generate with AI"}
            </Button>
            <Button variant="hero" onClick={startNew}>
              <Plus className="size-4" /> New note
            </Button>
          </>
        }
      />

      <div className="relative max-w-md">
        <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search notes…"
          className="pl-9"
          aria-label="Search notes"
        />
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={StickyNote}
          title="No notes yet"
          description="Create your first note or generate one from a document."
          action={
            <Button variant="hero" onClick={startNew}>
              <Plus className="size-4" /> New note
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((n) => (
            <article key={n.id} className="card-surface hover-lift flex flex-col p-5">
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-sm font-semibold">{n.title}</h2>
                <Badge
                  variant="secondary"
                  className={
                    n.source === "ai" ? "bg-primary/10 text-primary rounded-full" : "rounded-full"
                  }
                >
                  {n.source === "ai" ? "AI" : "Manual"}
                </Badge>
              </div>
              <p className="text-muted-foreground mt-1 text-xs">
                {n.subject} · updated {n.updatedAt}
              </p>
              <p className="text-muted-foreground mt-3 line-clamp-5 flex-1 text-sm whitespace-pre-line">
                {n.content}
              </p>
              <div className="mt-4 flex gap-2">
                <Button variant="soft" size="sm" onClick={() => setEditing(n)}>
                  <Pencil className="size-3.5" /> Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => setPendingDelete(n)}
                >
                  <Trash2 className="size-3.5" /> Delete
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing?.title ? "Edit note" : "New note"}</DialogTitle>
            <DialogDescription>Notes sync to your Learnexa account.</DialogDescription>
          </DialogHeader>
          {editing && (
            <div className="space-y-3">
              <Input
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                placeholder="Note title"
                aria-label="Note title"
              />
              <Input
                value={editing.subject}
                onChange={(e) => setEditing({ ...editing, subject: e.target.value })}
                placeholder="Subject"
                aria-label="Subject"
              />
              <Textarea
                value={editing.content}
                onChange={(e) => setEditing({ ...editing, content: e.target.value })}
                placeholder="Write your note…"
                className="min-h-48"
                aria-label="Note content"
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button variant="hero" onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save note"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this note?</AlertDialogTitle>
            <AlertDialogDescription>
              "{pendingDelete?.title}" will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!pendingDelete) return;
                try {
                  await api.delete(`${endpoints.notes}/${pendingDelete.id}`);
                  setItems((l) => l.filter((n) => n.id !== pendingDelete.id));
                  toast.success("Note deleted");
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Could not delete note");
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
