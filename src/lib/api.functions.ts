import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const getMe = createServerFn({ method: "GET" }).handler(async () => {
  const { currentUser } = await import("./data.server");
  return { user: await currentUser() };
});

export const login = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ username: z.string().min(1).max(100), password: z.string().min(1).max(200) }).parse(d),
  )
  .handler(async ({ data }) => {
    const { verifyLogin } = await import("./data.server");
    return { ok: await verifyLogin(data.username, data.password) };
  });

export const logout = createServerFn({ method: "POST" }).handler(async () => {
  const { clearSession } = await import("./data.server");
  clearSession();
  return { ok: true };
});

export const getDashboard = createServerFn({ method: "GET" }).handler(async () => {
  const m = await import("./data.server");
  await m.requireUser();
  const [pipelines, insights, daily, source] = await Promise.all([
    m.loadPipelines(),
    m.loadInsights(),
    m.loadDaily(),
    m.dataSource(),
  ]);
  return { pipelines, insights, daily, source };
});
