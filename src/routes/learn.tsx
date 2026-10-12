import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { learnerNav } from "@/components/layout/navigation";
import { FloatingTutor } from "@/components/learn/FloatingTutor";
import { getStoredUser, getToken, initialsOf } from "@/lib/api";

export const Route = createFileRoute("/learn")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !getToken()) {
      throw redirect({ to: "/login" });
    }
  },
  component: LearnerLayout,
});

function LearnerLayout() {
  const user = getStoredUser();
  return (
    <AppShell
      items={learnerNav}
      userName={user?.name ?? "Learner"}
      userInitials={initialsOf(user?.name ?? "Learner")}
      userRole="Learner"
      settingsPath="/learn/settings"
      profilePath="/learn/profile"
    >
      <Outlet />
      <FloatingTutor />
    </AppShell>
  );
}
