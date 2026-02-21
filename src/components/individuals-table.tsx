"use client";

import { useMemo, useState } from "react";

type Meta = {
  advisor: string;
  called: boolean;
};

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
}: {
  rows: Row[];
  states: string[];
}) {
  const [state, setState] = useState<string>("");

  const filtered = useMemo(() => {
    const base = !state ? rows : rows.filter((r) => r.STATEORCOUNTRY === state);
    return base.slice(0, 100);
  }, [rows, state]);

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-sm font-semibold text-black/80">Filter</div>
          <label className="mt-2 flex items-center gap-2 text-sm text-black/70">
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
        </div>

        <div className="text-sm text-black/60">
          Showing: <span className="font-semibold text-black">{filtered.length}</span>
          <span className="text-black/40"> (max 100)</span>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-black/10 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-black/5 text-left">
              <tr>
                <th className="px-3 py-3 font-semibold">Adviser</th>
                <th className="px-3 py-3 font-semibold">Called</th>
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
                  <ProspectingControls rowKey={r.__key} initial={r.__meta} />
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
