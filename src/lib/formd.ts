import fs from "node:fs";
import path from "node:path";

import { politeFetch } from "@/lib/sec";

export type FormDLead = {
  accession: string;
  filedAt: string; // YYYY-MM-DD
  cik: string;
  company: string;
  state: string;
  city?: string;
  primaryDoc?: string;
  secUrl: string;
};

type Cache = {
  updatedAt: number;
  days: number;
  leads: FormDLead[];
};

const CACHE_PATH = path.join(process.cwd(), "data", "formd-cache.json");

function readCache(): Cache | null {
  try {
    if (!fs.existsSync(CACHE_PATH)) return null;
    const raw = fs.readFileSync(CACHE_PATH, "utf8");
    if (!raw.trim()) return null;
    return JSON.parse(raw) as Cache;
  } catch {
    return null;
  }
}

function writeCache(cache: Cache) {
  fs.mkdirSync(path.dirname(CACHE_PATH), { recursive: true });
  const tmp = CACHE_PATH + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(cache, null, 2));
  fs.renameSync(tmp, CACHE_PATH);
}

function yyyymmdd(d: Date) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// SEC daily index (master) location pattern.
// Example: https://www.sec.gov/Archives/edgar/daily-index/2025/QTR4/master.20251001.idx
function masterIdxUrl(date: Date) {
  const y = date.getUTCFullYear();
  const q = Math.floor(date.getUTCMonth() / 3) + 1;
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  return `https://www.sec.gov/Archives/edgar/daily-index/${y}/QTR${q}/master.${y}${mm}${dd}.idx`;
}

function parseMasterIdx(text: string) {
  // Format: CIK|Company Name|Form Type|Date Filed|Filename
  const lines = text.split(/\r?\n/);
  const out: Array<{ cik: string; company: string; form: string; date: string; filename: string }> = [];
  for (const line of lines) {
    if (!line.includes("|")) continue;
    const parts = line.split("|");
    if (parts.length < 5) continue;
    const [cik, company, form, date, filename] = parts;
    if (!cik || cik === "CIK") continue;
    out.push({ cik, company, form, date, filename });
  }
  return out;
}

async function fetchFilingIndexJson(cik: string, accession: string) {
  const accNo = accession.replace(/-/g, "");
  const url = `https://data.sec.gov/submissions/CIK${cik.padStart(10, "0")}.json`;
  const res = await politeFetch(url);
  const json = (await res.json()) as unknown;

  // locate matching accession in recent filings
  const j = json as {
    filings?: {
      recent?: {
        accessionNumber?: string[];
        primaryDocument?: string[];
        filingDate?: string[];
      };
    };
  };

  const recent = j.filings?.recent;
  const accs: string[] = recent?.accessionNumber ?? [];
  const primaryDocs: string[] = recent?.primaryDocument ?? [];
  const filedDates: string[] = recent?.filingDate ?? [];

  const idx = accs.findIndex((a) => a === accession);
  const primaryDoc = idx >= 0 ? primaryDocs[idx] : undefined;
  const filedAt = idx >= 0 ? filedDates[idx] : undefined;

  // index JSON is easier for metadata, but primary doc name helps.
  // We still need state, so we’ll parse primary document.
  return { primaryDoc, filedAt, accNo };
}

async function extractIssuerStateFromPrimaryDoc(cik: string, accession: string, primaryDoc?: string) {
  if (!primaryDoc) return { state: "", city: "" };
  const accNo = accession.replace(/-/g, "");
  const url = `https://www.sec.gov/Archives/edgar/data/${String(Number(cik))}/${accNo}/${primaryDoc}`;
  const res = await politeFetch(url);
  const text = await res.text();

  // Try a few patterns for issuer state in Form D XML/HTML.
  // Common XML tags: <issuerStateOrCountry>, <issuerStateOrCountryDescription>, etc.
  const stateMatch =
    text.match(/<issuerStateOrCountry>\s*([A-Z]{2})\s*<\/issuerStateOrCountry>/i) ||
    text.match(/<issuerStateOrCountryDescription>\s*([A-Z]{2})\s*<\/issuerStateOrCountryDescription>/i) ||
    text.match(/STATE\s*:\s*([A-Z]{2})/i);

  const cityMatch =
    text.match(/<issuerCity>\s*([^<]{2,64})\s*<\/issuerCity>/i) ||
    text.match(/CITY\s*:\s*([^\n\r]{2,64})/i);

  return {
    state: stateMatch?.[1]?.toUpperCase?.() ?? "",
    city: cityMatch?.[1]?.trim?.() ?? "",
  };
}

export async function getFormDLeads({
  days,
  state,
  refresh,
  limit = 200,
}: {
  days: number;
  state: string;
  refresh?: boolean;
  limit?: number;
}) {
  const diagnostics: {
    indexDaysTried: number;
    indexDaysFound: number;
    indexErrors: Array<{ url: string; error: string }>;
    candidates: number;
    parsed: number;
  } = {
    indexDaysTried: 0,
    indexDaysFound: 0,
    indexErrors: [],
    candidates: 0,
    parsed: 0,
  };
  const st = state.toUpperCase();

  const cache = readCache();
  if (!refresh && cache && cache.days === days) {
    const filtered = cache.leads.filter((l) => l.state === st).slice(0, 100);
    return { fromCache: true, leads: filtered, diagnostics: { cached: true } };
  }

  const now = new Date();
  const dates: Date[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    d.setUTCDate(d.getUTCDate() - i);
    dates.push(d);
  }

  // Collect Form D accession numbers from master indexes
  const candidates: Array<{ cik: string; company: string; date: string; accession: string }> = [];

  for (const d of dates) {
    const url = masterIdxUrl(d);
    diagnostics.indexDaysTried += 1;
    try {
      const res = await politeFetch(url);
      const idxText = await res.text();
      diagnostics.indexDaysFound += 1;
      const rows = parseMasterIdx(idxText);
      for (const r of rows) {
        if (r.form.trim().toUpperCase() !== "D") continue;
        // filename like edgar/data/##########/##########-##-######.txt
        const m = r.filename.match(/(\d{10}-\d{2}-\d{6})/);
        if (!m) continue;
        candidates.push({ cik: r.cik, company: r.company, date: r.date, accession: m[1] });
      }
    } catch (e) {
      diagnostics.indexErrors.push({
        url,
        error: e instanceof Error ? e.message : "failed",
      });
      continue;
    }
    if (candidates.length >= limit) break;
  }

  diagnostics.candidates = candidates.length;

  const leads: FormDLead[] = [];

  for (const c of candidates.slice(0, limit)) {
    try {
      const meta = await fetchFilingIndexJson(c.cik, c.accession);
      const loc = await extractIssuerStateFromPrimaryDoc(c.cik, c.accession, meta.primaryDoc);
      const lead: FormDLead = {
        accession: c.accession,
        filedAt: meta.filedAt || c.date || yyyymmdd(new Date()),
        cik: c.cik,
        company: c.company,
        state: loc.state,
        city: loc.city,
        primaryDoc: meta.primaryDoc,
        secUrl: `https://www.sec.gov/Archives/edgar/data/${String(Number(c.cik))}/${c.accession.replace(/-/g, "")}/${meta.primaryDoc ?? ""}`,
      };
      leads.push(lead);
      diagnostics.parsed += 1;
    } catch {
      continue;
    }
  }

  // cache all leads (unfiltered)
  writeCache({ updatedAt: Date.now(), days, leads });

  const filtered = leads.filter((l) => l.state === st).slice(0, 100);
  return { fromCache: false, leads: filtered, diagnostics };
}
