"use client";

import { useMemo, useState } from "react";

type Meta = {
  advisor: string;
  called: boolean;
};

const DEFAULT_ADVISERS = [
  "",
  "Advisor 1",
  "Advisor 2",
  "Advisor 3",
  "Advisor 4",
] as const;

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

      {/* Called toggle */}
      <td className="px-3 py-3">
        <button
          type="button"
          className={
            "rounded-xl px-3 py-2 text-xs font-semibold transition " +
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
      </td>
    </>
  );
}
