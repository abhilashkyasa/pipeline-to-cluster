import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { TrendingDown, TrendingUp } from "lucide-react";
import { dashboardQuery } from "@/lib/dashboard-query";

export const Route = createFileRoute("/_app/insights")({
  loader: ({ context }) => context.queryClient.ensureQueryData(dashboardQuery),
  head: () => ({
    meta: [
      { title: "Insights — SuperIntelligence" },
      { name: "description", content: "Delivery performance insights for SuperIntelligence." },
      { property: "og:title", content: "Insights — SuperIntelligence" },
      { property: "og:description", content: "Delivery performance insights for SuperIntelligence." },
    ],
  }),
  component: Insights,
});

function Insights() {
  const { data } = useSuspenseQuery(dashboardQuery);
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Insights</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {data.insights.map((i) => {
          const up = i.trend >= 0;
          const Icon = up ? TrendingUp : TrendingDown;
          return (
            <div key={i.id} className="rounded-xl border bg-card p-6 shadow-panel">
              <p className="text-sm text-muted-foreground">{i.title}</p>
              <p className="mt-3 font-mono text-4xl font-semibold">
                {i.value} <span className="text-base text-muted-foreground">{i.metric}</span>
              </p>
              <p className={`mt-3 flex items-center gap-1 text-sm ${up ? "text-success" : "text-warning"}`}>
                <Icon className="h-4 w-4" /> {up ? "+" : ""}{i.trend}% vs last period
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
