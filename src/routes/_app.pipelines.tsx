import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { dashboardQuery, statusClass } from "@/lib/dashboard-query";

export const Route = createFileRoute("/_app/pipelines")({
  loader: ({ context }) => context.queryClient.ensureQueryData(dashboardQuery),
  head: () => ({
    meta: [
      { title: "Pipelines — SuperIntelligence" },
      { name: "description", content: "CI/CD pipeline runs across SuperIntelligence." },
      { property: "og:title", content: "Pipelines — SuperIntelligence" },
      { property: "og:description", content: "CI/CD pipeline runs across SuperIntelligence." },
    ],
  }),
  component: Pipelines,
});

function Pipelines() {
  const { data } = useSuspenseQuery(dashboardQuery);
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Pipelines</h1>
      <div className="overflow-hidden rounded-xl border bg-card shadow-panel">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Branch</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Duration</th>
              <th className="px-4 py-3">Last run</th>
            </tr>
          </thead>
          <tbody>
            {data.pipelines.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.branch}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusClass[p.status]}`}>{p.status}</span>
                </td>
                <td className="px-4 py-3 font-mono">{Math.floor(p.duration_sec / 60)}m {p.duration_sec % 60}s</td>
                <td className="px-4 py-3 text-muted-foreground">{new Date(p.last_run).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
