import fs from "node:fs";
import path from "node:path";

import { TopNav } from "@/components/nav";
import { ProspectingControls } from "@/components/prospecting-columns";
import { loadStore } from "@/lib/prospecting-store";

import type { ProspectMeta as Meta } from "@/lib/types";

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

function rowKey(r: Row) {
  return [r.ACCESSION_NUMBER, r.FILINGMANAGER_NAME, r.FILINGMANAGER_CITY]
    .filter(Boolean)
    .join("|");
}

export default function Ca13fsPage() {
  const filePath = path.join(process.cwd(), "data", "13f-submissions.tsv");
  const tsv = fs.readFileSync(filePath, "utf8");
  const rows = parseTsv(tsv);

  const caRows = rows.filter(
    (r) => (r.FILINGMANAGER_STATEORCOUNTRY || "").toUpperCase() === "CA"
  );

  // Sort by manager name, then city
  caRows.sort((a, b) => {
    const an = (a.FILINGMANAGER_NAME || "").toLowerCase();
    const bn = (b.FILINGMANAGER_NAME || "").toLowerCase();
    if (an < bn) return -1;
    if (an > bn) return 1;
    const ac = (a.FILINGMANAGER_CITY || "").toLowerCase();
    const bc = (b.FILINGMANAGER_CITY || "").toLowerCase();
    return ac.localeCompare(bc);
  });

  const limited = caRows.slice(0, 100);
  const store = loadStore();

  return (
    <div className="min-h-screen bg-white text-black">
      <TopNav active="ca" />

      <main className="mx-auto w-full max-w-6xl p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold tracking-tight">CA 13Fs</h1>
          <p className="mt-2 text-sm text-black/70">
            California-based 13F filers from the provided dataset.
          </p>
          <div className="mt-3 text-sm text-black/60">
            Rows: <span className="font-semibold text-black">{caRows.length}</span>
            <span className="text-black/40">
              {" "}
              (showing {Math.min(100, caRows.length)})
            </span>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-black/10 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-black/5 text-left">
                <tr>
                  <th className="px-3 py-3 font-semibold">Adviser</th>
                  <th className="px-3 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Manager</th>
                  <th className="px-4 py-3 font-semibold">City</th>
                  <th className="px-4 py-3 font-semibold">Quarter</th>
                  <th className="px-4 py-3 font-semibold">Report Type</th>
                  <th className="px-4 py-3 font-semibold">Accession</th>
                </tr>
              </thead>
              <tbody>
                {limited.map((r) => {
                  const key = rowKey(r);
                  const meta = store[key] as Meta | undefined;
                  return (
                    <tr
                      key={key}
                      className="border-t border-black/5 align-top"
                    >
                      <ProspectingControls rowKey={key} initial={meta} advisers={["", "Val", "Nick"]} />

                      <td className="px-4 py-3">
                        <div className="font-semibold text-black/90">
                          {r.FILINGMANAGER_NAME || "—"}
                        </div>
                        <div className="mt-0.5 text-xs text-black/50">
                          {[
                            r.FILINGMANAGER_STREET1,
                            r.FILINGMANAGER_STREET2,
                            r.FILINGMANAGER_CITY,
                            r.FILINGMANAGER_STATEORCOUNTRY,
                            r.FILINGMANAGER_ZIPCODE,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-black/80">
                        {r.FILINGMANAGER_CITY || "—"}
                      </td>
                      <td className="px-4 py-3 text-black/80">
                        {r.REPORTCALENDARORQUARTER || "—"}
                      </td>
                      <td className="px-4 py-3 text-black/80">
                        {r.REPORTTYPE || "—"}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-black/70">
                        {r.ACCESSION_NUMBER || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
