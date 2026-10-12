import { createFileRoute } from "@tanstack/react-router";
import { FileText, Search, Trash2, Upload } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import { toast } from "sonner";
import { EmptyState, LoadingState, PageHeader } from "@/components/common/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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

type Material = {
  id: string;
  title: string;
  course: string;
  type: string;
  size: string;
  uploadedAt: string;
};
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/institution/materials")({
  head: () => ({
    meta: [
      { title: "Learning Materials — Learnexa for Institutions" },
      {
        name: "description",
        content: "Distribute lecture notes, manuals and slides to every enrolled student.",
      },
      { property: "og:title", content: "Learning Materials — Learnexa" },
      { property: "og:description", content: "Share course material with your students." },
    ],
  }),
  component: MaterialsPage,
});

function MaterialsPage() {
  const [items, setItems] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [dragging, setDragging] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Material | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api
      .get<{ materials: Material[] }>(endpoints.institution.materials)
      .then((res) => setItems(res.materials))
      .catch((err) => toast.error(err instanceof Error ? err.message : "Could not load materials"))
      .finally(() => setLoading(false));
  }, []);

  const uploadFiles = async (files: File[]) => {
    for (const file of files) {
      const form = new FormData();
      form.append("file", file);
      try {
        const res = await api.upload<{ material: Material }>(endpoints.institution.materials, form);
        setItems((l) => [res.material, ...l]);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : `Could not upload ${file.name}`);
      }
    }
    if (files.length) toast.success(`${files.length} file(s) uploaded`);
  };

  const visible = useMemo(
    () =>
      items.filter(
        (m) =>
          m.title.toLowerCase().includes(query.toLowerCase()) ||
          m.course.toLowerCase().includes(query.toLowerCase()),
      ),
    [items, query],
  );

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length) void uploadFiles(Array.from(e.dataTransfer.files));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Learning Materials"
        description="Upload once — every enrolled student gets AI-ready material."
      />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "cursor-pointer rounded-3xl border-2 border-dashed px-6 py-10 text-center transition-colors",
          dragging ? "border-primary bg-primary/5" : "border-border bg-card",
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx"
          className="sr-only"
          onChange={(e) => {
            if (e.target.files?.length) void uploadFiles(Array.from(e.target.files));
            e.target.value = "";
          }}
        />
        <span className="bg-primary/10 text-primary mx-auto grid size-12 place-items-center rounded-2xl">
          <Upload className="size-5" aria-hidden="true" />
        </span>
        <h2 className="mt-3 text-base font-semibold">Drop course material here</h2>
        <p className="text-muted-foreground mt-1 text-sm">PDF, DOCX and slides up to 50 MB.</p>
      </div>

      <div className="relative max-w-md">
        <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search materials…"
          className="pl-9"
          aria-label="Search materials"
        />
      </div>

      {loading ? (
        <LoadingState label="Loading materials…" />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No materials found"
          description="Upload a file to begin."
        />
      ) : (
        <div className="card-surface divide-border divide-y p-2">
          {visible.map((m) => (
            <div key={m.id} className="hover:bg-muted/60 flex items-center gap-3 rounded-xl p-4">
              <span className="bg-primary/10 text-primary grid size-10 shrink-0 place-items-center rounded-xl">
                <FileText className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{m.title}</p>
                <p className="text-muted-foreground text-xs">
                  {m.size} · uploaded {m.uploadedAt}
                </p>
              </div>
              <Badge variant="secondary" className="rounded-full">
                {m.course}
              </Badge>
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-destructive"
                aria-label={`Delete ${m.title}`}
                onClick={() => setPendingDelete(m)}
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
            <AlertDialogTitle>Delete this material?</AlertDialogTitle>
            <AlertDialogDescription>
              "{pendingDelete?.title}" will no longer be available to students.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!pendingDelete) return;
                try {
                  await api.delete(`${endpoints.institution.materials}/${pendingDelete.id}`);
                  setItems((l) => l.filter((x) => x.id !== pendingDelete.id));
                  toast.success("Material deleted");
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Could not delete material");
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
