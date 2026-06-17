import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Footer, Nav } from "@/components/layout/nav";
import { StatusPill } from "@/components/status-badge";
import {
  getProduct,
  STATUS_META,
  type CheckRow,
  type Comment,
  type StatusCode,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type GateSlug = "studio" | "development" | "production";

const GATE_LABEL: Record<GateSlug, string> = {
  studio: "Studio",
  development: "Development",
  production: "Production",
};

const GATE_META: Record<GateSlug, { role: string; subtitle: string }> = {
  studio: { role: "Creative", subtitle: "Design & silhouette checkpoints" },
  development: { role: "Pattern & Mockup", subtitle: "Construction & toile validation" },
  production: { role: "Industrialization", subtitle: "Manufacturing & component specs" },
};

const GATE_ROW_IDS: Record<GateSlug, string[]> = {
  studio: ["r1", "r3"],
  development: ["r2", "r3", "r4"],
  production: ["r5", "r6"],
};

const ANALYSIS_NAMES = ["Mockup Analysis n°1", "Mockup Analysis n°2", "Mockup Analysis n°3"] as const;

const cloneRows = (rows: CheckRow[]) =>
  rows.map((row) => ({
    ...row,
    comments: [...row.comments],
    subRows: row.subRows?.map((sub) => ({ ...sub, comments: [...sub.comments] })),
  }));

export const Route = createFileRoute("/product/$id/specifications/$gateId")({
  loader: ({ params }) => {
    const product = getProduct(params.id);
    const gateId = params.gateId as GateSlug;
    if (!product || !GATE_LABEL[gateId]) throw notFound();
    return { product, gateId };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: `${loaderData?.product.name ?? "Product"} — ${loaderData ? GATE_LABEL[loaderData.gateId] : "Gate"} Specs`,
      },
    ],
  }),
  component: SpecificationsPage,
});

function SpecificationsPage() {
  const { product, gateId } = Route.useLoaderData();
  const gateLabel = GATE_LABEL[gateId];
  const gateMeta = GATE_META[gateId];

  const gateRows = useMemo(
    () => cloneRows(product.rows.filter((row) => GATE_ROW_IDS[gateId].includes(row.id))),
    [product.rows, gateId],
  );

  const [analyses, setAnalyses] = useState(() =>
    ANALYSIS_NAMES.map(() => ({
      rows: cloneRows(gateRows),
      expanded: { r3: true } as Record<string, boolean>,
    })),
  );
  const [chatRow, setChatRow] = useState<CheckRow | null>(null);
  const [zoom, setZoom] = useState<string | null>(null);

  const setStatus = (
    analysisIndex: number,
    rowId: string,
    parentId: string | null,
    status: StatusCode,
  ) => {
    setAnalyses((prev) =>
      prev.map((analysis, i) => {
        if (i !== analysisIndex) return analysis;
        return {
          ...analysis,
          rows: analysis.rows.map((row) => {
            if (parentId && row.id === parentId) {
              return {
                ...row,
                subRows: row.subRows?.map((sub) => (sub.id === rowId ? { ...sub, status } : sub)),
              };
            }
            if (!parentId && row.id === rowId) return { ...row, status };
            return row;
          }),
        };
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
    setAnalyses((prev) =>
      prev.map((analysis) => ({
        ...analysis,
        rows: analysis.rows.map((row) => {
          if (parentId && row.id === parentId) {
            return {
              ...row,
              subRows: row.subRows?.map((sub) =>
                sub.id === rowId ? { ...sub, comments: [...sub.comments, newC] } : sub,
              ),
            };
          }
          if (!parentId && row.id === rowId) return { ...row, comments: [...row.comments, newC] };
          return row;
        }),
      })),
    );
    setChatRow((current) => (current ? { ...current, comments: [...current.comments, newC] } : current));
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <main className="mx-auto max-w-[1400px] px-8 py-12">
        <Link
          to="/product/$id"
          params={{ id: product.id }}
          className="tracking-luxury text-[10px] text-muted-foreground hover:text-foreground"
        >
          ← Back to Version Tracking
        </Link>

        <header className="mt-6 border hairline bg-card p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="tracking-luxury text-[10px] text-muted-foreground">Technical Specifications</div>
              <h1 className="mt-2 font-serif text-5xl leading-tight">
                {product.name} · {gateLabel} Gate
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {gateMeta.role} · {gateMeta.subtitle}
              </p>
            </div>
            <div className="rounded-sm border hairline bg-muted px-4 py-3">
              <div className="tracking-luxury text-[9px] text-muted-foreground">SKU</div>
              <div className="mt-1 font-mono text-sm text-primary">{product.sku}</div>
            </div>
          </div>
        </header>

        <section className="mt-10 space-y-8">
          {ANALYSIS_NAMES.map((analysisName, analysisIndex) => (
            <article key={analysisName} className="border hairline bg-card">
              <header className="flex flex-wrap items-center justify-between gap-3 border-b hairline px-6 py-4">
                <h2 className="font-serif text-2xl">{analysisName}</h2>
                <span className="tracking-luxury text-[10px] text-primary">
                  {gateLabel.toUpperCase()} WORKSTREAM
                </span>
              </header>
              <SpecsTable
                rows={analyses[analysisIndex].rows}
                expanded={analyses[analysisIndex].expanded}
                setExpanded={(fn) =>
                  setAnalyses((prev) =>
                    prev.map((analysis, i) =>
                      i === analysisIndex ? { ...analysis, expanded: fn(analysis.expanded) } : analysis,
                    ),
                  )
                }
                setStatus={(rowId, parentId, status) =>
                  setStatus(analysisIndex, rowId, parentId, status)
                }
                setChatRow={setChatRow}
                setZoom={setZoom}
                cover={product.cover}
              />
            </article>
          ))}
        </section>
      </main>

      {chatRow && (
        <ChatPanel
          row={chatRow}
          onClose={() => setChatRow(null)}
          onSend={(body) => {
            const parentId =
              analyses
                .flatMap((a) => a.rows)
                .find((r) => r.subRows?.some((s) => s.id === chatRow.id))?.id ?? null;
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

function SpecsTable({
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
    <div>
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
              type="button"
              onClick={onToggle}
              className="grid h-6 w-6 place-items-center border hairline text-[10px] text-primary"
            >
              {expanded ? "−" : "+"}
            </button>
          )}
          <span className="font-serif text-lg">{row.label}</span>
        </div>
        <StatusSelector value={row.status} onChange={onStatus} />
        <span className="truncate text-[12px] text-muted-foreground">{row.note ?? "—"}</span>
        <button
          type="button"
          onClick={onZoom}
          className="h-10 w-12 overflow-hidden border hairline bg-muted text-[9px] text-muted-foreground hover:bg-muted/80"
          title="Open media"
        >
          <span className="grid h-full place-items-center">image</span>
        </button>
        <button
          type="button"
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

      {hasSubs &&
        expanded &&
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
              type="button"
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
        type="button"
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
              type="button"
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
    <div className="fixed inset-0 z-50">
      <button className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} aria-label="Close" />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l hairline bg-background">
        <div className="flex items-start justify-between gap-4 border-b hairline p-6">
          <div>
            <div className="tracking-luxury text-[10px] text-muted-foreground">
              {row.index} — Discussion
            </div>
            <h3 className="mt-1 font-serif text-2xl">{row.label}</h3>
          </div>
          <button type="button" onClick={onClose} className="text-xl text-muted-foreground hover:text-foreground">
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
