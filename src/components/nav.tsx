import Link from "next/link";

const base =
  "rounded-xl px-4 py-2 text-sm font-semibold text-black/70 hover:bg-black/5";
const activeCls =
  "rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white";

export function TopNav({
  active,
}: {
  active?: "home" | "ca" | "ind" | "prospecting" | "formd";
}) {
  return (
    <header className="border-b border-black/10 bg-white">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          bullprospecting
        </Link>

        <nav className="flex items-center gap-2">
          <Link href="/" className={active === "home" ? activeCls : base}>
            Home
          </Link>
          <Link
            href="/ca-13fs"
            className={active === "ca" ? activeCls : base}
          >
            CA 13Fs
          </Link>
          <Link
            href="/13f-individuals"
            className={active === "ind" ? activeCls : base}
          >
            13F Individuals
          </Link>
          <Link
            href="/prospecting"
            className={active === "prospecting" ? activeCls : base}
          >
            Prospecting
          </Link>
          <Link
            href="/form-d"
            className={active === "formd" ? activeCls : base}
          >
            Form D
          </Link>
        </nav>
      </div>
    </header>
  );
}
