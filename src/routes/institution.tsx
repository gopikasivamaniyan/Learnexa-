import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { institutionNav } from "@/components/layout/navigation";
import { getStoredUser, getToken, initialsOf } from "@/lib/api";

export const Route = createFileRoute("/institution")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !getToken()) {
      throw redirect({ to: "/login" });
    }
  },
  component: InstitutionLayout,
});

function InstitutionLayout() {
  const user = getStoredUser();
  return (
    <AppShell
      items={institutionNav}
      userName={user?.name ?? "Institution"}
      userInitials={initialsOf(user?.name ?? "Institution")}
      userRole="Administrator"
      settingsPath="/institution/settings"
    >
      <Outlet />
    </AppShell>
  );
}
