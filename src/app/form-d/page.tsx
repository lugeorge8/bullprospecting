import Link from "next/link";

import { TopNav } from "@/components/nav";

export default function FormDPage() {
  return (
    <div className="min-h-screen bg-white text-black">
      <TopNav active="formd" />

      <main className="mx-auto w-full max-w-6xl p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold tracking-tight">Form D (CA · last 30 days)</h1>
          <p className="mt-2 max-w-2xl text-sm text-black/70">
            Pulls recent SEC Form D filings via EDGAR daily indexes, then extracts
            issuer location from the primary filing document. (Max 100 rows.
            Weekends/holidays may have no index.)
          </p>
        </div>

        <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
          <div className="text-sm font-semibold">API</div>
          <div className="mt-2 text-sm text-black/70">
            Use the endpoint below (JSON). You can add <code>&amp;refresh=1</code> to
            force a refresh.
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              className="rounded-xl border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-black/70 hover:bg-black/5"
              href="/api/form-d?state=CA&days=30"
              target="_blank"
            >
              /api/form-d?state=CA&amp;days=30
            </Link>
            <Link
              className="rounded-xl border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-black/70 hover:bg-black/5"
              href="/api/form-d?state=CA&days=30&refresh=1"
              target="_blank"
            >
              refresh
            </Link>
          </div>

          <div className="mt-4 text-xs text-black/50">
            Tip: set <code>SEC_USER_AGENT</code> env var for SEC requests (SEC
            prefers a descriptive User-Agent).
          </div>
        </div>
      </main>
    </div>
  );
}
