import { createFileRoute } from "@tanstack/react-router";
import { Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/institution/settings")({
  head: () => ({
    meta: [
      { title: "Institution Settings — Learnexa" },
      {
        name: "description",
        content: "Institution profile, access rules and reporting preferences.",
      },
      { property: "og:title", content: "Institution Settings — Learnexa" },
      { property: "og:description", content: "Control how your institution uses Learnexa." },
    ],
  }),
  component: InstitutionSettings,
});

function InstitutionSettings() {
  const [profile, setProfile] = useState({
    name: "Nexa Institute of Technology",
    email: "admin@nexa.edu",
    phone: "+91 98765 43210",
    address: "Coimbatore, Tamil Nadu",
  });
  const [flags, setFlags] = useState({
    selfRegistration: false,
    weeklyReports: true,
    teacherUploads: true,
    riskAlerts: true,
  });

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader title="Settings" description="Institution profile and platform rules." />

      <section className="card-surface space-y-4 p-6">
        <h2 className="text-base font-semibold">Institution profile</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="i-name">Institution name</Label>
            <Input
              id="i-name"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="i-email">Admin email</Label>
            <Input
              id="i-email"
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="i-phone">Phone</Label>
            <Input
              id="i-phone"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="i-address">Address</Label>
            <Input
              id="i-address"
              value={profile.address}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
            />
          </div>
        </div>
        <Button variant="hero" onClick={() => toast.success("Institution profile saved")}>
          <Save className="size-4" /> Save profile
        </Button>
      </section>

      <section className="card-surface space-y-5 p-6">
        <h2 className="text-base font-semibold">Access & reporting</h2>
        <Row
          id="self-reg"
          label="Allow student self-registration"
          hint="Off by default — students are added by administrators only."
          checked={flags.selfRegistration}
          onChange={(v) => setFlags({ ...flags, selfRegistration: v })}
        />
        <Separator />
        <Row
          id="teacher-uploads"
          label="Allow teachers to upload materials"
          hint="Teachers can publish files directly to their courses."
          checked={flags.teacherUploads}
          onChange={(v) => setFlags({ ...flags, teacherUploads: v })}
        />
        <Separator />
        <Row
          id="weekly-reports"
          label="Weekly performance report"
          hint="Emailed to administrators every Monday."
          checked={flags.weeklyReports}
          onChange={(v) => setFlags({ ...flags, weeklyReports: v })}
        />
        <Separator />
        <Row
          id="risk-alerts"
          label="At-risk student alerts"
          hint="Notify when a student's quiz average drops below 65%."
          checked={flags.riskAlerts}
          onChange={(v) => setFlags({ ...flags, riskAlerts: v })}
        />
        <Button variant="hero" onClick={() => toast.success("Settings saved")}>
          Save settings
        </Button>
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
