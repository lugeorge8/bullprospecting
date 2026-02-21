"use client";

import { useMemo, useState } from "react";

function toCsvCell(v: string) {
  const s = (v ?? "").toString();
  if (/[\t\n\r",]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function downloadCsv(filename: string, rows: Array<Record<string, string>>) {
  const headers = Object.keys(rows[0] || {});
  const csv = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => toCsvCell(r[h] ?? "")).join(",")),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

import type { ProspectMeta as Meta } from "@/lib/types";

type Row = {
  ACCESSION_NUMBER: string;
  NAME: string;
  TITLE: string;
  PHONE: string;
  SIGNATURE: string;
  CITY: string;
  STATEORCOUNTRY: string;
  SIGNATUREDATE: string;
  __key: string;
  __meta?: Meta;
};

import { ProspectingControls } from "@/components/prospecting-columns";

export function IndividualsTable({
  rows,
  states,
  advisers,
}: {
  rows: Row[];
  states: string[];
  advisers: string[];
}) {
  const [state, setState] = useState<string>("");
  const [advisor, setAdvisor] = useState<string>("");

  const filtered = useMemo(() => {
    let base = !state ? rows : rows.filter((r) => r.STATEORCOUNTRY === state);
    if (advisor === "__unassigned") {
      base = base.filter((r) => !(r.__meta?.advisor ?? ""));
    } else if (advisor) {
      base = base.filter((r) => (r.__meta?.advisor ?? "") === advisor);
    }
    return base.slice(0, 100);
  }, [rows, state, advisor]);

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-sm font-semibold text-black/80">Filter</div>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="flex items-center gap-2 text-sm text-black/70">
              State:
              <select
                className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm"
                value={state}
                onChange={(e) => setState(e.target.value)}
              >
                <option value="">All</option>
                {states.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex items-center gap-2 text-sm text-black/70">
              Adviser:
              <select
                className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm"
                value={advisor}
                onChange={(e) => setAdvisor(e.target.value)}
              >
                <option value="">All</option>
                <option value="__unassigned">Unassigned</option>
                {advisers.filter(Boolean).map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-sm text-black/60">
            Showing: <span className="font-semibold text-black">{filtered.length}</span>
            <span className="text-black/40"> (max 100)</span>
          </div>

          <button
            type="button"
            className="rounded-xl border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-black/70 hover:bg-black/5"
            onClick={() => {
              const exportRows = filtered.map((r) => ({
                NAME: r.NAME,
                TITLE: r.TITLE,
                CITY: r.CITY,
                STATE: r.STATEORCOUNTRY,
                PHONE: r.PHONE,
                SIGNATUREDATE: r.SIGNATUREDATE,
                ADVISER: r.__meta?.advisor ?? "",
                LEAD_STATUS: r.__meta?.leadStatus ?? "",
                CALLED: (r.__meta?.called ?? false) ? "yes" : "no",
                SCRUBBED: (r.__meta?.scrubbed ?? false) ? "yes" : "no",
                EMAIL: r.__meta?.email ?? "",
                WEBSITE: r.__meta?.website ?? "",
                NEXT_FOLLOW_UP: r.__meta?.nextFollowUp ?? "",
                NOTES: r.__meta?.notes ?? "",
              }));
              downloadCsv(
                `13f-individuals-${advisor || "all"}-${state || "all"}.csv`,
                exportRows
              );
            }}
          >
            Download (CSV)
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-black/10 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-black/5 text-left">
              <tr>
                <th className="px-3 py-3 font-semibold">Adviser</th>
                <th className="px-3 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Title</th>
                <th className="px-4 py-3 font-semibold">City</th>
                <th className="px-4 py-3 font-semibold">State</th>
                <th className="px-4 py-3 font-semibold">Phone</th>
                <th className="px-4 py-3 font-semibold">Signature Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.__key} className="border-t border-black/5 align-top">
                  <ProspectingControls rowKey={r.__key} initial={r.__meta} advisers={advisers} />
                  <td className="px-4 py-3 font-semibold text-black/90">
                    {r.NAME || "—"}
                  </td>
                  <td className="px-4 py-3 text-black/80">{r.TITLE || "—"}</td>
                  <td className="px-4 py-3 text-black/80">{r.CITY || "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs text-black/70">
                    {r.STATEORCOUNTRY || "—"}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-black/70">
                    {r.PHONE || "—"}
                  </td>
                  <td className="px-4 py-3 text-black/80">
                    {r.SIGNATUREDATE || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
