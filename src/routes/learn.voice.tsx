import { createFileRoute } from "@tanstack/react-router";
import { Copy, Mic, Square, Trash2, Volume2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/states";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LANGUAGES } from "@/lib/languages";
import { cn } from "@/lib/utils";
import { api, endpoints } from "@/lib/api";

interface SpeechRecognitionResultLike {
  results: { transcript: string }[][];
}
interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  onresult: ((e: SpeechRecognitionResultLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}
declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  }
}

const SPEECH_LOCALE: Record<string, string> = {
  en: "en-US",
  ta: "ta-IN",
  hi: "hi-IN",
  ml: "ml-IN",
  te: "te-IN",
  kn: "kn-IN",
};

export const Route = createFileRoute("/learn/voice")({
  head: () => ({
    meta: [
      { title: "Voice Tutor — Learnexa" },
      {
        name: "description",
        content:
          "Speak your doubt in English, Tamil, Hindi, Malayalam, Telugu or Kannada and hear the answer.",
      },
      { property: "og:title", content: "Voice Tutor — Learnexa" },
      { property: "og:description", content: "Hands-free learning with the Learnexa voice tutor." },
    ],
  }),
  component: VoiceTutorPage,
});

type State = "ready" | "listening" | "processing" | "speaking";

const stateCopy: Record<State, { label: string; hint: string }> = {
  ready: { label: "AI Ready", hint: "Tap the microphone and ask your question." },
  listening: { label: "Listening", hint: "Speak clearly — tap again to stop." },
  processing: { label: "Processing", hint: "Understanding your question…" },
  speaking: { label: "AI Speaking", hint: "Playing the answer aloud." },
};

function VoiceTutorPage() {
  const [state, setState] = useState<State>("ready");
  const [language, setLanguage] = useState("en");
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [speed, setSpeed] = useState([1]);
  const [transcript, setTranscript] = useState("");
  const [answer, setAnswer] = useState("");
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const speak = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = SPEECH_LOCALE[language] ?? "en-US";
    utter.rate = speed[0] ?? 1;
    utter.onend = () => setState("ready");
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  };

  const ask = async (text: string) => {
    setState("processing");
    try {
      const res = await api.post<{ reply: string }>(endpoints.chat, { message: text, language });
      setAnswer(res.reply);
      if (autoSpeak) {
        setState("speaking");
        speak(res.reply);
      } else {
        setState("ready");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "The AI tutor could not respond");
      setState("ready");
    }
  };

  const toggle = () => {
    if (state === "listening") {
      recognitionRef.current?.stop();
      return;
    }
    const SpeechRecognitionCtor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
      toast.error("Voice input isn't supported in this browser. Try Chrome or Edge.");
      return;
    }
    const recognition = new SpeechRecognitionCtor();
    recognition.lang = SPEECH_LOCALE[language] ?? "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (e: SpeechRecognitionResultLike) => {
      const text = e.results[0]?.[0]?.transcript ?? "";
      setTranscript(text);
      void ask(text);
    };
    recognition.onerror = () => {
      toast.error("Couldn't hear that clearly — please try again.");
      setState("ready");
    };
    recognition.onend = () => {
      setState((s) => (s === "listening" ? "ready" : s));
    };
    recognitionRef.current = recognition;
    setState("listening");
    recognition.start();
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Voice Tutor" description="Ask out loud, listen to the explanation." />

      <div className="grid gap-5 lg:grid-cols-[1fr_20rem]">
        <div className="card-surface bg-gradient-soft flex flex-col items-center justify-center gap-6 px-6 py-16">
          <div className="relative grid place-items-center">
            {state === "listening" && (
              <span className="bg-primary/30 animate-pulse-ring absolute size-36 rounded-full" />
            )}
            <button
              onClick={toggle}
              className={cn(
                "shadow-glow relative grid size-32 place-items-center rounded-full transition-transform hover:scale-105",
                state === "listening" ? "bg-destructive" : "bg-gradient-brand",
              )}
              aria-label={state === "listening" ? "Stop listening" : "Start listening"}
            >
              {state === "listening" ? (
                <Square className="text-primary-foreground size-10" />
              ) : (
                <Mic className="text-primary-foreground size-12" />
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-lg font-semibold">{stateCopy[state].label}</p>
            <p className="text-muted-foreground mt-1 text-sm">{stateCopy[state].hint}</p>
          </div>

          <Button variant="outline" onClick={toggle}>
            {state === "listening" ? "Stop" : "Start"} listening
          </Button>

          {(transcript || answer) && (
            <div className="w-full max-w-xl space-y-3">
              {transcript && (
                <div className="bg-card border-border rounded-2xl border p-4">
                  <p className="text-muted-foreground text-xs font-medium">You said</p>
                  <p className="mt-1 text-sm">{transcript}</p>
                </div>
              )}
              {answer && (
                <div className="bg-card border-border rounded-2xl border p-4">
                  <p className="text-muted-foreground text-xs font-medium">Learnexa</p>
                  <p className="mt-1 text-sm leading-relaxed">{answer}</p>
                  <div className="mt-3 flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        void navigator.clipboard.writeText(answer);
                        toast.success("Answer copied");
                      }}
                    >
                      <Copy className="size-3.5" /> Copy
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setState("speaking");
                        speak(answer);
                      }}
                    >
                      <Volume2 className="size-3.5" /> Replay
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <aside className="card-surface h-fit space-y-6 p-5">
          <h2 className="text-sm font-semibold">Voice settings</h2>

          <div className="space-y-2">
            <Label htmlFor="voice-lang">Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger id="voice-lang">
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
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="auto-speak">Auto speak answers</Label>
            <Switch id="auto-speak" checked={autoSpeak} onCheckedChange={setAutoSpeak} />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Speech speed</Label>
              <span className="text-muted-foreground text-sm">{speed[0]?.toFixed(1)}×</span>
            </div>
            <Slider value={speed} onValueChange={setSpeed} min={0.5} max={2} step={0.1} />
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setTranscript("");
              setAnswer("");
              setState("ready");
              toast.success("Session cleared");
            }}
          >
            <Trash2 className="size-4" /> Clear session
          </Button>
        </aside>
      </div>
    </div>
  );
}
