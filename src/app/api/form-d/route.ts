import { NextResponse } from "next/server";

import { getFormDLeads } from "@/lib/formd";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const state = (url.searchParams.get("state") || "CA").toUpperCase();
  const days = Number(url.searchParams.get("days") || "30");
  const refresh = url.searchParams.get("refresh") === "1";

  const safeDays = Number.isFinite(days) ? Math.min(90, Math.max(1, days)) : 30;

  try {
    const result = await getFormDLeads({ days: safeDays, state, refresh, limit: 200 });
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
