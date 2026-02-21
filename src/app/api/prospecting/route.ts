import { NextResponse } from "next/server";

import { upsertMeta } from "@/lib/prospecting-store";

type Body = {
  key: string;
  advisor?: string;
  called?: boolean;
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
  });

  return NextResponse.json({ ok: true, meta: next });
}
