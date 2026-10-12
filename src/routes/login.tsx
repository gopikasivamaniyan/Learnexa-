import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { api, endpoints, setSession, type AuthUser } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in — Learnexa" },
      { name: "description", content: "Log in to your Learnexa learner or institution account." },
      { property: "og:title", content: "Log in — Learnexa" },
      { property: "og:description", content: "Access your AI-powered learning workspace." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<"learner" | "institution">("learner");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ email: "", password: "" });

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.email || !form.password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post<{ token: string; user: AuthUser }>(endpoints.auth.login, {
        ...form,
        role,
      });
      setSession(res.token, res.user);
      toast.success(`Welcome back, ${res.user.name.split(" ")[0]}!`);
      void navigate({ to: res.user.role === "learner" ? "/learn" : "/institution" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to continue your learning journey."
      footer={
        <>
          New to Learnexa?{" "}
          <Link to="/role" className="text-primary font-medium hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <Tabs value={role} onValueChange={(v) => setRole(v as typeof role)} className="mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="learner">Learner</TabsTrigger>
          <TabsTrigger value="institution">Institution</TabsTrigger>
        </TabsList>
      </Tabs>

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox id="remember" /> Remember me
          </label>
          <button type="button" className="text-primary text-sm hover:underline">
            Forgot password?
          </button>
        </div>

        {error && (
          <p
            role="alert"
            className="bg-destructive/10 text-destructive rounded-xl px-3 py-2 text-sm"
          >
            {error}
          </p>
        )}

        <Button type="submit" variant="hero" className="w-full" size="lg" disabled={loading}>
          {loading && <Loader2 className="size-4 animate-spin" />}
          {loading ? "Signing in…" : "Log in"}
        </Button>
      </form>

      {role === "institution" && (
        <p className="text-muted-foreground mt-4 text-center text-xs">
          Students of an institution receive credentials from their administrator.
        </p>
      )}
    </AuthLayout>
  );
}
