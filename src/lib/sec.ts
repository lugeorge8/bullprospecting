import { setTimeout as sleep } from "node:timers/promises";

const DEFAULT_UA =
  process.env.SEC_USER_AGENT ||
  "bullprospecting/0.1 (admin@localhost)";

export async function secFetch(url: string, init?: RequestInit) {
  // SEC asks for a descriptive User-Agent.
  const headers = new Headers(init?.headers);
  if (!headers.get("user-agent")) headers.set("user-agent", DEFAULT_UA);
  if (!headers.get("accept")) headers.set("accept", "*/*");
  if (!headers.get("accept-encoding")) headers.set("accept-encoding", "gzip");

  const res = await fetch(url, { ...init, headers });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`SEC fetch failed ${res.status} ${url} ${text.slice(0, 200)}`);
  }
  return res;
}

export async function politeFetch(url: string, init?: RequestInit) {
  // simple politeness delay to reduce chance of 429s
  await sleep(125);
  return secFetch(url, init);
}
