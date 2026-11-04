import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getMe, login } from "@/lib/api.functions";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    const { user } = await getMe();
    if (user) throw redirect({ to: "/dashboard" });
  },
  head: () => ({
    meta: [
      { title: "Sign in — SuperIntelligence" },
      { name: "description", content: "Sign in to the SuperIntelligence delivery platform." },
      { property: "og:title", content: "Sign in — SuperIntelligence" },
      { property: "og:description", content: "Pipelines, insights and delivery dashboards." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await login({ data: { username, password } });
      if (r.ok) navigate({ to: "/dashboard" });
      else setError("Invalid username or password");
    } catch {
      setError("Sign in failed, please try again");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid-bg flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-5 h-12 w-12 rounded-lg bg-gradient-brand shadow-glow" />
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">Organisation</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-foreground">SuperIntelligence</h1>
        </div>
        <form onSubmit={submit} className="space-y-4 rounded-xl border bg-card p-6 shadow-panel">
          <div className="space-y-2">
            <Label htmlFor="u">Username</Label>
            <Input id="u" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="p">Password</Label>
            <Input id="p" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </div>
    </main>
  );
}
