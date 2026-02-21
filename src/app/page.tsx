import Link from "next/link";

import { TopNav } from "@/components/nav";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-black">
      <TopNav active="home" />

      <main className="mx-auto w-full max-w-6xl p-10">
        <h1 className="text-4xl font-semibold tracking-tight">bullprospecting</h1>
        <p className="mt-3 max-w-2xl text-sm text-black/70">
          Prospect investors and filings using 13F data.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link
            href="/ca-13fs"
            className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm hover:bg-black/5"
          >
            <div className="text-base font-semibold">CA 13Fs</div>
            <div className="mt-2 text-sm text-black/70">
              California-based 13F filers.
            </div>
          </Link>

          <Link
            href="/13f-individuals"
            className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm hover:bg-black/5"
          >
            <div className="text-base font-semibold">13F Individuals</div>
            <div className="mt-2 text-sm text-black/70">
              Individuals on filings. Filter by US state.
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
