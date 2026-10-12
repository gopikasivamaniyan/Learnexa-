import { createFileRoute } from "@tanstack/react-router";
import { Flame, Mail, Save, Trophy } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { LoadingState, PageHeader } from "@/components/common/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { api, endpoints, initialsOf } from "@/lib/api";

export const Route = createFileRoute("/learn/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Learnexa" },
      {
        name: "description",
        content: "Manage your Learnexa learner profile, goals and interests.",
      },
      { property: "og:title", content: "Profile — Learnexa" },
      { property: "og:description", content: "Your learning identity on Learnexa." },
    ],
  }),
  component: ProfilePage,
});

type Profile = {
  id: string;
  name: string;
  email: string;
  level: string;
  goal: string;
  streak: number;
};

function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [strongTopics, setStrongTopics] = useState<string[]>([]);
  const [weakTopics, setWeakTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", level: "", goal: "" });

  useEffect(() => {
    api
      .get<{ profile: Profile; strongTopics: string[]; weakTopics: string[] }>(endpoints.profile)
      .then((res) => {
        setProfile(res.profile);
        setStrongTopics(res.strongTopics);
        setWeakTopics(res.weakTopics);
        setForm({ name: res.profile.name, level: res.profile.level, goal: res.profile.goal });
      })
      .catch((err) =>
        toast.error(err instanceof Error ? err.message : "Could not load your profile"),
      )
      .finally(() => setLoading(false));
  }, []);

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put<{ profile: Profile }>(endpoints.profile, form);
      setProfile(res.profile);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update your profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !profile) return <LoadingState label="Loading your profile…" />;

  const initials = initialsOf(profile.name);

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" description="Your details and learning identity." />

      <div className="grid gap-5 lg:grid-cols-[20rem_1fr]">
        <div className="card-surface h-fit p-6 text-center">
          <Avatar className="mx-auto size-20">
            <AvatarFallback className="bg-gradient-brand text-primary-foreground text-xl font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <h2 className="mt-4 text-lg font-semibold">{profile.name}</h2>
          <p className="text-muted-foreground flex items-center justify-center gap-1.5 text-sm">
            <Mail className="size-3.5" /> {profile.email}
          </p>
          <div className="mt-4 flex justify-center gap-2">
            {profile.level && (
              <Badge variant="secondary" className="rounded-full">
                {profile.level}
              </Badge>
            )}
            <Badge className="bg-warning/20 text-warning-foreground rounded-full">
              <Flame className="mr-1 size-3" /> {profile.streak} day streak
            </Badge>
          </div>

          <div className="border-border mt-6 grid grid-cols-2 gap-3 border-t pt-6 text-left">
            <div>
              <p className="text-muted-foreground text-xs">Strong topics</p>
              <p className="text-lg font-semibold">{strongTopics.length}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Needs work</p>
              <p className="text-lg font-semibold">{weakTopics.length}</p>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <form className="card-surface space-y-4 p-6" onSubmit={saveProfile}>
            <h2 className="text-base font-semibold">Personal details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="level">Level</Label>
                <Input
                  id="level"
                  value={form.level}
                  onChange={(e) => setForm({ ...form, level: e.target.value })}
                  placeholder="Beginner / Intermediate / Advanced"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal">Learning goal</Label>
              <Textarea
                id="goal"
                value={form.goal}
                onChange={(e) => setForm({ ...form, goal: e.target.value })}
                className="min-h-20"
              />
            </div>
            <Button type="submit" variant="hero" disabled={saving}>
              <Save className="size-4" /> {saving ? "Saving…" : "Save changes"}
            </Button>
          </form>

          <div className="card-surface p-6">
            <h2 className="mb-3 flex items-center gap-2 text-base font-semibold">
              <Trophy className="text-primary size-4" /> Learning snapshot
            </h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <p className="text-muted-foreground mb-2 text-xs font-medium">Strong topics</p>
                <div className="flex flex-wrap gap-2">
                  {strongTopics.map((t) => (
                    <span
                      key={t}
                      className="bg-success/15 text-success-foreground rounded-full px-3 py-1 text-xs font-medium"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-muted-foreground mb-2 text-xs font-medium">Needs work</p>
                <div className="flex flex-wrap gap-2">
                  {weakTopics.map((t) => (
                    <span
                      key={t}
                      className="bg-warning/20 text-warning-foreground rounded-full px-3 py-1 text-xs font-medium"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
