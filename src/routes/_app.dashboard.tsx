import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { dashboardQuery } from "@/lib/dashboard-query";

export const Route = createFileRoute("/_app/dashboard")({
  loader: ({ context }) => context.queryClient.ensureQueryData(dashboardQuery),
  head: () => ({
    meta: [
      { title: "Dashboard — SuperIntelligence" },
      { name: "description", content: "Delivery overview for SuperIntelligence." },
      { property: "og:title", content: "Dashboard — SuperIntelligence" },
      { property: "og:description", content: "Delivery overview for SuperIntelligence." },
    ],
  }),
  component: Dashboard,
});

const tip = { contentStyle: { background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 } };

function Dashboard() {
  const { data } = useSuspenseQuery(dashboardQuery);
  const ok = data.pipelines.filter((p) => p.status === "success").length;
  const failed = data.pipelines.filter((p) => p.status === "failed").length;
  const running = data.pipelines.filter((p) => p.status === "running").length;
  const deploys = data.daily.reduce((s, d) => s + d.deploys, 0);
  const stats = [
    { label: "Pipelines", value: data.pipelines.length },
    { label: "Passing", value: ok },
    { label: "Failing", value: failed },
    { label: "Running", value: running },
    { label: "Deploys (14d)", value: deploys },
  ];
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <span className="font-mono text-xs text-muted-foreground">source: {data.source}</span>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border bg-card p-4 shadow-panel">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</p>
            <p className="mt-2 font-mono text-3xl font-semibold">{s.value}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-4 shadow-panel">
          <h2 className="mb-4 text-sm font-semibold">Builds vs failures</h2>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={data.daily}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
              <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} />
              <Tooltip {...tip} />
              <Area dataKey="builds" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.2} />
              <Area dataKey="failures" stroke="var(--chart-3)" fill="var(--chart-3)" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-panel">
          <h2 className="mb-4 text-sm font-semibold">Deployments per day</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.daily}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
              <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} />
              <Tooltip {...tip} />
              <Bar dataKey="deploys" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
