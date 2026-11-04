import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, GitBranch, Lightbulb, LogOut } from "lucide-react";
import { getMe, logout } from "@/lib/api.functions";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app")({
  beforeLoad: async () => {
    const { user } = await getMe();
    if (!user) throw redirect({ to: "/" });
    return { user };
  },
  component: AppLayout,
});

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/pipelines", label: "Pipelines", icon: GitBranch },
  { to: "/insights", label: "Insights", icon: Lightbulb },
] as const;

function AppLayout() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  return (
    <div className="min-h-screen">
      <header className="border-b bg-card/60 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-gradient-brand" />
            <span className="font-bold tracking-tight">SuperIntelligence</span>
          </div>
          <nav className="flex gap-1">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
                activeProps={{ className: "bg-secondary text-foreground" }}
              >
                <n.icon className="h-4 w-4" /> {n.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <span className="font-mono text-xs text-muted-foreground">{user}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                await logout();
                navigate({ to: "/", replace: true });
              }}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
