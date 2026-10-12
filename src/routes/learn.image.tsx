import { createFileRoute } from "@tanstack/react-router";
import { Brain, ImagePlus, Send, Trash2, Upload } from "lucide-react";
import { useState, type DragEvent } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/states";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { api, endpoints } from "@/lib/api";

export const Route = createFileRoute("/learn/image")({
  head: () => ({
    meta: [
      { title: "Image Question — Learnexa" },
      {
        name: "description",
        content: "Upload a diagram, chart or handwritten sum and get it explained or solved.",
      },
      { property: "og:title", content: "Image Question — Learnexa" },
      { property: "og:description", content: "Learn from any image with Learnexa." },
    ],
  }),
  component: ImageQuestionPage,
});

const examples = ["Explain this diagram", "Solve this problem", "Explain this chart"];

function ImageQuestionPage() {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [question, setQuestion] = useState("");
  const [dragging, setDragging] = useState(false);
  const [pending, setPending] = useState(false);
  const [answer, setAnswer] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const accept = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    setPreview(URL.createObjectURL(file));
    setFileName(file.name);
    setImageFile(file);
    setAnswer("");
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    accept(e.dataTransfer.files[0]);
  };

  const ask = async () => {
    if (!preview || !imageFile) {
      toast.error("Upload an image first");
      return;
    }
    if (!question.trim()) {
      toast.error("Add a question about the image");
      return;
    }
    setPending(true);
    try {
      const form = new FormData();
      form.append("image", imageFile);
      form.append("question", question);
      const res = await api.upload<{ reply: string }>(endpoints.imageQuestion, form);
      setAnswer(res.reply);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not analyse the image");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Image Question"
        description="Snap a diagram, chart or sum — Learnexa reads it and explains."
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-4">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={cn(
              "rounded-3xl border-2 border-dashed p-6 text-center transition-colors",
              dragging ? "border-primary bg-primary/5" : "border-border bg-card",
            )}
          >
            {preview ? (
              <div className="space-y-3">
                <img
                  src={preview}
                  alt={`Preview of ${fileName}`}
                  className="mx-auto max-h-80 rounded-2xl object-contain"
                />
                <p className="text-muted-foreground truncate text-xs">{fileName}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => {
                    setPreview(null);
                    setFileName("");
                    setAnswer("");
                  }}
                >
                  <Trash2 className="size-3.5" /> Remove image
                </Button>
              </div>
            ) : (
              <div className="py-10">
                <span className="bg-primary/10 text-primary mx-auto grid size-14 place-items-center rounded-2xl">
                  <ImagePlus className="size-6" aria-hidden="true" />
                </span>
                <h2 className="mt-4 text-base font-semibold">Drop your image here</h2>
                <p className="text-muted-foreground mt-1 text-sm">PNG, JPG or HEIC up to 10 MB.</p>
                <label className="mt-4 inline-block">
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => accept(e.target.files?.[0])}
                  />
                  <span className="border-input bg-background hover:bg-muted inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border px-4 text-sm font-medium">
                    <Upload className="size-4" /> Browse image
                  </span>
                </label>
              </div>
            )}
          </div>

          <div className="card-surface space-y-3 p-4">
            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What would you like to know about this image?"
              className="min-h-24"
              aria-label="Your question about the image"
            />
            <div className="flex flex-wrap gap-2">
              {examples.map((ex) => (
                <button
                  key={ex}
                  onClick={() => setQuestion(ex)}
                  className="border-border hover:border-primary/40 hover:bg-primary/5 rounded-full border px-3 py-1.5 text-xs transition-colors"
                >
                  {ex}
                </button>
              ))}
            </div>
            <Button variant="hero" className="w-full" onClick={ask} disabled={pending}>
              <Send className="size-4" /> {pending ? "Analysing…" : "Ask Learnexa"}
            </Button>
          </div>
        </div>

        <div className="card-surface min-h-72 p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Brain className="text-primary size-4" /> Explanation
          </h2>
          {pending ? (
            <p className="text-muted-foreground mt-4 animate-pulse text-sm">Reading your image…</p>
          ) : answer ? (
            <p className="mt-4 text-sm leading-relaxed">{answer}</p>
          ) : (
            <p className="text-muted-foreground mt-4 text-sm">
              Upload an image and ask a question to see the explanation here.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
