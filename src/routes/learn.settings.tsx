import { createFileRoute } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/states";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
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
import { LANGUAGES } from "@/lib/languages";

export const Route = createFileRoute("/learn/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Learnexa" },
      {
        name: "description",
        content: "Control notifications, study reminders and AI preferences.",
      },
      { property: "og:title", content: "Settings — Learnexa" },
      { property: "og:description", content: "Tune Learnexa to the way you study." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const [prefs, setPrefs] = useState({
    reminders: true,
    weeklyReport: true,
    quizAlerts: false,
    autoSummary: true,
    autoFlashcards: false,
  });
  const [language, setLanguage] = useState("en");
  const [difficulty, setDifficulty] = useState("adaptive");

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader title="Settings" description="Preferences for notifications and AI behaviour." />

      <section className="card-surface space-y-5 p-6">
        <h2 className="text-base font-semibold">Notifications</h2>
        <Row
          id="reminders"
          label="Daily study reminders"
          hint="A nudge at your preferred study time."
          checked={prefs.reminders}
          onChange={(v) => setPrefs({ ...prefs, reminders: v })}
        />
        <Separator />
        <Row
          id="weekly"
          label="Weekly progress report"
          hint="A summary of study time and quiz scores every Sunday."
          checked={prefs.weeklyReport}
          onChange={(v) => setPrefs({ ...prefs, weeklyReport: v })}
        />
        <Separator />
        <Row
          id="quiz"
          label="Quiz alerts"
          hint="Tell me when new quizzes are ready from my documents."
          checked={prefs.quizAlerts}
          onChange={(v) => setPrefs({ ...prefs, quizAlerts: v })}
        />
      </section>

      <section className="card-surface space-y-5 p-6">
        <h2 className="text-base font-semibold">AI preferences</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="lang">Default language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger id="lang">
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
          <div className="space-y-2">
            <Label htmlFor="difficulty">Explanation depth</Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger id="difficulty">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="simple">Keep it simple</SelectItem>
                <SelectItem value="adaptive">Adaptive to my level</SelectItem>
                <SelectItem value="detailed">Detailed and technical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Separator />
        <Row
          id="auto-summary"
          label="Auto-generate summaries on upload"
          hint="Create a summary as soon as a document finishes processing."
          checked={prefs.autoSummary}
          onChange={(v) => setPrefs({ ...prefs, autoSummary: v })}
        />
        <Separator />
        <Row
          id="auto-cards"
          label="Auto-generate flashcards"
          hint="Build a deck from every new document."
          checked={prefs.autoFlashcards}
          onChange={(v) => setPrefs({ ...prefs, autoFlashcards: v })}
        />
        <Button variant="hero" onClick={() => toast.success("Settings saved")}>
          Save settings
        </Button>
      </section>

      <section className="card-surface border-destructive/30 space-y-3 p-6">
        <h2 className="text-destructive text-base font-semibold">Danger zone</h2>
        <p className="text-muted-foreground text-sm">
          Deleting your account removes all documents, notes, flashcards and progress.
        </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">
              <Trash2 className="size-4" /> Delete account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete your Learnexa account?</AlertDialogTitle>
              <AlertDialogDescription>
                This permanently removes your account and all learning data. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => toast.success("Account deletion requested")}>
                Delete account
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </section>
    </div>
  );
}

function Row({
  id,
  label,
  hint,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-6">
      <div>
        <Label htmlFor={id}>{label}</Label>
        <p className="text-muted-foreground mt-1 text-sm">{hint}</p>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
