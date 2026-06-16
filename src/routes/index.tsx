import { createFileRoute, Link } from "@tanstack/react-router";
import { Nav, Footer } from "@/components/layout/nav";
import { ACTIVITY, PRODUCTS, WEATHER } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Premiere Main" },
      {
        name: "description",
        content: "Overview of products in development, alerts and project weather.",
      },
    ],
  }),
  component: Dashboard,
});

const weatherTone = {
  green: "bg-[oklch(0.85_0.1_150)] text-[oklch(0.3_0.1_150)]",
  amber: "bg-[oklch(0.9_0.12_75)] text-[oklch(0.35_0.12_75)]",
  red: "bg-[oklch(0.85_0.15_25)] text-[oklch(0.35_0.18_25)]",
};

function Dashboard() {
  const inDev = PRODUCTS.length;
  const alerts = PRODUCTS.flatMap((p) => p.rows.flatMap((r) => [r, ...(r.subRows ?? [])])).filter(
    (r) => r.status === "ko",
  ).length;
  const goProd = PRODUCTS.filter((p) => p.goStyle === "GO" && p.goSolidity !== "KO").length;

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="mx-auto max-w-[1400px] px-8 py-14">
        <section className="grid gap-8 border-b hairline pb-14 md:grid-cols-[1.4fr_1fr]">
          <div>
            <div className="tracking-luxury text-[11px] text-muted-foreground">
              Tuesday · June 16, 2026
            </div>
            <h1 className="mt-4 font-serif text-5xl leading-[1.05] md:text-6xl">
              Welcome back,
              <br />
              <span className="italic text-muted-foreground">Premiere Main Management.</span>
            </h1>
            <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Quiet operations, sharp decisions. Three products are moving through the atelier this
              week. One needs your attention.
            </p>
            <div className="mt-8 flex gap-3">
              <Link
                to="/library"
                className="rounded-sm border border-foreground bg-foreground px-5 py-3 text-[11px] tracking-luxury text-background transition-colors hover:bg-foreground/85"
              >
                Open Library
              </Link>
              <Link
                to="/add"
                className="rounded-sm border hairline px-5 py-3 text-[11px] tracking-luxury hover:bg-muted"
              >
                Add Product
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Metric value={inDev} label="In development" hint="Across 2 collections" />
            <Metric value={alerts} label="Active alerts" hint="KO checkpoints" emphasize />
            <Metric value={goProd} label="Validated this week" hint="GO Style + Solidity" />
            <Metric value={"94%"} label="On-time index" hint="vs Q3 target" />
          </div>
        </section>

        <section className="mt-14 grid gap-10 md:grid-cols-[1.3fr_1fr]">
          <div>
            <SectionTitle eyebrow="01 / Activity" title="Recent activity feed" />
            <ul className="mt-6 divide-y hairline border-y hairline">
              {ACTIVITY.map((a, i) => (
                <li key={i} className="flex items-baseline justify-between gap-6 py-4">
                  <div>
                    <div className="text-sm">
                      <span className="font-medium">{a.who}</span>{" "}
                      <span className="text-muted-foreground">{a.what}</span>
                    </div>
                    <div className="mt-1 text-[12px] text-muted-foreground">{a.target}</div>
                  </div>
                  <span className="shrink-0 font-mono text-[11px] tracking-wide text-muted-foreground">
                    {a.at}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <SectionTitle eyebrow="02 / Météo Projet" title="Project weather" />
            <div className="mt-6 grid gap-3">
              {WEATHER.map((w) => (
                <div
                  key={w.axis}
                  className="flex items-center justify-between gap-4 border hairline bg-card p-5"
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={`grid h-9 w-9 place-items-center rounded-full text-[11px] font-medium ${weatherTone[w.level]}`}
                    >
                      ●
                    </span>
                    <div>
                      <div className="font-serif text-lg">{w.axis}</div>
                      <div className="text-[12px] text-muted-foreground">{w.note}</div>
                    </div>
                  </div>
                  <span className="tracking-luxury text-[10px] text-muted-foreground">
                    {w.level === "green" ? "Stable" : w.level === "amber" ? "Watch" : "Critical"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function Metric({
  value,
  label,
  hint,
  emphasize,
}: {
  value: number | string;
  label: string;
  hint: string;
  emphasize?: boolean;
}) {
  return (
    <div
      className={`border hairline p-6 ${emphasize ? "bg-foreground text-background" : "bg-card"}`}
    >
      <div className="font-serif text-5xl leading-none">{value}</div>
      <div className="mt-4 tracking-luxury text-[10px] opacity-80">{label}</div>
      <div className={`mt-1 text-[11px] ${emphasize ? "opacity-70" : "text-muted-foreground"}`}>
        {hint}
      </div>
    </div>
  );
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <div className="tracking-luxury text-[10px] text-muted-foreground">{eyebrow}</div>
      <h2 className="mt-2 font-serif text-3xl">{title}</h2>
    </div>
  );
}
