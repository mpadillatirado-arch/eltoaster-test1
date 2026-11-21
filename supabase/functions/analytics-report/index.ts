// Google Analytics numbers for the admin panel at eltoaster.com/admin.
//
// The panel calls this with the signed-in admin's session. The caller is
// checked against public.is_admin() (so only listed admins get data), then the
// function reads GA4 with a read-only Google service account and returns one
// compact JSON the panel can draw.
//
//   POST { days: 7 | 28 | 90 }
//
// Secrets (Supabase → Edge Functions → Secrets):
//   GA_SERVICE_ACCOUNT_JSON  the service account's JSON key (Viewer on the GA property)
//   GA_PROPERTY_ID           optional, defaults to the El Toaster property
//
// Until the secret exists the function answers { configured: false } and the
// panel shows the setup steps instead of numbers.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const PROPERTY = (Deno.env.get("GA_PROPERTY_ID") || "565380788").trim();

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });

/* ---------- who is asking ---------- */

async function isAdmin(authHeader: string | null): Promise<boolean> {
  if (!authHeader?.startsWith("Bearer ")) return false;
  const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/is_admin`, {
    method: "POST",
    headers: { apikey: ANON_KEY, Authorization: authHeader, "Content-Type": "application/json" },
    body: "{}",
  });
  return r.ok && (await r.json()) === true;
}

/* ---------- Google access token from the service account ---------- */

const b64url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const enc = (o: unknown) => b64url(new TextEncoder().encode(JSON.stringify(o)));

function pemToDer(pem: string): Uint8Array {
  const body = pem.replace(/-----[A-Z ]+-----/g, "").replace(/\s+/g, "");
  return Uint8Array.from(atob(body), (c) => c.charCodeAt(0));
}

let cachedToken: { value: string; exp: number } | null = null;

async function accessToken(sa: { client_email: string; private_key: string }): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && cachedToken.exp - 60 > now) return cachedToken.value;
  const unsigned = `${enc({ alg: "RS256", typ: "JWT" })}.${enc({
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/analytics.readonly",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  })}`;
  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToDer(sa.private_key),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = new Uint8Array(await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(unsigned)));
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${unsigned}.${b64url(sig)}`,
    }),
  });
  const data = await r.json();
  if (!r.ok || !data.access_token) throw new Error(`Google sign-in failed: ${data.error_description || data.error || r.status}`);
  cachedToken = { value: data.access_token, exp: now + (data.expires_in || 3600) };
  return cachedToken.value;
}

/* ---------- GA4 Data API ---------- */

async function ga(token: string, method: string, body: unknown) {
  const r = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${PROPERTY}:${method}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data?.error?.message || `Analytics API ${r.status}`);
  return data;
}

type Row = { dimensionValues?: { value: string }[]; metricValues?: { value: string }[] };
const rowsOf = (report: { rows?: Row[] } | undefined) => report?.rows ?? [];
const dim = (r: Row, i = 0) => r.dimensionValues?.[i]?.value ?? "";
const met = (r: Row, i = 0) => Number(r.metricValues?.[i]?.value ?? 0);

// The events the site sends on purpose (docs/analytics.md).
const TRACKED_EVENTS = [
  "generate_lead", "sign_up", "book_call", "calculator_run", "file_download",
  "cta_click", "contact_click", "language_change", "click",
];

const cache = new Map<number, { at: number; body: unknown }>();

async function report(days: number) {
  const hit = cache.get(days);
  if (hit && Date.now() - hit.at < 5 * 60_000) return hit.body;

  const raw = Deno.env.get("GA_SERVICE_ACCOUNT_JSON");
  if (!raw) return { configured: false, reason: "no_secret" };
  let sa;
  try {
    sa = JSON.parse(raw);
  } catch {
    return { configured: false, reason: "bad_secret" };
  }
  const token = await accessToken(sa);

  const current = { startDate: `${days - 1}daysAgo`, endDate: "today" };
  const previous = { startDate: `${2 * days - 1}daysAgo`, endDate: `${days}daysAgo` };
  const top = (name: string, limit = 8) => ({
    dimensions: [{ name }],
    dateRanges: [current],
    limit,
    orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
    metrics: [{ name: "activeUsers" }],
  });

  const [a, b, live] = await Promise.all([
    ga(token, "batchRunReports", {
      requests: [
        {
          dateRanges: [current, previous],
          metrics: [
            { name: "activeUsers" }, { name: "newUsers" }, { name: "sessions" }, { name: "screenPageViews" },
            { name: "engagementRate" }, { name: "averageSessionDuration" }, { name: "keyEvents" },
          ],
        },
        {
          dimensions: [{ name: "date" }],
          dateRanges: [current],
          metrics: [{ name: "activeUsers" }, { name: "sessions" }, { name: "screenPageViews" }],
          orderBys: [{ dimension: { dimensionName: "date" } }],
        },
        {
          dimensions: [{ name: "pagePath" }],
          dateRanges: [current],
          limit: 10,
          metrics: [{ name: "screenPageViews" }, { name: "activeUsers" }],
          orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        },
        {
          dimensions: [{ name: "sessionDefaultChannelGroup" }],
          dateRanges: [current],
          limit: 8,
          metrics: [{ name: "sessions" }, { name: "activeUsers" }, { name: "keyEvents" }],
          orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        },
        {
          dimensions: [{ name: "sessionSourceMedium" }],
          dateRanges: [current],
          limit: 8,
          metrics: [{ name: "sessions" }, { name: "activeUsers" }],
          orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        },
      ],
    }),
    ga(token, "batchRunReports", {
      requests: [
        top("city"),
        top("deviceCategory", 4),
        {
          dimensions: [{ name: "eventName" }],
          dateRanges: [current],
          metrics: [{ name: "eventCount" }],
          dimensionFilter: { filter: { fieldName: "eventName", inListFilter: { values: TRACKED_EVENTS } } },
          orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
        },
        top("country", 6),
        {
          dimensions: [{ name: "contentGroup" }],
          dateRanges: [current],
          metrics: [{ name: "screenPageViews" }],
          orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        },
      ],
    }),
    ga(token, "runRealtimeReport", { metrics: [{ name: "activeUsers" }] }),
  ]);

  const [overview, daily, pages, channels, sources] = a.reports;
  const [cities, devices, events, countries, groups] = b.reports;

  const pick = (range: string) => {
    const r = rowsOf(overview).find((x) => dim(x) === range) ?? rowsOf(overview)[0];
    const m = (i: number) => (r ? met(r, i) : 0);
    return {
      users: m(0), newUsers: m(1), sessions: m(2), views: m(3),
      engagementRate: m(4), avgSession: m(5), keyEvents: m(6),
    };
  };
  const hasRanges = rowsOf(overview).some((x) => dim(x) === "date_range_1");

  const body = {
    configured: true,
    days,
    generatedAt: new Date().toISOString(),
    realtime: rowsOf(live)[0] ? met(rowsOf(live)[0]) : 0,
    now: pick("date_range_0"),
    before: hasRanges ? pick("date_range_1") : null,
    daily: rowsOf(daily).map((r) => ({ date: dim(r), users: met(r, 0), sessions: met(r, 1), views: met(r, 2) })),
    pages: rowsOf(pages).map((r) => ({ path: dim(r), views: met(r, 0), users: met(r, 1) })),
    channels: rowsOf(channels).map((r) => ({ name: dim(r), sessions: met(r, 0), users: met(r, 1), keyEvents: met(r, 2) })),
    sources: rowsOf(sources).map((r) => ({ name: dim(r), sessions: met(r, 0), users: met(r, 1) })),
    cities: rowsOf(cities).map((r) => ({ name: dim(r), users: met(r) })),
    devices: rowsOf(devices).map((r) => ({ name: dim(r), users: met(r) })),
    countries: rowsOf(countries).map((r) => ({ name: dim(r), users: met(r) })),
    groups: rowsOf(groups).map((r) => ({ name: dim(r), views: met(r) })),
    events: rowsOf(events).map((r) => ({ name: dim(r), count: met(r) })),
  };
  cache.set(days, { at: Date.now(), body });
  return body;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  if (!(await isAdmin(req.headers.get("Authorization")))) return json({ error: "Not authorized" }, 403);

  let days = 28;
  try {
    const b = await req.json();
    if ([7, 28, 90].includes(b?.days)) days = b.days;
  } catch {
    /* no body: default range */
  }

  try {
    return json(await report(days));
  } catch (e) {
    // The panel shows this text, so a Google-side problem (API not enabled,
    // service account not added to the property) explains itself.
    return json({ configured: true, error: e instanceof Error ? e.message : String(e) });
  }
});
