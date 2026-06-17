import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Nav, Footer } from "@/components/layout/nav";
import { GoBadge } from "@/components/status-badge";
import { getProduct, type Product } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/product/$id/")({
  loader: ({ params }) => {
    const product = getProduct(params.id);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.product.name ?? "Product"} — Premiere Main` },
      {
        name: "description",
        content: `Technical sheet for ${loaderData?.product.name ?? "product"}.`,
      },
    ],
  }),
  component: ProductDetail,
});

type TabKey = "versions" | "analytics";
type GateName = "Studio" | "Development" | "Production";
type GateSlug = "studio" | "development" | "production";

const GATE_TO_SLUG: Record<GateName, GateSlug> = {
  Studio: "studio",
  Development: "development",
  Production: "production",
};

function ProductDetail() {
  const { product } = Route.useLoaderData();
  const [tab, setTab] = useState<TabKey>("versions");

  const tabs: { key: TabKey; label: string; hint: string }[] = [
    { key: "versions", label: "Version Tracking & Approvals", hint: "01" },
    { key: "analytics", label: "Product Analytics & Live Data", hint: "02" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="mx-auto max-w-[1400px] px-8 py-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/library"
            className="tracking-luxury text-[10px] text-muted-foreground hover:text-foreground"
          >
            ← Back to library
          </Link>
          <Link
            to="/add"
            className="rounded-sm bg-primary px-5 py-3 text-[11px] tracking-luxury text-primary-foreground hover:glow-lime"
          >
            + Add Product
          </Link>
        </div>

        <header className="mt-6 grid gap-10 border-b hairline pb-12 md:grid-cols-[1fr_1.3fr]">
          <div className="aspect-[4/5] overflow-hidden bg-muted">
            <img src={product.cover} alt={product.name} className="h-full w-full object-cover" />
          </div>
          <div>
            <div className="tracking-luxury text-[10px] text-muted-foreground">
              {product.collection} · {product.site} · {product.category}
            </div>
            <h1 className="mt-3 font-serif text-6xl leading-[1.02]">{product.name}</h1>
            <div className="mt-2 font-mono text-sm text-muted-foreground">SKU {product.sku}</div>

            <dl className="mt-8 grid grid-cols-2 gap-y-4 text-sm">
              <Meta k="Designer" v={product.designer} />
              <Meta k="Created" v={product.createdAt} />
              <Meta k="Factory" v={product.site} />
              <Meta k="Collection" v={product.collection} />
            </dl>

            <div className="mt-8 flex flex-wrap gap-2">
              <GoBadge value={product.goStyle} label="GO Style" />
              <GoBadge value={product.goSolidity} label="GO Solidity" />
            </div>
          </div>
        </header>

        <nav className="mt-10 flex flex-wrap items-end gap-x-8 gap-y-2 border-b hairline">
          {tabs.map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  "group relative -mb-px flex items-center gap-3 border-b-2 px-1 pb-4 pt-2 text-left transition-colors",
                  active
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                <span className="font-mono text-[10px] text-muted-foreground">{t.hint}</span>
                <span className="tracking-luxury text-[11px]">{t.label}</span>
                {active && (
                  <span className="absolute -bottom-px left-0 right-0 h-[2px] bg-primary shadow-[0_0_12px_var(--lime)]" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="mt-10">
          {tab === "versions" && <VersionsTab product={product} productId={product.id} />}
          {tab === "analytics" && <AnalyticsTab product={product} />}
        </div>
      </main>

      <Footer />
    </div>
  );
}

function Meta({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="tracking-luxury text-[10px] text-muted-foreground">{k}</dt>
      <dd className="mt-1 font-serif text-xl">{v}</dd>
    </div>
  );
}

type GateState = "approved" | "pending" | "locked";

function gateDataForProduct(p: Product): {
  overall: { label: string; tone: "success" | "warning" | "danger" };
  gates: { name: string; role: string; by: string; at: string; state: GateState }[];
  logs: { at: string; who: string; what: string }[];
} {
  if (p.goStyle === "GO" && p.goSolidity === "GO") {
    return {
      overall: { label: "Cleared for industrialization", tone: "success" },
      gates: [
        { name: "Studio", role: "Creative", by: "Creative Director", at: "Jun 12 · 10:02", state: "approved" },
        { name: "Development", role: "Pattern & Mockup", by: "Technical Manager", at: "Jun 14 · 16:40", state: "approved" },
        { name: "Production", role: "Industrialization", by: "Factory Lead", at: "Jun 16 · 09:15", state: "approved" },
      ],
      logs: [
        { at: "Jun 16, 2026 · 09:15", who: "Factory Lead", what: "Released GoProd on all PMET pieces" },
        { at: "Jun 14, 2026 · 16:40", who: "Technical Manager", what: "Validated mockup 03 — pattern locked" },
        { at: "Jun 12, 2026 · 10:02", who: "Creative Director", what: "Signed off on Studio direction" },
      ],
    };
  }
  if (p.goStyle === "KO" || p.goSolidity === "KO") {
    return {
      overall: { label: "Blocked — Studio iteration required", tone: "danger" },
      gates: [
        { name: "Studio", role: "Creative", by: "Creative Director", at: "Pending revision", state: "pending" },
        { name: "Development", role: "Pattern & Mockup", by: "Technical Manager", at: "Locked", state: "locked" },
        { name: "Production", role: "Industrialization", by: "Factory Lead", at: "Locked", state: "locked" },
      ],
      logs: [
        { at: "Jun 17, 2026 · 08:53", who: "Atelier ARCO", what: "Flagged Construction KO — shoulder pitch off by 6mm" },
        { at: "Jun 15, 2026 · 14:21", who: "Léa Vautrin", what: "Uploaded revised toile reference" },
        { at: "Jun 11, 2026 · 11:00", who: "Studio", what: "Initialized product brief" },
      ],
    };
  }
  return {
    overall: { label: "In development — awaiting validation", tone: "warning" },
    gates: [
      { name: "Studio", role: "Creative", by: "Creative Director", at: "Jun 12 · 10:02", state: "approved" },
      { name: "Development", role: "Pattern & Mockup", by: "Technical Manager", at: "Awaiting mockup 02", state: "pending" },
      { name: "Production", role: "Industrialization", by: "Factory Lead", at: "Locked", state: "locked" },
    ],
    logs: [
      { at: "Jun 17, 2026 · 08:53", who: "Atelier ARCO", what: "Modified Lining component — added 2cm allowance" },
      { at: "Jun 16, 2026 · 17:11", who: "R. Allègre", what: "Marked Main POCHETTE as KO — pattern shifted 4mm" },
      { at: "Jun 15, 2026 · 09:30", who: "M. Conti", what: "Validated dimensional checkpoint against toile" },
      { at: "Jun 12, 2026 · 10:02", who: "Creative Director", what: "Signed off on Studio direction" },
    ],
  };
}

function VersionsTab({ product, productId }: { product: Product; productId: string }) {
  const data = gateDataForProduct(product);
  const toneClass =
    data.overall.tone === "success"
      ? "text-[var(--lime)] border-[color-mix(in_oklab,var(--lime)_40%,transparent)] bg-[color-mix(in_oklab,var(--lime)_10%,transparent)]"
      : data.overall.tone === "danger"
        ? "text-[var(--danger)] border-[color-mix(in_oklab,var(--danger)_40%,transparent)] bg-[color-mix(in_oklab,var(--danger)_10%,transparent)]"
        : "text-[var(--warning)] border-[color-mix(in_oklab,var(--warning)_40%,transparent)] bg-[color-mix(in_oklab,var(--warning)_10%,transparent)]";

  return (
    <section className="animate-in fade-in duration-200 space-y-12">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="tracking-luxury text-[10px] text-muted-foreground">Workflow status</div>
          <h2 className="mt-1 font-serif text-3xl">Version tracking & approvals</h2>
        </div>
        <div className={cn("rounded-sm border px-5 py-3 backdrop-blur", toneClass)}>
          <div className="tracking-luxury text-[9px] opacity-70">Current overall status</div>
          <div className="mt-1 font-serif text-xl">{data.overall.label}</div>
        </div>
      </div>

      <div className="border hairline bg-card p-8">
        <div className="mb-4 tracking-luxury text-[10px] text-muted-foreground">
          Select a gate to open department technical specifications
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {data.gates.map((g, i) => (
            <GateCard
              key={g.name}
              gate={g}
              index={i + 1}
              productId={productId}
              gateId={GATE_TO_SLUG[g.name as GateName]}
            />
          ))}
        </div>
        <div className="relative mt-6 hidden h-px bg-border md:block">
          <div
            className="absolute left-0 top-0 h-px bg-primary"
            style={{
              width: `${(data.gates.filter((g) => g.state === "approved").length / data.gates.length) * 100}%`,
            }}
          />
        </div>
      </div>

      <div>
        <div className="tracking-luxury text-[10px] text-muted-foreground">Changelog</div>
        <h3 className="mt-1 font-serif text-2xl">Chronological activity</h3>
        <ol className="mt-6 border-l hairline pl-6">
          {data.logs.map((l, i) => (
            <li key={i} className="relative pb-8 last:pb-0">
              <span className="absolute -left-[29px] top-1 grid h-3 w-3 place-items-center rounded-full border-2 border-primary bg-background">
                <span className="h-1 w-1 rounded-full bg-primary" />
              </span>
              <div className="font-mono text-[11px] text-muted-foreground">{l.at}</div>
              <div className="mt-1 text-sm">
                <span className="font-medium">{l.who}</span>{" "}
                <span className="text-muted-foreground">— {l.what}</span>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function GateCard({
  gate,
  index,
  productId,
  gateId,
}: {
  gate: { name: string; role: string; by: string; at: string; state: GateState };
  index: number;
  productId: string;
  gateId: GateSlug;
}) {
  const state = gate.state;
  const indicator =
    state === "approved" ? (
      <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground shadow-[0_0_18px_var(--lime)]">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M5 12l5 5L20 7" />
        </svg>
      </span>
    ) : state === "pending" ? (
      <span className="relative grid h-8 w-8 place-items-center rounded-full border border-[var(--warning)] text-[var(--warning)]">
        <span className="absolute inset-0 animate-ping rounded-full bg-[color-mix(in_oklab,var(--warning)_30%,transparent)]" />
        <span className="relative h-2 w-2 rounded-full bg-[var(--warning)]" />
      </span>
    ) : (
      <span className="grid h-8 w-8 place-items-center rounded-full border border-border text-muted-foreground">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="5" y="11" width="14" height="9" rx="2" />
          <path d="M8 11V8a4 4 0 018 0v3" />
        </svg>
      </span>
    );
  const label = state === "approved" ? "Approved" : state === "pending" ? "Pending" : "Locked";

  return (
    <Link
      to="/product/$id/specifications/$gateId"
      params={{ id: productId, gateId }}
      className={cn(
        "group relative flex flex-col gap-3 border hairline bg-background p-5 transition-all",
        "hover:border-primary/60 hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary",
        state === "approved" && "shadow-[0_0_0_1px_color-mix(in_oklab,var(--lime)_30%,transparent)]",
        state === "locked" && "opacity-80 hover:opacity-100",
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="font-mono text-[10px] text-muted-foreground">GATE 0{index}</div>
          <div className="mt-1 font-serif text-xl">{gate.name}</div>
          <div className="text-[11px] text-muted-foreground">{gate.role}</div>
        </div>
        {indicator}
      </div>
      <div className="mt-2 border-t hairline pt-3 text-[11px]">
        <div className="flex items-center justify-between">
          <span className="tracking-luxury text-[9px] text-muted-foreground">{label}</span>
          <span className="font-mono text-muted-foreground">{gate.at}</span>
        </div>
        <div className="mt-1 text-foreground">{gate.by}</div>
      </div>
      <div className="mt-1 flex items-center gap-1.5 tracking-luxury text-[9px] text-muted-foreground transition-colors group-hover:text-foreground">
        <span>View technical specs</span>
        <span className="transition-transform group-hover:translate-x-0.5">→</span>
      </div>
    </Link>
  );
}

function AnalyticsTab({ product }: { product: Product }) {
  const risk = riskForProduct(product);
  const live = liveFeedForProduct(product);
  const efficiency = efficiencyForProduct(product);

  return (
    <section className="animate-in fade-in duration-200 space-y-10">
      <div>
        <div className="tracking-luxury text-[10px] text-muted-foreground">Operational metrics</div>
        <h2 className="mt-1 font-serif text-3xl">Product analytics & live data</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {risk.map((r) => (
          <RiskWidget key={r.label} {...r} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="border hairline bg-card">
          <div className="flex items-center justify-between border-b hairline px-6 py-4">
            <div>
              <div className="tracking-luxury text-[10px] text-muted-foreground">Atelier {product.site}</div>
              <h3 className="mt-1 font-serif text-xl">Live feed</h3>
            </div>
            <span className="inline-flex items-center gap-2 text-[10px] text-muted-foreground">
              <span className="relative flex h-2 w-2">
                <span className="absolute inset-0 animate-ping rounded-full bg-primary opacity-70" />
                <span className="relative h-2 w-2 rounded-full bg-primary" />
              </span>
              LIVE
            </span>
          </div>
          <ul className="divide-y divide-border font-mono text-[12px]">
            {live.map((f, i) => (
              <li key={i} className="flex items-start gap-4 px-6 py-3">
                <span className="text-muted-foreground">{f.at}</span>
                <span className="flex-1 text-foreground">{f.msg}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          {efficiency.map((m) => (
            <div key={m.label} className="border hairline bg-card p-5">
              <div className="tracking-luxury text-[10px] text-muted-foreground">{m.label}</div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-serif text-4xl">{m.value}</span>
                <span className="text-xs text-muted-foreground">{m.unit}</span>
              </div>
              <div
                className={cn(
                  "mt-2 text-[11px]",
                  m.deltaTone === "good"
                    ? "text-[var(--lime)]"
                    : m.deltaTone === "bad"
                      ? "text-[var(--danger)]"
                      : "text-muted-foreground",
                )}
              >
                {m.delta}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function RiskWidget({ label, value, tone }: { label: string; value: number; tone: "good" | "warn" | "bad" }) {
  const color =
    tone === "good" ? "var(--lime)" : tone === "warn" ? "var(--warning)" : "var(--danger)";
  return (
    <div className="border hairline bg-card p-5">
      <div className="tracking-luxury text-[10px] text-muted-foreground">{label}</div>
      <div className="mt-3 flex items-baseline justify-between">
        <span className="font-serif text-3xl">{value}%</span>
        <span className="font-mono text-[10px]" style={{ color }}>
          {tone === "good" ? "HEALTHY" : tone === "warn" ? "WATCH" : "AT RISK"}
        </span>
      </div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full"
          style={{
            width: `${value}%`,
            background: `linear-gradient(90deg, ${color}, color-mix(in oklab, ${color} 60%, transparent))`,
            boxShadow: `0 0 12px ${color}`,
          }}
        />
      </div>
    </div>
  );
}

function riskForProduct(p: Product) {
  if (p.goStyle === "GO" && p.goSolidity === "GO") {
    return [
      { label: "Quality", value: 92, tone: "good" as const },
      { label: "Time to Market", value: 88, tone: "good" as const },
      { label: "Margin", value: 81, tone: "good" as const },
      { label: "Feasibility", value: 95, tone: "good" as const },
    ];
  }
  if (p.goStyle === "KO" || p.goSolidity === "KO") {
    return [
      { label: "Quality", value: 42, tone: "bad" as const },
      { label: "Time to Market", value: 31, tone: "bad" as const },
      { label: "Margin", value: 58, tone: "warn" as const },
      { label: "Feasibility", value: 38, tone: "bad" as const },
    ];
  }
  return [
    { label: "Quality", value: 74, tone: "warn" as const },
    { label: "Time to Market", value: 66, tone: "warn" as const },
    { label: "Margin", value: 82, tone: "good" as const },
    { label: "Feasibility", value: 70, tone: "warn" as const },
  ];
}

function liveFeedForProduct(p: Product) {
  return [
    { at: "08:53", msg: `Supplier thread batch #49A received at atelier ${p.site}` },
    { at: "08:41", msg: "Sample 2 drying process completed — 4h22 cycle" },
    { at: "08:12", msg: "Pattern revision uploaded by Technical Manager" },
    { at: "07:58", msg: `PMET brass plating QC passed — lot ${p.sku.slice(-3)}-B` },
    { at: "07:30", msg: "Atelier shift started — 6 operators assigned" },
    { at: "Yesterday", msg: "Mockup 03 photographed and synced to Studio" },
  ];
}

function efficiencyForProduct(p: Product) {
  const blocked = p.goStyle === "KO" || p.goSolidity === "KO";
  return [
    {
      label: "Days in current phase",
      value: blocked ? 18 : 6,
      unit: "days",
      delta: blocked ? "+9 vs. average" : "On track",
      deltaTone: blocked ? ("bad" as const) : ("good" as const),
    },
    {
      label: "Estimated completion",
      value: blocked ? "Aug 04" : "Jul 12",
      unit: blocked ? "· 12 days late" : "· 3 days early",
      delta: `Target deadline: Jul 15, 2026`,
      deltaTone: blocked ? ("bad" as const) : ("good" as const),
    },
  ];
}
