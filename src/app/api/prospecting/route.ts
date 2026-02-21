import { NextResponse } from "next/server";

import { upsertMeta } from "@/lib/prospecting-store";

type Body = {
  key: string;
  advisor?: string;
  called?: boolean;
  scrubbed?: boolean;
  email?: string;
  website?: string;
  notes?: string;
  nextFollowUp?: string;
  leadStatus?: string;
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON" },
      { status: 400 }
    );
  }

  if (!body?.key || typeof body.key !== "string") {
    return NextResponse.json({ ok: false, error: "Missing key" }, { status: 400 });
  }

  const next = upsertMeta(body.key, {
    advisor: typeof body.advisor === "string" ? body.advisor : undefined,
    called: typeof body.called === "boolean" ? body.called : undefined,
    scrubbed: typeof body.scrubbed === "boolean" ? body.scrubbed : undefined,
    email: typeof body.email === "string" ? body.email : undefined,
    website: typeof body.website === "string" ? body.website : undefined,
    notes: typeof body.notes === "string" ? body.notes : undefined,
    nextFollowUp: typeof body.nextFollowUp === "string" ? body.nextFollowUp : undefined,
    leadStatus: typeof body.leadStatus === "string" ? body.leadStatus : undefined,
  });

  return NextResponse.json({ ok: true, meta: next });
}
