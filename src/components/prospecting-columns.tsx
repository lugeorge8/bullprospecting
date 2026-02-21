"use client";

import { useMemo, useState } from "react";

import type { ProspectMeta as Meta } from "@/lib/types";

const DEFAULT_ADVISERS = ["", "Val", "Nick"] as const;

async function updateMeta(key: string, patch: Partial<Meta>) {
  const res = await fetch("/api/prospecting", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ key, ...patch }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }

  const data = (await res.json()) as { ok: boolean; meta?: Meta };
  return data.meta;
}

export function ProspectingControls({
  rowKey,
  initial,
  advisers = DEFAULT_ADVISERS as unknown as string[],
}: {
  rowKey: string;
  initial?: Meta;
  advisers?: string[];
}) {
  const [advisor, setAdvisor] = useState(initial?.advisor ?? "");
  const [called, setCalled] = useState(initial?.called ?? false);
  const [scrubbed, setScrubbed] = useState(initial?.scrubbed ?? false);
  const [saving, setSaving] = useState(false);

  const advisorLabel = useMemo(
    () => (advisor ? advisor : "Unassigned"),
    [advisor]
  );

  return (
    <>
      {/* Assigned advisor */}
      <td className="px-3 py-3">
        <select
          className="w-40 rounded-xl border border-black/10 bg-white px-2 py-2 text-xs"
          value={advisor}
          onChange={async (e) => {
            const next = e.target.value;
            setAdvisor(next);
            setSaving(true);
            try {
              await updateMeta(rowKey, { advisor: next });
            } finally {
              setSaving(false);
            }
          }}
        >
          {advisers.map((a) => (
            <option key={a || "__unassigned"} value={a}>
              {a ? a : "Unassigned"}
            </option>
          ))}
        </select>
        <div className="mt-1 text-[10px] text-black/40">
          {saving ? "Saving…" : advisorLabel}
        </div>
      </td>

      {/* Status dropdown */}
      <td className="px-3 py-3">
        <details className="group">
          <summary className="cursor-pointer list-none rounded-xl border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-black/70 hover:bg-black/5">
            <span>Status</span>
            <span className="ml-2 text-[10px] font-semibold">
              {called ? "• Called" : "• Not called"}
              {scrubbed ? " • Scrubbed" : ""}
            </span>
          </summary>

          <div className="mt-2 w-56 rounded-2xl border border-black/10 bg-white p-3 shadow-sm">
            <button
              type="button"
              className={
                "w-full rounded-xl px-3 py-2 text-xs font-semibold transition " +
                (called
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "border border-black/10 bg-white text-black/70 hover:bg-black/5")
              }
              onClick={async () => {
                const next = !called;
                setCalled(next);
                setSaving(true);
                try {
                  await updateMeta(rowKey, { called: next });
                } finally {
                  setSaving(false);
                }
              }}
            >
              {called ? "Called" : "Mark called"}
            </button>

            <label className="mt-3 flex items-center gap-2 text-xs text-black/70">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-black/20"
                checked={scrubbed}
                onChange={async (e) => {
                  const next = e.target.checked;
                  setScrubbed(next);
                  setSaving(true);
                  try {
                    await updateMeta(rowKey, { scrubbed: next });
                  } finally {
                    setSaving(false);
                  }
                }}
              />
              Scrubbed
            </label>

            <div className="mt-2 text-[10px] text-black/40">
              {saving ? "Saving…" : ""}
            </div>
          </div>
        </details>
      </td>
    </>
  );
}
