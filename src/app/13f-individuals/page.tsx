import fs from "node:fs";
import path from "node:path";

import { IndividualsTable } from "@/components/individuals-table";
import { TopNav } from "@/components/nav";

type Row = Record<string, string>;

function parseTsv(tsv: string): Row[] {
  const lines = tsv.split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return [];
  const headers = lines[0].split("\t");
  const rows: Row[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split("\t");
    const r: Row = {};
    for (let j = 0; j < headers.length; j++) {
      r[headers[j]] = cols[j] ?? "";
    }
    rows.push(r);
  }
  return rows;
}

const US_STATES = new Set([
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
  "DC",
]);

export default function IndividualsPage() {
  const filePath = path.join(process.cwd(), "data", "13f-individuals.tsv");
  const tsv = fs.readFileSync(filePath, "utf8");
  const rows = parseTsv(tsv);

  const usRows = rows.filter((r) => US_STATES.has((r.STATEORCOUNTRY || "").toUpperCase()));

  // Normalize keys for client component typing
  const typed = usRows.map((r) => ({
    ACCESSION_NUMBER: r.ACCESSION_NUMBER || "",
    NAME: r.NAME || "",
    TITLE: r.TITLE || "",
    PHONE: r.PHONE || "",
    SIGNATURE: r.SIGNATURE || "",
    CITY: r.CITY || "",
    STATEORCOUNTRY: (r.STATEORCOUNTRY || "").toUpperCase(),
    SIGNATUREDATE: r.SIGNATUREDATE || "",
  }));

  const states = Array.from(
    new Set(typed.map((r) => r.STATEORCOUNTRY).filter(Boolean))
  ).sort();

  return (
    <div className="min-h-screen bg-white text-black">
      <TopNav active="ind" />

      <main className="mx-auto w-full max-w-6xl p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold tracking-tight">13F Individuals</h1>
          <p className="mt-2 text-sm text-black/70">
            Individuals on filings filtered to US states only.
          </p>
        </div>

        <IndividualsTable rows={typed} states={states} />
      </main>
    </div>
  );
}
