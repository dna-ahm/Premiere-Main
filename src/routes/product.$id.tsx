import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Nav, Footer } from "@/components/layout/nav";
import { GoBadge, StatusPill } from "@/components/status-badge";
import {
  getProduct,
  STATUS_META,
  type CheckRow,
  type Comment,
  type Product,
  type StatusCode,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/product/$id")({
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
  notFoundComponent: () => (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="mx-auto max-w-3xl px-8 py-24 text-center">
        <h1 className="font-serif text-5xl">Not found</h1>
        <p className="mt-4 text-muted-foreground">This product could not be located.</p>
        <Link
          to="/library"
          className="mt-8 inline-block rounded-sm bg-primary px-5 py-3 text-[11px] tracking-luxury text-primary-foreground"
        >
          Back to library
        </Link>
      </div>
    </div>
  ),
});

type TabKey = "specs" | "versions" | "analytics";

function ProductDetail() {
  const { product } = Route.useLoaderData();
  const [rows, setRows] = useState<CheckRow[]>(product.rows);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ r3: true });
  const [chatRow, setChatRow] = useState<CheckRow | null>(null);
  const [zoom, setZoom] = useState<string | null>(null);
  const [tab, setTab] = useState<TabKey>("specs");

  const setStatus = (rowId: string, parentId: string | null, status: StatusCode) => {
    setRows((prev) =>
      prev.map((r) => {
        if (parentId && r.id === parentId) {
          return {
            ...r,
            subRows: r.subRows?.map((s) => (s.id === rowId ? { ...s, status } : s)),
          };
        }
        if (!parentId && r.id === rowId) return { ...r, status };
        return r;
      }),
    );
  };

  const addComment = (rowId: string, parentId: string | null, body: string) => {
    if (!body.trim()) return;
    const newC: Comment = {
      id: crypto.randomUUID(),
      author: "You",
      at: "just now",
      body,
    };
    setRows((prev) =>
      prev.map((r) => {
        if (parentId && r.id === parentId) {
          return {
            ...r,
            subRows: r.subRows?.map((s) =>
              s.id === rowId ? { ...s, comments: [...s.comments, newC] } : s,
            ),
          };
        }
        if (!parentId && r.id === rowId) return { ...r, comments: [...r.comments, newC] };
        return r;
      }),
    );
    setChatRow((c) => (c ? { ...c, comments: [...c.comments, newC] } : c));
  };

  const tabs: { key: TabKey; label: string; hint: string }[] = [
    { key: "specs", label: "Technical Specifications", hint: "01" },
    { key: "versions", label: "Version Tracking & Approvals", hint: "02" },
    { key: "analytics", label: "Product Analytics & Live Data", hint: "03" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="mx-auto max-w-[1400px] px-8 py-12">
        <Link
          to="/library"
          className="tracking-luxury text-[10px] text-muted-foreground hover:text-foreground"
        >
          ← Back to library
        </Link>

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

        {/* Tab Nav */}
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
          {tab === "specs" && (
            <SpecsTab
              rows={rows}
              expanded={expanded}
              setExpanded={setExpanded}
              setStatus={setStatus}
              setChatRow={setChatRow}
              setZoom={(u) => setZoom(u)}
              cover={product.cover}
            />
          )}
          {tab === "versions" && <VersionsTab product={product} />}
          {tab === "analytics" && <AnalyticsTab product={product} />}
        </div>
      </main>

      {chatRow && (
        <ChatPanel
          row={chatRow}
          onClose={() => setChatRow(null)}
          onSend={(body) => {
            const parentId =
              rows.find((r) => r.subRows?.some((s) => s.id === chatRow.id))?.id ?? null;
            addComment(chatRow.id, parentId, body);
          }}
        />
      )}

      {zoom && (
        <button
          onClick={() => setZoom(null)}
          className="fixed inset-0 z-50 grid place-items-center bg-background/95 p-8"
        >
          <img src={zoom} alt="" className="max-h-full max-w-full object-contain" />
        </button>
      )}

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

function Legend() {
  return (
    <div className="hidden flex-wrap gap-2 md:flex">
      {(["triangle", "ok", "ko", "delta"] as StatusCode[]).map((s) => (
        <StatusPill key={s} status={s} showLabel />
      ))}
    </div>
  );
}

/* ============== TAB 1 — SPECS ============== */

function SpecsTab({
  rows,
  expanded,
  setExpanded,
  setStatus,
  setChatRow,
  setZoom,
  cover,
}: {
  rows: CheckRow[];
  expanded: Record<string, boolean>;
  setExpanded: (fn: (e: Record<string, boolean>) => Record<string, boolean>) => void;
  setStatus: (rowId: string, parentId: string | null, status: StatusCode) => void;
  setChatRow: (r: CheckRow) => void;
  setZoom: (url: string) => void;
  cover: string;
}) {
  return (
    <section className="animate-in fade-in duration-200">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="tracking-luxury text-[10px] text-muted-foreground">Smart Table</div>
          <h2 className="mt-1 font-serif text-3xl">Technical evaluation</h2>
        </div>
        <Legend />
      </div>

      <div className="mt-6 border hairline bg-card">
        <div className="grid grid-cols-[60px_1fr_140px_220px_100px_50px] gap-4 border-b hairline px-6 py-3 tracking-luxury text-[10px] text-muted-foreground">
          <span>#</span>
          <span>Checkpoint</span>
          <span>Status</span>
          <span>Note</span>
          <span>Media</span>
          <span className="text-right">Chat</span>
        </div>
        {rows.map((row) => (
          <TableRow
            key={row.id}
            row={row}
            expanded={!!expanded[row.id]}
            onToggle={() => setExpanded((e) => ({ ...e, [row.id]: !e[row.id] }))}
            onStatus={(s) => setStatus(row.id, null, s)}
            onChat={() => setChatRow(row)}
            onZoom={() => setZoom(cover)}
            onSubStatus={(subId, s) => setStatus(subId, row.id, s)}
            onSubChat={(sub) => setChatRow(sub)}
          />
        ))}
      </div>
    </section>
  );
}

function TableRow({
  row,
  expanded,
  onToggle,
  onStatus,
  onChat,
  onZoom,
  onSubStatus,
  onSubChat,
}: {
  row: CheckRow;
  expanded: boolean;
  onToggle: () => void;
  onStatus: (s: StatusCode) => void;
  onChat: () => void;
  onZoom: () => void;
  onSubStatus: (subId: string, s: StatusCode) => void;
  onSubChat: (sub: CheckRow) => void;
}) {
  const hasSubs = !!row.subRows?.length;
  return (
    <>
      <div className="grid grid-cols-[60px_1fr_140px_220px_100px_50px] items-center gap-4 border-b hairline px-6 py-4 transition-colors hover:bg-muted/50">
        <span className="font-mono text-[12px] text-muted-foreground">{row.index}</span>
        <div className="flex items-center gap-3">
          {hasSubs && (
            <button
              onClick={onToggle}
              className="grid h-6 w-6 place-items-center border hairline text-[10px]"
            >
              {expanded ? "−" : "+"}
            </button>
          )}
          <span className="font-serif text-lg">{row.label}</span>
        </div>
        <StatusSelector value={row.status} onChange={onStatus} />
        <span className="truncate text-[12px] text-muted-foreground">{row.note ?? "—"}</span>
        <button
          onClick={onZoom}
          className="h-10 w-12 overflow-hidden border hairline bg-muted text-[9px] text-muted-foreground hover:opacity-80"
          title="Open media"
        >
          <span className="grid h-full place-items-center">image</span>
        </button>
        <button
          onClick={onChat}
          className="relative justify-self-end text-muted-foreground hover:text-foreground"
          aria-label="Open chat"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
          {row.comments.length > 0 && (
            <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-foreground text-[9px] text-primary-foreground">
              {row.comments.length}
            </span>
          )}
        </button>
      </div>

      {hasSubs && expanded &&
        row.subRows!.map((sub) => (
          <div
            key={sub.id}
            className="grid grid-cols-[60px_1fr_140px_220px_100px_50px] items-center gap-4 border-b hairline bg-muted/30 px-6 py-3 pl-10"
          >
            <span className="font-mono text-[11px] text-muted-foreground">{sub.index}</span>
            <span className="text-sm">{sub.label}</span>
            <StatusSelector value={sub.status} onChange={(s) => onSubStatus(sub.id, s)} />
            <span className="truncate text-[12px] text-muted-foreground">{sub.note ?? "—"}</span>
            <span className="text-[10px] text-muted-foreground">—</span>
            <button
              onClick={() => onSubChat(sub)}
              className="justify-self-end text-muted-foreground hover:text-foreground"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
            </button>
          </div>
        ))}
    </>
  );
}

function StatusSelector({ value, onChange }: { value: StatusCode; onChange: (s: StatusCode) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="inline-flex items-center gap-2"
      >
        <StatusPill status={value} />
        <span className="text-[10px] text-muted-foreground">▾</span>
      </button>
      {open && (
        <div className="absolute left-0 top-full z-30 mt-2 w-80 border hairline bg-popover p-2 shadow-xl">
          {(["triangle", "ok", "ko", "delta", "empty"] as StatusCode[]).map((s) => (
            <button
              key={s}
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(s);
                setOpen(false);
              }}
              className="flex w-full items-center gap-3 px-3 py-2 text-left text-[12px] hover:bg-muted"
            >
              <StatusPill status={s} />
              <span className="text-muted-foreground">{STATUS_META[s].label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ChatPanel({
  row,
  onClose,
  onSend,
}: {
  row: CheckRow;
  onClose: () => void;
  onSend: (body: string) => void;
}) {
  const [text, setText] = useState("");
  return (
    <div className="fixed inset-0 z-40">
      <button className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} aria-label="Close" />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l hairline bg-background">
        <div className="flex items-start justify-between gap-4 border-b hairline p-6">
          <div>
            <div className="tracking-luxury text-[10px] text-muted-foreground">
              {row.index} — Discussion
            </div>
            <h3 className="mt-1 font-serif text-2xl">{row.label}</h3>
          </div>
          <button onClick={onClose} className="text-xl text-muted-foreground hover:text-foreground">
            ✕
          </button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          {row.comments.length === 0 && (
            <p className="text-sm text-muted-foreground">No comments yet. Start the conversation.</p>
          )}
          {row.comments.map((c) => (
            <div key={c.id} className="border hairline bg-card p-4">
              <div className="flex items-baseline justify-between text-[11px]">
                <span className="font-medium">{c.author}</span>
                <span className="text-muted-foreground">{c.at}</span>
              </div>
              <p className="mt-2 text-sm">{c.body}</p>
            </div>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSend(text);
            setText("");
          }}
          className="border-t hairline p-4"
        >
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write to studio & atelier…"
            rows={3}
            className="w-full resize-none border hairline bg-card p-3 text-sm focus:border-foreground focus:outline-none"
          />
          <button
            type="submit"
            className="mt-3 w-full rounded-sm bg-primary px-4 py-2.5 text-[11px] tracking-luxury text-primary-foreground"
          >
            Send comment
          </button>
        </form>
      </aside>
    </div>
  );
}

/* ============== TAB 2 — VERSIONS ============== */

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

function VersionsTab({ product }: { product: Product }) {
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

      {/* Gates timeline */}
      <div className="border hairline bg-card p-8">
        <div className="grid gap-6 md:grid-cols-3">
          {data.gates.map((g, i) => (
            <GateCard key={g.name} gate={g} index={i + 1} />
          ))}
        </div>
        {/* connector */}
        <div className="relative mt-6 hidden h-px bg-border md:block">
          <div
            className="absolute left-0 top-0 h-px bg-primary"
            style={{
              width: `${(data.gates.filter((g) => g.state === "approved").length / data.gates.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Chronological logs */}
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
}: {
  gate: { name: string; role: string; by: string; at: string; state: GateState };
  index: number;
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
    <div
      className={cn(
        "relative flex flex-col gap-3 border hairline bg-background p-5 transition",
        state === "approved" && "shadow-[0_0_0_1px_color-mix(in_oklab,var(--lime)_30%,transparent)]",
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
    </div>
  );
}

/* ============== TAB 3 — ANALYTICS ============== */

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

      {/* Risk widgets */}
      <div className="grid gap-4 md:grid-cols-4">
        {risk.map((r) => (
          <RiskWidget key={r.label} {...r} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Live feed */}
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

        {/* Efficiency metrics */}
        <div className="space-y-4">
          {efficiency.map((m) => (
            <div key={m.label} className="border hairline bg-card p-5">
              <div className="tracking-luxury text-[10px] text-muted-foreground">{m.label}</div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-serif text-4xl">{m.value}</span>
                <span className="text-xs text-muted-foreground">{m.unit}</span>
              </div>
              <div className={cn("mt-2 text-[11px]", m.deltaTone === "good" ? "text-[var(--lime)]" : m.deltaTone === "bad" ? "text-[var(--danger)]" : "text-muted-foreground")}>
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
