import { Link } from "@tanstack/react-router";
import { Brain, Maximize2, Send, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { api, endpoints } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Msg = { role: "user" | "assistant"; text: string };

/** Compact tutor panel. Wired to the Flask API later via endpoints.chat. */
export function FloatingTutor() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", text: "Hi Gopika! Ask me anything about what you're studying." },
  ]);
  const [pending, setPending] = useState(false);

  const send = async () => {
    const text = input.trim();
    if (!text) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setPending(true);
    try {
      const res = await api.post<{ reply: string }>(endpoints.chat, { message: text });
      setMessages((m) => [...m, { role: "assistant", text: res.reply }]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "The AI tutor could not respond");
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      {open && (
        <div className="card-surface shadow-glow fixed right-4 bottom-24 z-50 flex h-[26rem] w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden">
          <div className="bg-gradient-brand flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <Brain className="text-primary-foreground size-4" aria-hidden="true" />
              <p className="text-primary-foreground text-sm font-semibold">AI Tutor</p>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                asChild
                className="text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
              >
                <Link to="/learn/tutor" aria-label="Open full tutor">
                  <Maximize2 className="size-4" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setOpen(false)}
                aria-label="Close tutor"
                className="text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === "user"
                    ? "bg-primary text-primary-foreground ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm px-3 py-2 text-sm"
                    : "text-foreground max-w-[90%] text-sm"
                }
              >
                {m.text}
              </div>
            ))}
            {pending && <p className="text-muted-foreground animate-pulse text-sm">Thinking…</p>}
          </div>

          <div className="border-border flex items-center gap-2 border-t p-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask a quick doubt…"
              aria-label="Message the AI tutor"
            />
            <Button size="icon" variant="hero" onClick={send} aria-label="Send message">
              <Send className="size-4" />
            </Button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="bg-gradient-brand text-primary-foreground shadow-glow fixed right-4 bottom-4 z-50 grid size-14 place-items-center rounded-2xl transition-transform hover:scale-105"
        aria-label={open ? "Close AI tutor" : "Open AI tutor"}
      >
        {open ? <X className="size-6" /> : <Brain className="size-6" />}
      </button>
    </>
  );
}
