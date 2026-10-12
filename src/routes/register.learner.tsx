import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { api, endpoints, setSession, type AuthUser } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/register/learner")({
  head: () => ({
    meta: [
      { title: "Create a learner account — Learnexa" },
      {
        name: "description",
        content: "Sign up as an individual learner and get your personal AI learning assistant.",
      },
      { property: "og:title", content: "Create a learner account — Learnexa" },
      {
        property: "og:description",
        content: "Your personal multimodal AI tutor for documents, voice and images.",
      },
    ],
  }),
  component: LearnerRegister,
});

function LearnerRegister() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
    level: "",
    goal: "",
  });
  const [agree, setAgree] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.name || !form.email || !form.password) {
      setError("Please fill in your name, email and password.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (!agree) {
      setError("Please accept the terms to continue.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post<{ token: string; user: AuthUser }>(
        endpoints.auth.registerLearner,
        {
          name: form.name,
          email: form.email,
          password: form.password,
          level: form.level,
          goal: form.goal,
        },
      );
      setSession(res.token, res.user);
      toast.success("Account created. Welcome to Learnexa!");
      void navigate({ to: "/learn" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create your account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your learner account"
      subtitle="Learn independently with your personal AI learning assistant."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Gopika S"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm password</Label>
            <Input
              id="confirm"
              type="password"
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="level">Education level</Label>
            <Select value={form.level} onValueChange={(v) => setForm({ ...form, level: v })}>
              <SelectTrigger id="level">
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="school">School</SelectItem>
                <SelectItem value="undergraduate">Undergraduate</SelectItem>
                <SelectItem value="postgraduate">Postgraduate</SelectItem>
                <SelectItem value="professional">Working professional</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="goal">Learning goal</Label>
            <Select value={form.goal} onValueChange={(v) => setForm({ ...form, goal: v })}>
              <SelectTrigger id="goal">
                <SelectValue placeholder="Select goal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="exam">Exam preparation</SelectItem>
                <SelectItem value="skills">Skill building</SelectItem>
                <SelectItem value="revision">Faster revision</SelectItem>
                <SelectItem value="concepts">Concept clarity</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <label className="text-muted-foreground flex items-start gap-2 text-sm">
          <Checkbox
            checked={agree}
            onCheckedChange={(v) => setAgree(v === true)}
            className="mt-0.5"
            aria-label="Accept terms"
          />
          I agree to the Terms of Service and Privacy Policy.
        </label>

        {error && (
          <p
            role="alert"
            className="bg-destructive/10 text-destructive rounded-xl px-3 py-2 text-sm"
          >
            {error}
          </p>
        )}

        <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
          {loading && <Loader2 className="size-4 animate-spin" />}
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </form>
    </AuthLayout>
  );
}
