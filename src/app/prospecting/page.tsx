import { TopNav } from "@/components/nav";

type SourceLink = { label: string; href: string };
type SourceItem = { title: string; desc: string; links?: SourceLink[] };
type SourceGroup = { group: string; items: SourceItem[] };

const sources: SourceGroup[] = [
  {
    group: "Real estate (Zillow-style)",
    items: [
      {
        title: "Zillow / Redfin",
        desc: "High-value property owners. Use for manual research and outreach (avoid automated scraping).",
        links: [
          { label: "Zillow", href: "https://www.zillow.com/" },
          { label: "Redfin", href: "https://www.redfin.com/" },
        ],
      },
      {
        title: "County assessor / property tax records",
        desc: "Often public; more reliable for ownership than listing sites.",
      },
      {
        title: "Deed transfers / recent purchases",
        desc: "Liquidity and life-event signals (new purchase → planning need).",
      },
      {
        title: "Commercial real estate registries",
        desc: "Business owners and landlords; useful for higher net worth prospects.",
      },
    ],
  },
  {
    group: "SEC / financial filings",
    items: [
      {
        title: "13F filings",
        desc: "Managers and signers; build calling lists and track outreach.",
        links: [{ label: "SEC 13F", href: "https://www.sec.gov/edgar/search/" }],
      },
      {
        title: "Form D",
        desc: "Founders raising money / private offerings; strong business-owner signal.",
        links: [{ label: "SEC Form D", href: "https://www.sec.gov/edgar/search/" }],
      },
      {
        title: "S-1 / IPO filings",
        desc: "Executives and insiders; high liquidity moments.",
        links: [{ label: "SEC EDGAR", href: "https://www.sec.gov/edgar/search/" }],
      },
      {
        title: "DEF 14A (proxy statements)",
        desc: "Executive comp and insider ownership context.",
        links: [{ label: "SEC EDGAR", href: "https://www.sec.gov/edgar/search/" }],
      },
    ],
  },
  {
    group: "Business registries / signals",
    items: [
      {
        title: "State Secretary of State business search",
        desc: "Managers/members/officers. Useful for finding business owners by geography.",
      },
      {
        title: "UCC filings",
        desc: "Financing indicator for operating businesses.",
      },
      {
        title: "SBA PPP (historical)",
        desc: "Business ownership indicator (check compliance/ethics and data freshness).",
      },
    ],
  },
  {
    group: "Professional directories",
    items: [
      {
        title: "Bar association directories",
        desc: "Partners often map to high income; verify outreach rules.",
      },
      {
        title: "CPA directories",
        desc: "Firm owners/partners; good for HNW business-owner adjacent prospects.",
      },
      {
        title: "Medical practice owner directories",
        desc: "High earning; ensure compliance before targeting.",
      },
    ],
  },
  {
    group: "Paid enrichment",
    items: [
      {
        title: "Apollo / ZoomInfo / Clearbit",
        desc: "Find emails/domains and firm size quickly (paid).",
      },
      {
        title: "Crunchbase",
        desc: "Founder and funding/exits context (paid tiers).",
      },
    ],
  },
  {
    group: "Event-driven (high intent)",
    items: [
      {
        title: "M&A / acquisition press releases",
        desc: "Liquidity events; great trigger for outreach.",
      },
      {
        title: "New office openings / expansions / hiring spikes",
        desc: "Growth signals; good for business-owner prospecting.",
      },
    ],
  },
] as const;

export default function ProspectingPage() {
  return (
    <div className="min-h-screen bg-white text-black">
      <TopNav active="prospecting" />

      <main className="mx-auto w-full max-w-6xl p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold tracking-tight">Prospecting</h1>
          <p className="mt-2 max-w-2xl text-sm text-black/70">
            Lead sources and workflows for finding business owners and higher net
            worth prospects.
          </p>
        </div>

        <div className="space-y-8">
          {sources.map((g) => (
            <section key={g.group}>
              <h2 className="text-lg font-semibold">{g.group}</h2>
              <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {g.items.map((it) => (
                  <div
                    key={it.title}
                    className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm"
                  >
                    <div className="text-base font-semibold">{it.title}</div>
                    <div className="mt-2 text-sm text-black/70">{it.desc}</div>
                    {it.links?.length ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {it.links.map((l) => (
                          <a
                            key={l.href}
                            href={l.href}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-xl border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-black/70 hover:bg-black/5"
                          >
                            {l.label}
                          </a>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
