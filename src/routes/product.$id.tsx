import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Nav, Footer } from "@/components/layout/nav";
import { GoBadge, StatusPill } from "@/components/status-badge";
import {
  getProduct,
  STATUS_META,
  type CheckRow,
  type Comment,
  type StatusCode,
} from "@/lib/mock-data";

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

function ProductDetail() {
  const { product } = Route.useLoaderData();
  const [rows, setRows] = useState<CheckRow[]>(product.rows);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ r3: true });
  const [chatRow, setChatRow] = useState<CheckRow | null>(null);
  const [zoom, setZoom] = useState<string | null>(null);

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

        <section className="mt-14">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="tracking-luxury text-[10px] text-muted-foreground">
                Smart Table
              </div>
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
                onToggle={() =>
                  setExpanded((e) => ({ ...e, [row.id]: !e[row.id] }))
                }
                onStatus={(s) => setStatus(row.id, null, s)}
                onChat={() => setChatRow(row)}
                onZoom={() => setZoom(product.cover)}
                onSubStatus={(subId, s) => setStatus(subId, row.id, s)}
                onSubChat={(sub) => setChatRow(sub)}
              />
            ))}
          </div>
        </section>
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
          className="fixed inset-0 z-50 grid place-items-center bg-foreground/90 p-8"
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
            <span className="truncate text-[12px] text-muted-foreground">
              {sub.note ?? "—"}
            </span>
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

function StatusSelector({
  value,
  onChange,
}: {
  value: StatusCode;
  onChange: (s: StatusCode) => void;
}) {
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
      <button className="absolute inset-0 bg-foreground/30" onClick={onClose} aria-label="Close" />
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
