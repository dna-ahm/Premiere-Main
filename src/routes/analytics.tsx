import { createFileRoute, Link } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Nav, Footer } from "@/components/layout/nav";
import { PRODUCTS, STATUS_META, type StatusCode } from "@/lib/mock-data";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — Premiere Main" },
      { name: "description", content: "Production readiness and risk analytics." },
    ],
  }),
  component: Analytics,
});

function Analytics() {
  const allRows = PRODUCTS.flatMap((p) =>
    p.rows.flatMap((r) => [r, ...(r.subRows ?? [])]),
  );

  const statusCounts = (["triangle", "ok", "ko", "delta"] as StatusCode[]).map((s) => ({
    status: STATUS_META[s].symbol,
    label: STATUS_META[s].label.split("—")[0].trim(),
    count: allRows.filter((r) => r.status === s).length,
  }));

  const byCollection = Array.from(new Set(PRODUCTS.map((p) => p.collection))).map((col) => {
    const rows = PRODUCTS.filter((p) => p.collection === col).flatMap((p) =>
      p.rows.flatMap((r) => [r, ...(r.subRows ?? [])]),
    );
    return {
      collection: col,
      OK: rows.filter((r) => r.status === "ok").length,
      Target: rows.filter((r) => r.status === "triangle").length,
      GoProd: rows.filter((r) => r.status === "delta").length,
      KO: rows.filter((r) => r.status === "ko").length,
    };
  });

  const alerts = PRODUCTS.flatMap((p) =>
    p.rows
      .flatMap((r) => [r, ...(r.subRows ?? [])])
      .filter((r) => r.status === "ko")
      .map((r) => ({ product: p, row: r })),
  );

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="mx-auto max-w-[1400px] px-8 py-14">
        <div className="border-b hairline pb-8">
          <div className="tracking-luxury text-[10px] text-muted-foreground">Analytics</div>
          <h1 className="mt-2 font-serif text-5xl">Readiness & risk</h1>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">
            A precise reading of where every checkpoint stands today.
          </p>
        </div>

        <section className="mt-12 grid gap-10 lg:grid-cols-2">
          <Card title="Checkpoints by status" eyebrow="01 / Distribution">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusCounts}>
                  <defs>
                    <linearGradient id="limeBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#B8FF3C" stopOpacity={1} />
                      <stop offset="100%" stopColor="#B8FF3C" stopOpacity={0.25} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#1E2235" vertical={false} />
                  <XAxis dataKey="status" tick={{ fontSize: 12, fill: "#8A8FA8" }} stroke="#1E2235" />
                  <YAxis tick={{ fontSize: 11, fill: "#8A8FA8" }} stroke="#1E2235" />
                  <Tooltip
                    cursor={{ fill: "rgba(184,255,60,0.08)" }}
                    contentStyle={{
                      background: "#0D1120",
                      border: "1px solid #1E2235",
                      borderRadius: 10,
                      fontSize: 12,
                      color: "#F4F6FB",
                    }}
                  />
                  <Bar dataKey="count" fill="url(#limeBar)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <ul className="mt-4 grid grid-cols-2 gap-3 text-[11px]">
              {statusCounts.map((s) => (
                <li key={s.status} className="flex items-center justify-between border-b hairline pb-2">
                  <span>
                    <span className="font-mono">{s.status}</span> · {s.label}
                  </span>
                  <span className="font-serif text-lg">{s.count}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Readiness by collection" eyebrow="02 / Collections">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byCollection}>
                  <CartesianGrid stroke="#1E2235" vertical={false} />
                  <XAxis dataKey="collection" tick={{ fontSize: 12, fill: "#8A8FA8" }} stroke="#1E2235" />
                  <YAxis tick={{ fontSize: 11, fill: "#8A8FA8" }} stroke="#1E2235" />
                  <Tooltip
                    cursor={{ fill: "rgba(184,255,60,0.08)" }}
                    contentStyle={{
                      background: "#0D1120",
                      border: "1px solid #1E2235",
                      borderRadius: 10,
                      fontSize: 12,
                      color: "#F4F6FB",
                    }}
                  />
                  <Bar dataKey="OK" stackId="a" fill="#B8FF3C" />
                  <Bar dataKey="Target" stackId="a" fill="#FFC857" />
                  <Bar dataKey="GoProd" stackId="a" fill="#7BB8FF" />
                  <Bar dataKey="KO" stackId="a" fill="#FF5C7A" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex flex-wrap gap-3 text-[10px] tracking-luxury text-muted-foreground">
              <Swatch color="#B8FF3C" label="OK" />
              <Swatch color="#FFC857" label="Target ▲" />
              <Swatch color="#7BB8FF" label="GoProd Δ" />
              <Swatch color="#FF5C7A" label="KO" />
            </div>
          </Card>
        </section>

        <section className="mt-12">
          <div className="flex items-end justify-between border-b hairline pb-4">
            <div>
              <div className="tracking-luxury text-[10px] text-muted-foreground">
                03 / Urgent alerts
              </div>
              <h2 className="mt-1 font-serif text-3xl">Blocking the timeline</h2>
            </div>
            <span className="font-mono text-sm text-muted-foreground">{alerts.length} open</span>
          </div>
          <ul className="mt-6 divide-y hairline border-y hairline">
            {alerts.map(({ product, row }) => (
              <li key={`${product.id}-${row.id}`} className="flex items-center justify-between gap-6 py-5">
                <div className="flex items-center gap-4">
                  <span className="grid h-10 w-10 place-items-center rounded-full border border-[color-mix(in_oklab,var(--danger)_40%,transparent)] bg-[color-mix(in_oklab,var(--danger)_14%,transparent)] font-mono text-[var(--danger)]">
                    X
                  </span>
                  <div>
                    <div className="font-serif text-xl">{product.name}</div>
                    <div className="text-[12px] text-muted-foreground">
                      SKU {product.sku} · {row.index} {row.label}
                      {row.note ? ` — ${row.note}` : ""}
                    </div>
                  </div>
                </div>
                <Link
                  to="/product/$id"
                  params={{ id: product.id }}
                  className="rounded-full border hairline px-4 py-2 text-[11px] tracking-luxury hover:bg-muted"
                >
                  Resolve →
                </Link>
              </li>
            ))}
            {alerts.length === 0 && (
              <li className="py-8 text-center text-sm text-muted-foreground">
                No blocking issues. The collection is on track.
              </li>
            )}
          </ul>
        </section>

      </main>
      <Footer />
    </div>
  );
}

function Card({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border hairline bg-card p-8">
      <div className="tracking-luxury text-[10px] text-muted-foreground">{eyebrow}</div>
      <h2 className="mt-1 font-serif text-2xl">{title}</h2>
      <div className="mt-6">{children}</div>
    </div>
  );
}

function Swatch({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="inline-block h-3 w-3" style={{ background: color }} />
      {label}
    </span>
  );
}
