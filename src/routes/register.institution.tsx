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

export const Route = createFileRoute("/register/institution")({
  head: () => ({
    meta: [
      { title: "Register your institution — Learnexa" },
      {
        name: "description",
        content:
          "Create an institution account to manage students, teachers, courses and learning progress on Learnexa.",
      },
      { property: "og:title", content: "Register your institution — Learnexa" },
      {
        property: "og:description",
        content: "Manage students, teachers, courses and progress in one AI learning platform.",
      },
    ],
  }),
  component: InstitutionRegister,
});

function InstitutionRegister() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agree, setAgree] = useState(false);
  const [form, setForm] = useState({
    institution: "",
    type: "",
    adminName: "",
    email: "",
    phone: "",
    students: "",
    password: "",
    confirm: "",
  });

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.institution || !form.adminName || !form.email || !form.password) {
      setError("Please complete the required fields.");
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
        endpoints.auth.registerInstitution,
        {
          institutionName: form.institution,
          email: form.email,
          password: form.password,
          contactPerson: form.adminName,
          phone: form.phone,
        },
      );
      setSession(res.token, res.user);
      toast.success("Institution registered successfully");
      void navigate({ to: "/institution" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not register your institution.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Register your institution"
      subtitle="Manage students, teachers, courses and learning progress."
      highlights={[
        "Onboard students and teachers centrally",
        "Distribute courses and learning materials",
        "Track cohort progress and quiz performance",
      ]}
      footer={
        <>
          Already registered?{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="institution">Institution name</Label>
          <Input
            id="institution"
            value={form.institution}
            onChange={(e) => setForm({ ...form, institution: e.target.value })}
            placeholder="Nexa Institute of Technology"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="type">Institution type</Label>
            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
              <SelectTrigger id="type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="school">School</SelectItem>
                <SelectItem value="college">College</SelectItem>
                <SelectItem value="university">University</SelectItem>
                <SelectItem value="training">Training institute</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="students">Number of students</Label>
            <Select value={form.students} onValueChange={(v) => setForm({ ...form, students: v })}>
              <SelectTrigger id="students">
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0-100">Up to 100</SelectItem>
                <SelectItem value="100-500">100 – 500</SelectItem>
                <SelectItem value="500-2000">500 – 2,000</SelectItem>
                <SelectItem value="2000+">2,000+</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="adminName">Administrator name</Label>
          <Input
            id="adminName"
            value={form.adminName}
            onChange={(e) => setForm({ ...form, adminName: e.target.value })}
            placeholder="Dr. Meera Nair"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="email">Official email</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="admin@campus.edu"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+91 98765 43210"
            />
          </div>
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

        <label className="text-muted-foreground flex items-start gap-2 text-sm">
          <Checkbox
            checked={agree}
            onCheckedChange={(v) => setAgree(v === true)}
            className="mt-0.5"
            aria-label="Accept terms"
          />
          I confirm I am authorised to register this institution and accept the terms.
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
          {loading ? "Submitting…" : "Register institution"}
        </Button>
      </form>
    </AuthLayout>
  );
}
