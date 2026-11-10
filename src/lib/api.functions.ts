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

export const signup = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        fullName: z.string().trim().min(1).max(100),
        username: z.string().trim().regex(/^[a-zA-Z0-9._-]{3,40}$/),
        password: z.string().min(8).max(200),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { createAccount, verifyLogin } = await import("./data.server");
    const created = await createAccount(data.fullName, data.username, data.password);
    if (!created) return { ok: false, error: "That username is already taken" };
    await verifyLogin(data.username, data.password);
    return { ok: true, error: "" };
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
