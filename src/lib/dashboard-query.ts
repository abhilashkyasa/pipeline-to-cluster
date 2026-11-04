import { queryOptions } from "@tanstack/react-query";
import { getDashboard } from "./api.functions";

export const dashboardQuery = queryOptions({
  queryKey: ["dashboard"],
  queryFn: () => getDashboard(),
});

export const statusClass = {
  success: "bg-success/15 text-success",
  failed: "bg-destructive/15 text-destructive",
  running: "bg-warning/15 text-warning",
} as const;
