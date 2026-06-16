import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Nav, Footer } from "@/components/layout/nav";
import { GoBadge } from "@/components/status-badge";
import { PRODUCTS } from "@/lib/mock-data";

export const Route = createFileRoute("/library")({
  head: () => ({
    meta: [
      { title: "Product Library — Premiere Main" },
      { name: "description", content: "Browse all products in development." },
    ],
  }),
  component: Library,
});

const CATS = ["All", "Bags", "Ready-to-Wear", "Accessories"] as const;
const SITES = ["All", "ARCO", "MLM", "FLR"] as const;

function Library() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<(typeof CATS)[number]>("All");
  const [site, setSite] = useState<(typeof SITES)[number]>("All");

  const filtered = useMemo(
    () =>
      PRODUCTS.filter(
        (p) =>
          (cat === "All" || p.category === cat) &&
          (site === "All" || p.site === site) &&
          (q === "" ||
            p.name.toLowerCase().includes(q.toLowerCase()) ||
            p.sku.includes(q)),
      ),
    [q, cat, site],
  );

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="mx-auto max-w-[1400px] px-8 py-14">
        <div className="flex flex-wrap items-end justify-between gap-6 border-b hairline pb-8">
          <div>
            <div className="tracking-luxury text-[10px] text-muted-foreground">
              Product Library
            </div>
            <h1 className="mt-2 font-serif text-5xl">The Collection</h1>
            <p className="mt-3 max-w-md text-sm text-muted-foreground">
              Every prototype, every iteration. Refined for the studio and the atelier.
            </p>
          </div>
          <Link
            to="/add"
            className="rounded-sm border border-foreground bg-foreground px-5 py-3 text-[11px] tracking-luxury text-background hover:bg-foreground/85"
          >
            + Add Product
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or SKU…"
            className="flex-1 min-w-[240px] border hairline bg-card px-4 py-3 text-sm placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
          />
          <Pills label="Category" options={CATS} value={cat} onChange={setCat} />
          <Pills label="Factory" options={SITES} value={site} onChange={setSite} />
        </div>

        <div className="mt-10 grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <Link
              key={p.id}
              to="/product/$id"
              params={{ id: p.id }}
              className="group flex flex-col bg-card transition-colors hover:bg-muted"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                <img
                  src={p.cover}
                  alt={p.name}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
                <div className="absolute left-4 top-4 flex flex-col gap-1">
                  <span className="bg-background/90 px-2 py-1 font-mono text-[10px] tracking-wide">
                    {p.sku}
                  </span>
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-3 p-6">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="font-serif text-2xl leading-tight">{p.name}</h3>
                  <span className="tracking-luxury text-[10px] text-muted-foreground">
                    {p.collection}
                  </span>
                </div>
                <div className="text-[12px] text-muted-foreground">
                  {p.category} · {p.site} · {p.designer}
                </div>
                <div className="mt-auto flex flex-wrap gap-2 pt-3">
                  <GoBadge value={p.goStyle} label="GO Style" />
                  <GoBadge value={p.goSolidity} label="GO Solidity" />
                </div>
              </div>
            </Link>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full bg-card p-16 text-center text-sm text-muted-foreground">
              No products match these filters.
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Pills<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="tracking-luxury text-[10px] text-muted-foreground">{label}</span>
      <div className="flex border hairline">
        {options.map((o) => (
          <button
            key={o}
            onClick={() => onChange(o)}
            className={`px-3 py-2 text-[11px] tracking-wide transition-colors ${
              value === o
                ? "bg-foreground text-background"
                : "bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}
