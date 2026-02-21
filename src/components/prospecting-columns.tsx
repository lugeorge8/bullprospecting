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

  const [email, setEmail] = useState(initial?.email ?? "");
  const [website, setWebsite] = useState(initial?.website ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [nextFollowUp, setNextFollowUp] = useState(initial?.nextFollowUp ?? "");
  const [leadStatus, setLeadStatus] = useState(initial?.leadStatus ?? "New");

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
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="font-semibold">Status</span>
                <span className="ml-2 text-[10px] font-semibold text-black/50">
                  {leadStatus ? `• ${leadStatus}` : ""}
                  {called ? " • Called" : ""}
                  {scrubbed ? " • Scrubbed" : ""}
                </span>
              </div>
              <span className="shrink-0 text-black/40 transition group-open:rotate-180">
                ▾
              </span>
            </div>
          </summary>

          <div className="mt-2 w-[420px] max-w-[80vw] rounded-2xl border border-black/10 bg-white p-3 shadow-sm">
            <table className="w-full border-separate border-spacing-y-2 text-xs">
              <tbody>
                <tr>
                  <td className="w-32 pr-3 align-top font-semibold text-black/70">
                    Lead status
                  </td>
                  <td>
                    <select
                      className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-xs"
                      value={leadStatus}
                      onChange={async (e) => {
                        const next = e.target.value;
                        setLeadStatus(next);
                        setSaving(true);
                        try {
                          await updateMeta(rowKey, { leadStatus: next });
                        } finally {
                          setSaving(false);
                        }
                      }}
                    >
                      {[
                        "New",
                        "Researching",
                        "Contacted",
                        "Not interested",
                        "Converted",
                      ].map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>

                <tr>
                  <td className="pr-3 align-top font-semibold text-black/70">Called</td>
                  <td>
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
                  </td>
                </tr>

                <tr>
                  <td className="pr-3 align-top font-semibold text-black/70">Scrubbed</td>
                  <td>
                    <label className="inline-flex items-center gap-2 text-xs text-black/70">
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
                      Mark scrubbed
                    </label>
                  </td>
                </tr>

                <tr>
                  <td className="pr-3 align-top font-semibold text-black/70">Email</td>
                  <td>
                    <input
                      className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-xs"
                      placeholder="name@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={async () => {
                        setSaving(true);
                        try {
                          await updateMeta(rowKey, { email });
                        } finally {
                          setSaving(false);
                        }
                      }}
                    />
                  </td>
                </tr>

                <tr>
                  <td className="pr-3 align-top font-semibold text-black/70">Website</td>
                  <td>
                    <input
                      className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-xs"
                      placeholder="https://…"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      onBlur={async () => {
                        setSaving(true);
                        try {
                          await updateMeta(rowKey, { website });
                        } finally {
                          setSaving(false);
                        }
                      }}
                    />
                  </td>
                </tr>

                <tr>
                  <td className="pr-3 align-top font-semibold text-black/70">
                    Next follow-up
                  </td>
                  <td>
                    <input
                      type="date"
                      className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-xs"
                      value={nextFollowUp}
                      onChange={async (e) => {
                        const next = e.target.value;
                        setNextFollowUp(next);
                        setSaving(true);
                        try {
                          await updateMeta(rowKey, { nextFollowUp: next });
                        } finally {
                          setSaving(false);
                        }
                      }}
                    />
                  </td>
                </tr>

                <tr>
                  <td className="pr-3 align-top font-semibold text-black/70">Notes</td>
                  <td>
                    <textarea
                      className="w-full resize-none rounded-xl border border-black/10 bg-white px-3 py-2 text-xs"
                      rows={3}
                      placeholder="Quick notes…"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      onBlur={async () => {
                        setSaving(true);
                        try {
                          await updateMeta(rowKey, { notes });
                        } finally {
                          setSaving(false);
                        }
                      }}
                    />
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="mt-1 text-[10px] text-black/40">
              {saving ? "Saving…" : ""}
            </div>
          </div>
        </details>
      </td>
    </>
  );
}
