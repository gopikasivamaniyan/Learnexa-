import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  CheckCircle2,
  FileImage,
  FileText,
  Layers,
  ListChecks,
  Loader2,
  MessageSquare,
  MoreVertical,
  Search,
  Send,
  SlidersHorizontal,
  StickyNote,
  Trash2,
  Upload,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import { toast } from "sonner";
import { EmptyState, LoadingState, PageHeader } from "@/components/common/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { api, endpoints } from "@/lib/api";
import { cn } from "@/lib/utils";

type DocumentItem = {
  id: string;
  name: string;
  type: "pdf" | "docx" | "image";
  size: string;
  pages: number;
  subject: string;
  uploadedAt: string;
  status: "ready" | "processing" | "failed";
};

type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  answerIndex: number;
  topic: string;
  explanation: string;
};

type ChatMsg = { role: "user" | "assistant"; text: string };

export const Route = createFileRoute("/learn/documents")({
  head: () => ({
    meta: [
      { title: "Documents — Learnexa" },
      {
        name: "description",
        content:
          "Upload PDFs, DOCX files and images, then generate summaries, notes, flashcards and quizzes.",
      },
      { property: "og:title", content: "Documents — Learnexa" },
      { property: "og:description", content: "Your AI-ready study library." },
    ],
  }),
  component: DocumentsPage,
});

const typeIcon = { pdf: FileText, docx: FileText, image: FileImage };

// If your quiz-submit endpoint is defined in endpoints, replace this string with it.
const QUIZ_SUBMIT = "/quiz/submit";

function DocumentsPage() {
  const navigate = useNavigate();

  const [items, setItems] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("recent");
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<DocumentItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // which "docId:action" is currently running (for button spinners)
  const [busy, setBusy] = useState<string | null>(null);

  // summary dialog
  const [summaryDoc, setSummaryDoc] = useState<DocumentItem | null>(null);
  const [summaryText, setSummaryText] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);

  // chat dialog
  const [chatDoc, setChatDoc] = useState<DocumentItem | null>(null);
  const [chatMsgs, setChatMsgs] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatPending, setChatPending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // quiz dialog
  const [quizDoc, setQuizDoc] = useState<DocumentItem | null>(null);
  const [quizQs, setQuizQs] = useState<QuizQuestion[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizDone, setQuizDone] = useState(false);

  const loadDocuments = () => {
    setLoading(true);
    api
      .get<{ documents: DocumentItem[] }>(endpoints.documents)
      .then((res) => setItems(res.documents))
      .catch((err) => toast.error(err instanceof Error ? err.message : "Could not load documents"))
      .finally(() => setLoading(false));
  };

  useEffect(loadDocuments, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMsgs, chatPending]);

  /* ----------------------------- upload ----------------------------- */

  const uploadFiles = async (files: File[]) => {
    setUploading(true);
    let ok = 0;
    for (const file of files) {
      const form = new FormData();
      form.append("file", file);
      try {
        const res = await api.upload<{ document: DocumentItem }>(endpoints.documents, form);
        setItems((list) => [res.document, ...list]);
        ok += 1;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : `Could not upload ${file.name}`);
      }
    }
    setUploading(false);
    if (ok) toast.success(`${ok} file(s) uploaded`);
  };

  /* ----------------------------- summary ---------------------------- */

  const generateSummary = async (d: DocumentItem) => {
    setSummaryDoc(d);
    setSummaryLoading(true);
    setSummaryText("");
    try {
      const res = await api.post<{ summary: string }>(`${endpoints.documents}/${d.id}/summary`);
      setSummaryText(res.summary);
    } catch (err) {
      setSummaryText(err instanceof Error ? err.message : "Could not generate a summary.");
    } finally {
      setSummaryLoading(false);
    }
  };

  /* ------------------------------ chat ------------------------------ */

  const openChat = (d: DocumentItem) => {
    setChatDoc(d);
    setChatMsgs([]);
    setChatInput("");
  };

  const sendChat = async () => {
    const value = chatInput.trim();
    if (!value || !chatDoc || chatPending) return;
    setChatMsgs((m) => [...m, { role: "user", text: value }]);
    setChatInput("");
    setChatPending(true);
    try {
      const res = await api.post<{ reply: string }>(`${endpoints.documents}/${chatDoc.id}/chat`, {
        message: value,
        language: "en",
      });
      setChatMsgs((m) => [...m, { role: "assistant", text: res.reply }]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "The AI could not respond");
    } finally {
      setChatPending(false);
    }
  };

  /* ------------------------ notes / flashcards ----------------------- */

  const generateNotes = async (d: DocumentItem) => {
    setBusy(`${d.id}:notes`);
    try {
      await api.post(`${endpoints.documents}/${d.id}/notes`);
      toast.success("Notes created", {
        action: { label: "View notes", onClick: () => navigate({ to: "/learn/notes" }) },
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create notes");
    } finally {
      setBusy(null);
    }
  };

  const generateFlashcards = async (d: DocumentItem) => {
    setBusy(`${d.id}:flashcards`);
    try {
      const res = await api.post<{ flashcards: unknown[] }>(
        `${endpoints.documents}/${d.id}/flashcards`,
      );
      toast.success(`${res.flashcards?.length ?? 0} flashcards created`, {
        action: { label: "View", onClick: () => navigate({ to: "/learn/flashcards" }) },
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create flashcards");
    } finally {
      setBusy(null);
    }
  };

  /* ------------------------------ quiz ------------------------------ */

  const generateQuiz = async (d: DocumentItem) => {
    setBusy(`${d.id}:quiz`);
    try {
      const res = await api.post<{ questions: QuizQuestion[] }>(
        `${endpoints.documents}/${d.id}/quiz`,
      );
      if (!res.questions?.length) {
        toast.error("Could not generate quiz questions from this document");
        return;
      }
      setQuizQs(res.questions);
      setQuizAnswers({});
      setQuizDone(false);
      setQuizDoc(d);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create the quiz");
    } finally {
      setBusy(null);
    }
  };

  const submitQuiz = async () => {
    setQuizDone(true);
    try {
      await api.post(QUIZ_SUBMIT, { questions: quizQs, answers: quizAnswers });
    } catch {
      /* scoring is local; saving progress is best-effort */
    }
  };

  const quizScore = quizQs.filter((q) => quizAnswers[q.id] === q.answerIndex).length;

  /* ----------------------------- list view --------------------------- */

  const visible = useMemo(() => {
    let list = items.filter(
      (d) =>
        d.name.toLowerCase().includes(query.toLowerCase()) ||
        d.subject.toLowerCase().includes(query.toLowerCase()),
    );
    if (filter !== "all") list = list.filter((d) => d.type === filter);
    list = [...list].sort((a, b) =>
      sort === "name" ? a.name.localeCompare(b.name) : b.uploadedAt.localeCompare(a.uploadedAt),
    );
    return list;
  }, [items, query, filter, sort]);

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;
    void uploadFiles(files);
  };

  const Spinner = () => <Loader2 className="size-3.5 animate-spin" />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents"
        description="Upload your study material and let Learnexa turn it into learning."
        actions={
          <Button variant="hero" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            {uploading ? <Spinner /> : <Upload className="size-4" />} Upload
          </Button>
        }
      />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "rounded-3xl border-2 border-dashed px-6 py-12 text-center transition-colors",
          dragging ? "border-primary bg-primary/5" : "border-border bg-card",
        )}
      >
        <span className="bg-primary/10 text-primary mx-auto grid size-14 place-items-center rounded-2xl">
          <Upload className="size-6" aria-hidden="true" />
        </span>
        <h2 className="mt-4 text-base font-semibold">Drag and drop your files here</h2>
        <p className="text-muted-foreground mt-1 text-sm">PDF, DOCX and images up to 25 MB each.</p>
        <label className="mt-4 inline-block">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.docx,image/*"
            className="sr-only"
            onChange={(e) => {
              if (e.target.files?.length) void uploadFiles(Array.from(e.target.files));
              e.target.value = "";
            }}
          />
          <span className="border-input bg-background hover:bg-muted inline-flex h-10 cursor-pointer items-center rounded-xl border px-4 text-sm font-medium">
            {uploading ? "Uploading…" : "Browse files"}
          </span>
        </label>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documents…"
            className="pl-9"
            aria-label="Search documents"
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="sm:w-40" aria-label="Filter by type">
            <SlidersHorizontal className="size-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="pdf">PDF</SelectItem>
            <SelectItem value="docx">DOCX</SelectItem>
            <SelectItem value="image">Image</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="sm:w-40" aria-label="Sort documents">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most recent</SelectItem>
            <SelectItem value="name">Name (A–Z)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <LoadingState label="Loading your documents…" />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No documents found"
          description="Try a different search or upload a new file to get started."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((d) => {
            const Icon = typeIcon[d.type];
            const notReady = d.status !== "ready";
            return (
              <article key={d.id} className="card-surface hover-lift flex flex-col p-5">
                <div className="flex items-start gap-3">
                  <span className="bg-primary/10 text-primary grid size-11 shrink-0 place-items-center rounded-2xl">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold">{d.name}</h3>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      {d.subject} · {d.pages} pages · {d.size}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${d.name}`}>
                        <MoreVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => generateSummary(d)}>
                        View / summarize
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openChat(d)}>
                        Chat with document
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setPendingDelete(d)}
                      >
                        <Trash2 className="mr-2 size-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mt-3">
                  <Badge
                    variant="secondary"
                    className={cn(
                      "rounded-full",
                      d.status === "processing" && "bg-warning/20 text-warning-foreground",
                      d.status === "failed" && "bg-destructive/10 text-destructive",
                    )}
                  >
                    {d.status === "ready"
                      ? "Ready"
                      : d.status === "processing"
                        ? "Processing…"
                        : "Failed"}
                  </Badge>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Button variant="soft" size="sm" disabled={notReady} onClick={() => openChat(d)}>
                    <MessageSquare className="size-3.5" /> Chat
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={notReady || busy === `${d.id}:notes`}
                    onClick={() => generateNotes(d)}
                  >
                    {busy === `${d.id}:notes` ? <Spinner /> : <StickyNote className="size-3.5" />}
                    Notes
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={notReady || busy === `${d.id}:flashcards`}
                    onClick={() => generateFlashcards(d)}
                  >
                    {busy === `${d.id}:flashcards` ? <Spinner /> : <Layers className="size-3.5" />}
                    Flashcards
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={notReady || busy === `${d.id}:quiz`}
                    onClick={() => generateQuiz(d)}
                  >
                    {busy === `${d.id}:quiz` ? <Spinner /> : <ListChecks className="size-3.5" />}
                    Quiz
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  disabled={notReady}
                  onClick={() => generateSummary(d)}
                >
                  Generate summary
                </Button>
              </article>
            );
          })}
        </div>
      )}

      {/* delete confirm */}
      <AlertDialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this document?</AlertDialogTitle>
            <AlertDialogDescription>
              "{pendingDelete?.name}" and everything generated from it will be removed. This cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!pendingDelete) return;
                try {
                  await api.delete(`${endpoints.documents}/${pendingDelete.id}`);
                  setItems((list) => list.filter((x) => x.id !== pendingDelete.id));
                  toast.success("Document deleted");
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Could not delete document");
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

      {/* summary dialog */}
      <Dialog open={!!summaryDoc} onOpenChange={(o) => !o && setSummaryDoc(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{summaryDoc?.name}</DialogTitle>
          </DialogHeader>
          {summaryLoading ? (
            <LoadingState label="Summarizing…" />
          ) : (
            <p className="text-sm whitespace-pre-line">{summaryText}</p>
          )}
        </DialogContent>
      </Dialog>

      {/* chat dialog */}
      <Dialog open={!!chatDoc} onOpenChange={(o) => !o && setChatDoc(null)}>
        <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="truncate pr-6">Chat · {chatDoc?.name}</DialogTitle>
          </DialogHeader>
          <div className="min-h-[14rem] flex-1 space-y-3 overflow-y-auto py-2">
            {chatMsgs.length === 0 && (
              <p className="text-muted-foreground py-8 text-center text-sm">
                Ask anything about this document.
              </p>
            )}
            {chatMsgs.map((m, i) => (
              <div key={i} className={cn("flex", m.role === "user" && "justify-end")}>
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap",
                    m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted",
                  )}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {chatPending && (
              <div className="bg-muted inline-flex rounded-2xl px-4 py-2.5">
                <Loader2 className="size-4 animate-spin" />
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <div className="flex gap-2">
            <Input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void sendChat();
                }
              }}
              placeholder="Ask about this document…"
              aria-label="Your question"
            />
            <Button
              variant="hero"
              onClick={() => void sendChat()}
              disabled={!chatInput.trim() || chatPending}
            >
              <Send className="size-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* quiz dialog */}
      <Dialog open={!!quizDoc} onOpenChange={(o) => !o && setQuizDoc(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="truncate pr-6">Quiz · {quizDoc?.name}</DialogTitle>
          </DialogHeader>

          {quizDone && (
            <div className="bg-primary/10 text-primary rounded-2xl px-4 py-3 text-sm font-semibold">
              You scored {quizScore} / {quizQs.length}
            </div>
          )}

          <div className="space-y-5">
            {quizQs.map((q, qi) => (
              <div key={q.id} className="space-y-2">
                <p className="text-sm font-medium">
                  {qi + 1}. {q.question}
                </p>
                <div className="space-y-1.5">
                  {q.options.map((opt, oi) => {
                    const picked = quizAnswers[q.id] === oi;
                    const isAnswer = q.answerIndex === oi;
                    return (
                      <button
                        key={oi}
                        type="button"
                        disabled={quizDone}
                        onClick={() => setQuizAnswers((a) => ({ ...a, [q.id]: oi }))}
                        className={cn(
                          "flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left text-sm transition-colors",
                          !quizDone && picked && "border-primary bg-primary/10",
                          !quizDone && !picked && "border-border hover:bg-muted",
                          quizDone && isAnswer && "border-green-500 bg-green-500/10",
                          quizDone && picked && !isAnswer && "border-destructive bg-destructive/10",
                          quizDone && !picked && !isAnswer && "border-border opacity-70",
                        )}
                      >
                        <span>{opt}</span>
                        {quizDone && isAnswer && (
                          <CheckCircle2 className="size-4 shrink-0 text-green-600" />
                        )}
                        {quizDone && picked && !isAnswer && (
                          <XCircle className="text-destructive size-4 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
                {quizDone && q.explanation && (
                  <p className="text-muted-foreground text-xs">{q.explanation}</p>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            {quizDone ? (
              <>
                <Button variant="outline" onClick={() => setQuizDoc(null)}>
                  Close
                </Button>
                <Button
                  variant="hero"
                  onClick={() => {
                    setQuizAnswers({});
                    setQuizDone(false);
                  }}
                >
                  Retry
                </Button>
              </>
            ) : (
              <Button
                variant="hero"
                onClick={() => void submitQuiz()}
                disabled={Object.keys(quizAnswers).length < quizQs.length}
              >
                Submit answers
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}