// Server-only data access. Uses Postgres when DATABASE_URL is set (cluster),
// otherwise falls back to built-in demo data (Lovable preview).
import { getCookie, setCookie, deleteCookie } from "@tanstack/react-start/server";

export type Pipeline = {
  id: number;
  name: string;
  status: "success" | "failed" | "running";
  branch: string;
  duration_sec: number;
  last_run: string;
};
export type Insight = { id: number; title: string; metric: string; value: number; trend: number };
export type DailyStat = { day: string; builds: number; failures: number; deploys: number };

const DEMO_USER = { username: "admin", password: "SuperIntel@123" };

const now = Date.now();
const demoPipelines: Pipeline[] = [
  ["superintel-web", "success", "main", 312, 1],
  ["superintel-api", "running", "develop", 188, 0.2],
  ["model-trainer", "failed", "feature/gpu", 903, 3],
  ["data-ingest", "success", "main", 145, 5],
  ["inference-gateway", "success", "release/2.4", 421, 8],
  ["feature-store", "failed", "main", 260, 12],
].map(([name, status, branch, d, h], i) => ({
  id: i + 1,
  name: name as string,
  status: status as Pipeline["status"],
  branch: branch as string,
  duration_sec: d as number,
  last_run: new Date(now - (h as number) * 3600_000).toISOString(),
}));
const demoInsights: Insight[] = [
  { id: 1, title: "Deployment frequency", metric: "deploys/day", value: 14, trend: 12 },
  { id: 2, title: "Change failure rate", metric: "%", value: 6.4, trend: -2.1 },
  { id: 3, title: "Lead time for changes", metric: "hours", value: 3.2, trend: -18 },
  { id: 4, title: "Mean time to recovery", metric: "minutes", value: 27, trend: -9 },
];
const demoDaily: DailyStat[] = Array.from({ length: 14 }, (_, i) => {
  const d = new Date(now - (13 - i) * 86400_000);
  return {
    day: d.toISOString().slice(5, 10),
    builds: 30 + ((i * 7) % 17),
    failures: 2 + ((i * 3) % 5),
    deploys: 10 + ((i * 5) % 8),
  };
});

type PgPool = { query: (q: string, v?: unknown[]) => Promise<{ rows: any[] }> };
let pool: PgPool | null = null;
async function db(): Promise<PgPool | null> {
  const url = process.env["DATABASE_URL"];
  if (!url) return null;
  if (!pool) {
    const pg = await import("pg");
    const Pool = (pg as any).Pool ?? (pg as any).default.Pool;
    pool = new Pool({ connectionString: url, max: 5 });
  }
  return pool;
}

// ---------- sessions (HMAC-signed cookie) ----------
const COOKIE = "si_session";
const secret = () => process.env["SESSION_SECRET"] || "dev-only-secret-change-me";

async function sign(value: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/[+/=]/g, "");
}

export async function currentUser(): Promise<string | null> {
  const raw = getCookie(COOKIE);
  if (!raw) return null;
  const [user, sig] = raw.split(".");
  if (!user || !sig) return null;
  return (await sign(user)) === sig ? decodeURIComponent(user) : null;
}

export async function requireUser() {
  const u = await currentUser();
  if (!u) throw new Error("Unauthorized");
  return u;
}

export async function verifyLogin(username: string, password: string) {
  const p = await db();
  let ok = false;
  if (p) {
    const r = await p.query(
      "select 1 from app_users where username = $1 and password_hash = crypt($2, password_hash)",
      [username, password],
    );
    ok = r.rows.length > 0;
  } else {
    ok =
      (username === DEMO_USER.username && password === DEMO_USER.password) ||
      demoAccounts.get(username) === password;
  }
  if (!ok) return false;
  const u = encodeURIComponent(username);
  setCookie(COOKIE, `${u}.${await sign(u)}`, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return true;
}

const demoAccounts = new Map<string, string>(); // preview only, resets on restart

export async function createAccount(fullName: string, username: string, password: string) {
  const p = await db();
  if (p) {
    await p.query("alter table app_users add column if not exists full_name text");
    const r = await p.query(
      "insert into app_users (username, password_hash, full_name) values ($1, crypt($2, gen_salt('bf')), $3) on conflict (username) do nothing returning id",
      [username, password, fullName],
    );
    return r.rows.length > 0;
  }
  if (username === DEMO_USER.username || demoAccounts.has(username)) return false;
  demoAccounts.set(username, password);
  return true;
}

export function clearSession() {
  deleteCookie(COOKIE, { path: "/" });
}

// ---------- data ----------
export async function loadPipelines(): Promise<Pipeline[]> {
  const p = await db();
  if (!p) return demoPipelines;
  const r = await p.query(
    "select id, name, status, branch, duration_sec, last_run from pipelines order by last_run desc",
  );
  return r.rows.map((x) => ({ ...x, last_run: new Date(x.last_run).toISOString() }));
}
export async function loadInsights(): Promise<Insight[]> {
  const p = await db();
  if (!p) return demoInsights;
  const r = await p.query("select id, title, metric, value::float, trend::float from insights order by id");
  return r.rows;
}
export async function loadDaily(): Promise<DailyStat[]> {
  const p = await db();
  if (!p) return demoDaily;
  const r = await p.query(
    "select to_char(day,'MM-DD') as day, builds, failures, deploys from daily_stats order by day",
  );
  return r.rows;
}
export async function dataSource() {
  return (await db()) ? "postgres" : "demo";
}
