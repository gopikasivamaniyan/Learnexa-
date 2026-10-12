import { createFileRoute } from "@tanstack/react-router";
import { Brain, Copy, FileText, Send, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api, endpoints } from "@/lib/api";
import { EmptyState, LoadingState } from "@/components/common/states";

export const Route = createFileRoute("/learn/pdf-chat")({
  head: () => ({
    meta: [
      { title: "PDF Chat — Learnexa" },
      {
        name: "description",
        content: "Chat with any chapter of your PDF and get page-aware answers instantly.",
      },
      { property: "og:title", content: "PDF Chat — Learnexa" },
      { property: "og:description", content: "Ask your document anything." },
    ],
  }),
  component: PdfChatPage,
});

const suggested = [
  "Explain this chapter simply",
  "What are the important points?",
  "Create 5 quiz questions",
  "Give me revision notes",
];

type Msg = { id: string; role: "user" | "assistant"; text: string };
type DocumentItem = { id: string; name: string; subject: string; pages: number; size: string };

function PdfChatPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [docId, setDocId] = useState<string>("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const doc = documents.find((d) => d.id === docId);

  useEffect(() => {
    api
      .get<{ documents: DocumentItem[] }>(endpoints.documents)
      .then((res) => {
        setDocuments(res.documents);
        if (res.documents[0]) setDocId(res.documents[0].id);
      })
      .catch((err) => toast.error(err instanceof Error ? err.message : "Could not load documents"))
      .finally(() => setLoadingDocs(false));
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pending]);

  const send = async (text: string) => {
    const value = text.trim();
    if (!value || !docId) return;
    setMessages((m) => [...m, { id: crypto.randomUUID(), role: "user", text: value }]);
    setInput("");
    setPending(true);
    try {
      const res = await api.post<{ reply: string }>(endpoints.pdfChat(docId), { message: value });
      setMessages((m) => [...m, { id: crypto.randomUUID(), role: "assistant", text: res.reply }]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not get a reply");
    } finally {
      setPending(false);
    }
  };

  if (loadingDocs) return <LoadingState label="Loading your documents…" />;

  if (!doc) {
    return (
      <div className="space-y-5">
        <PageHeader
          title="PDF Chat"
          description="Ask questions about a specific document and get grounded answers."
        />
        <EmptyState
          icon={FileText}
          title="No documents yet"
          description="Upload a document first to chat with it."
        />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="PDF Chat"
        description="Ask questions about a specific document and get grounded answers."
        actions={
          <Select value={docId} onValueChange={setDocId}>
            <SelectTrigger className="w-64" aria-label="Select document">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {documents.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="card-surface flex h-[calc(100vh-15rem)] min-h-[30rem] flex-col overflow-hidden">
          <div className="border-border flex items-center gap-3 border-b px-4 py-3">
            <span className="bg-primary/10 text-primary grid size-9 place-items-center rounded-xl">
              <FileText className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{doc.name}</p>
              <p className="text-muted-foreground text-xs">
                {doc.pages} pages · {doc.size}
              </p>
            </div>
          </div>
          <div className="bg-muted/40 flex-1 space-y-4 overflow-y-auto p-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-card shadow-soft mx-auto max-w-md rounded-xl p-6">
                <p className="text-xs font-semibold">
                  {doc.subject} — Page {i + 1}
                </p>
                <div className="mt-4 space-y-2">
                  {Array.from({ length: 8 }).map((__, j) => (
                    <div
                      key={j}
                      className="bg-muted h-2 rounded-full"
                      style={{ width: `${70 + ((i * 7 + j * 5) % 30)}%` }}
                    />
                  ))}
                </div>
              </div>
            ))}
            <p className="text-muted-foreground text-center text-xs">
              Live document rendering is served by the Learnexa backend.
            </p>
          </div>
        </section>

        <section className="card-surface flex h-[calc(100vh-15rem)] min-h-[30rem] flex-col overflow-hidden">
          <div className="flex-1 space-y-4 overflow-y-auto p-5">
            {messages.length === 0 && (
              <div className="space-y-3">
                <p className="text-muted-foreground text-sm">Try one of these:</p>
                <div className="grid gap-2">
                  {suggested.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="border-border hover:border-primary/40 hover:bg-primary/5 rounded-xl border px-4 py-2.5 text-left text-sm transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m) =>
              m.role === "user" ? (
                <div key={m.id} className="flex justify-end gap-3">
                  <div className="bg-primary text-primary-foreground max-w-[80%] rounded-2xl rounded-br-sm px-4 py-2.5 text-sm">
                    {m.text}
                  </div>
                  <span className="bg-muted text-muted-foreground grid size-8 shrink-0 place-items-center rounded-xl">
                    <User className="size-4" />
                  </span>
                </div>
              ) : (
                <div key={m.id} className="flex gap-3">
                  <span className="bg-gradient-brand grid size-8 shrink-0 place-items-center rounded-xl">
                    <Brain className="text-primary-foreground size-4" />
                  </span>
                  <div className="flex-1 space-y-2">
                    <p className="text-sm leading-relaxed">{m.text}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        void navigator.clipboard.writeText(m.text);
                        toast.success("Copied");
                      }}
                    >
                      <Copy className="size-3.5" /> Copy
                    </Button>
                  </div>
                </div>
              ),
            )}
            {pending && (
              <p className="text-muted-foreground animate-pulse text-sm">Reading the document…</p>
            )}
            <div ref={endRef} />
          </div>
          <div className="border-border flex items-center gap-2 border-t p-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send(input)}
              placeholder="Ask about this document…"
              aria-label="Ask about this document"
            />
            <Button variant="hero" size="icon" onClick={() => send(input)} aria-label="Send">
              <Send className="size-4" />
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
