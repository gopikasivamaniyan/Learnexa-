import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import {
  Bell,
  ChevronLeft,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { clearSession } from "@/lib/api";

export type NavItem = { label: string; to: string; icon: LucideIcon };

export function AppShell({
  items,
  children,
  userName,
  userInitials,
  userRole,
  settingsPath,
  profilePath,
}: {
  items: NavItem[];
  children: ReactNode;
  userName: string;
  userInitials: string;
  userRole: string;
  settingsPath: string;
  profilePath?: string;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const logout = () => {
    clearSession();
    toast.success("Signed out of Learnexa");
    void navigate({ to: "/login" });
  };

  const nav = (
    <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Main">
      {items.map((item) => {
        const active = pathname === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
              active
                ? "bg-gradient-brand text-primary-foreground shadow-soft"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="size-4.5 shrink-0" aria-hidden="true" />
            <span className={cn("truncate", collapsed && "lg:hidden")}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="bg-gradient-surface flex min-h-screen">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "bg-sidebar border-sidebar-border sticky top-0 hidden h-screen shrink-0 flex-col border-r transition-all duration-300 lg:flex",
          collapsed ? "w-[76px]" : "w-64",
        )}
      >
        <div className="flex h-16 items-center justify-between px-4">
          <Logo showWordmark={!collapsed} />
        </div>
        {nav}
        <div className="border-sidebar-border border-t p-3">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-3"
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <PanelLeftOpen className="size-4.5" aria-hidden="true" />
            ) : (
              <>
                <PanelLeftClose className="size-4.5" aria-hidden="true" />
                Collapse
              </>
            )}
          </Button>
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="bg-foreground/30 absolute inset-0 backdrop-blur-sm"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
          />
          <div className="bg-sidebar absolute inset-y-0 left-0 flex w-72 flex-col shadow-xl">
            <div className="flex h-16 items-center justify-between px-4">
              <Logo />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation"
              >
                <X className="size-5" />
              </Button>
            </div>
            {nav}
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="bg-background/80 border-border sticky top-0 z-40 flex h-16 items-center gap-3 border-b px-4 backdrop-blur-md sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
          >
            <Menu className="size-5" />
          </Button>

          <div className="relative hidden max-w-sm flex-1 sm:block">
            <Search
              className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
              aria-hidden="true"
            />
            <Input
              placeholder="Search topics, documents, notes…"
              className="bg-muted/60 rounded-xl border-transparent pl-9"
              aria-label="Search Learnexa"
            />
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              aria-label="Notifications"
              onClick={() => toast("3 new learning updates")}
            >
              <Bell className="size-5" />
              <span className="bg-destructive absolute top-2 right-2 size-2 rounded-full" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="hover:bg-muted flex items-center gap-2 rounded-xl px-1.5 py-1.5 transition-colors"
                  aria-label="Account menu"
                >
                  <Avatar className="size-8">
                    <AvatarFallback className="bg-gradient-brand text-primary-foreground text-xs font-semibold">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden text-left sm:block">
                    <span className="block text-sm leading-tight font-medium">{userName}</span>
                    <span className="text-muted-foreground block text-xs leading-tight">
                      {userRole}
                    </span>
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>My account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {profilePath && (
                  <DropdownMenuItem asChild>
                    <Link to={profilePath}>Profile</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link to={settingsPath}>
                    <Settings className="mr-2 size-4" /> Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive">
                  <LogOut className="mr-2 size-4" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

export function BackLink({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
    >
      <ChevronLeft className="size-4" aria-hidden="true" /> {label}
    </Link>
  );
}
