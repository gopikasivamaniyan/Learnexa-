import { createFileRoute } from "@tanstack/react-router";
import {
  Brain,
  Copy,
  FileText,
  Globe,
  ImagePlus,
  Mic,
  Paperclip,
  Send,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/states";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { api, endpoints } from "@/lib/api";
import { LANGUAGES } from "@/lib/languages";

export const Route = createFileRoute("/learn/tutor")({
  head: () => ({
    meta: [
      { title: "AI Tutor — Learnexa" },
      {
        name: "description",
        content: "Ask questions by text, voice, image or file and get structured explanations.",
      },
      { property: "og:title", content: "AI Tutor — Learnexa" },
      { property: "og:description", content: "Your multimodal AI tutor inside Learnexa." },
    ],
  }),
  component: TutorPage,
});

type Message = { id: string; role: "user" | "assistant"; text: string; time: string };

const suggestions = [
  "Explain recursion with a simple example",
  "Difference between SQL and NoSQL",
  "Give me 5 quiz questions on DBMS",
  "Summarise gradient descent in 5 bullets",
];

type ChatSession = { id: string; title: string; preview: string; date: string; messages: number };

// NOTE: if your api base URL does NOT already end with "/api", change these to "/api/...".
const UPLOAD_DOC = "/documents";
const IMAGE_ASK = "/tutor/image";
const docChat = (id: string) => `/documents/${id}/chat`;

function TutorPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [language, setLanguage] = useState("en");
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [attachedFile, setAttachedFile] = useState<{ id: string; name: string } | null>(null);
  const [attachedImage, setAttachedImage] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [listening, setListening] = useState(false);

  const endRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recRef = useRef<any>(null);

  const loadHistory = () => {
    api
      .get<{ sessions: ChatSession[] }>(endpoints.chatHistory)
      .then((res) => setChatHistory(res.sessions))
      .catch(() => undefined);
  };

  useEffect(loadHistory, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pending]);

  // Stop the mic if the user leaves the page
  useEffect(() => () => recRef.current?.stop?.(), []);

  const onPickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    setUploading(true);
    try {
      const res = await api.post<{ document: { id: string; name: string } }>(UPLOAD_DOC, fd);
      setAttachedFile({ id: res.document.id, name: res.document.name });
      setAttachedImage(null);
      toast.success(`${file.name} attached. Ippo adha pathi question kelunga`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "File upload failed");
    } finally {
      setUploading(false);
    }
  };

  const onPickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setAttachedImage(file);
    setAttachedFile(null);
    toast.success("Image attached. Image pathi question type panni send pannunga");
  };

  const toggleVoice = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) {
      toast.error("Voice input Chrome / Edge-la mattum work aagum");
      return;
    }
    if (listening) {
      recRef.current?.stop();
      return;
    }
    const rec = new SR();
    rec.lang = language === "en" ? "en-IN" : `${language}-IN`;
    rec.interimResults = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      const t = e.results[0][0].transcript as string;
      setInput((prev) => (prev ? prev + " " : "") + t);
    };
    rec.onerror = () => {
      toast.error("Voice capture failed. Mic permission check pannunga");
      setListening(false);
    };
    rec.onend = () => setListening(false);
    recRef.current = rec;
    try {
      rec.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  };

  const send = async (text: string) => {
    const value = text.trim();
    if (!value || pending) return;
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMessages((m) => [...m, { id: crypto.randomUUID(), role: "user", text: value, time: now }]);
    setInput("");
    setPending(true);
    try {
      let reply: string;
      if (attachedImage) {
        const fd = new FormData();
        fd.append("question", value);
        fd.append("language", language);
        fd.append("image", attachedImage);
        reply = (await api.post<{ reply: string }>(IMAGE_ASK, fd)).reply;
        setAttachedImage(null);
      } else if (attachedFile) {
        reply = (
          await api.post<{ reply: string }>(docChat(attachedFile.id), {
            message: value,
            language,
          })
        ).reply;
      } else {
        reply = (await api.post<{ reply: string }>(endpoints.chat, { message: value, language }))
          .reply;
      }
      const replyTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setMessages((m) => [
        ...m,
        { id: crypto.randomUUID(), role: "assistant", text: reply, time: replyTime },
      ]);
      loadHistory();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "The AI tutor could not respond");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="AI Tutor"
        description="Ask anything — by text, voice, image or document."
        actions={
          <>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-40" aria-label="Response language">
                <Globe className="size-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((l) => (
                  <SelectItem key={l.code} value={l.code}>
                    {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" disabled={messages.length === 0}>
                  <Trash2 className="size-4" /> Clear
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear this conversation?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This removes all messages from the current chat. This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={async () => {
                      try {
                        await api.delete(endpoints.chatHistory);
                        setMessages([]);
                        setChatHistory([]);
                        setAttachedFile(null);
                        setAttachedImage(null);
                        toast.success("Conversation cleared");
                      } catch (err) {
                        toast.error(
                          err instanceof Error ? err.message : "Could not clear the conversation",
                        );
                      }
                    }}
                  >
                    Clear chat
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_18rem]">
        <div className="card-surface flex h-[calc(100vh-15rem)] min-h-[32rem] flex-col overflow-hidden">
          <div className="flex-1 space-y-5 overflow-y-auto p-5">
            {messages.length === 0 && !pending && (
              <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                <span className="bg-gradient-brand shadow-soft grid size-14 place-items-center rounded-2xl">
                  <Brain className="text-primary-foreground size-7" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-lg font-semibold">What would you like to understand?</h2>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Start with one of these, or type your own question.
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="border-border bg-card hover:border-primary/40 hover:bg-primary/5 rounded-full border px-3.5 py-2 text-xs transition-colors"
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
                  <div className="min-w-0 flex-1 space-y-2">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.text}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        void navigator.clipboard.writeText(m.text);
                        toast.success("Response copied");
                      }}
                    >
                      <Copy className="size-3.5" /> Copy
                    </Button>
                  </div>
                </div>
              ),
            )}

            {pending && (
              <div className="flex gap-3">
                <span className="bg-gradient-brand grid size-8 shrink-0 place-items-center rounded-xl">
                  <Brain className="text-primary-foreground size-4" />
                </span>
                <div className="flex items-center gap-1 py-2">
                  {[0, 150, 300].map((d) => (
                    <span
                      key={d}
                      className="bg-primary/60 size-2 animate-bounce rounded-full"
                      style={{ animationDelay: `${d}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="border-border border-t p-3">
            {(attachedFile || attachedImage || uploading) && (
              <div className="mb-2 flex flex-wrap gap-2">
                {uploading && (
                  <span className="bg-muted rounded-full px-3 py-1 text-xs">Uploading…</span>
                )}
                {attachedFile && (
                  <span className="bg-muted flex items-center gap-1.5 rounded-full px-3 py-1 text-xs">
                    <FileText className="size-3.5" /> {attachedFile.name}
                    <button onClick={() => setAttachedFile(null)} aria-label="Remove file">
                      <X className="size-3.5" />
                    </button>
                  </span>
                )}
                {attachedImage && (
                  <span className="bg-muted flex items-center gap-1.5 rounded-full px-3 py-1 text-xs">
                    <ImagePlus className="size-3.5" /> {attachedImage.name}
                    <button onClick={() => setAttachedImage(null)} aria-label="Remove image">
                      <X className="size-3.5" />
                    </button>
                  </span>
                )}
              </div>
            )}
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder={
                attachedImage
                  ? "Ask a question about the image…"
                  : attachedFile
                    ? "Ask a question about the file…"
                    : "Ask Learnexa anything…"
              }
              className="min-h-20 resize-none border-0 shadow-none focus-visible:ring-0"
              aria-label="Your question"
            />
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              className="hidden"
              onChange={onPickFile}
            />
            <input
              ref={imageRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onPickImage}
            />
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Attach file"
                  disabled={uploading}
                  onClick={() => fileRef.current?.click()}
                >
                  <Paperclip className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Attach image"
                  onClick={() => imageRef.current?.click()}
                >
                  <ImagePlus className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Voice input"
                  onClick={toggleVoice}
                  className={listening ? "animate-pulse text-red-500" : ""}
                >
                  <Mic className="size-4" />
                </Button>
              </div>
              <Button
                variant="hero"
                onClick={() => send(input)}
                disabled={!input.trim() || pending}
              >
                <Send className="size-4" /> Send
              </Button>
            </div>
          </div>
        </div>

        <aside className="card-surface hidden h-fit p-4 lg:block">
          <h2 className="mb-3 text-sm font-semibold">Recent chats</h2>
          <div className="space-y-2">
            {chatHistory.map((c) => (
              <button
                key={c.id}
                className="hover:bg-muted/70 w-full rounded-xl p-3 text-left transition-colors"
                onClick={() => toast("Open the full chat history to revisit past sessions")}
              >
                <p className="truncate text-sm font-medium">{c.title}</p>
                <p className="text-muted-foreground truncate text-xs">{c.preview}</p>
                <p className="text-muted-foreground mt-1 text-[11px]">
                  {c.date} · {c.messages} messages
                </p>
              </button>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}