import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Footer, Nav } from "@/components/layout/nav";
import { SmartTable } from "@/components/smart-table";
import {
  getProduct,
  type CheckRow,
  type Comment,
  type StatusCode,
} from "@/lib/mock-data";
import { createSpecificationRows } from "@/lib/specification-rows";

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

  const specificationRows = useMemo(() => createSpecificationRows(product.rows), [product.rows]);

  const [analyses, setAnalyses] = useState(() =>
    ANALYSIS_NAMES.map(() => ({
      rows: cloneRows(specificationRows),
      expanded: {} as Record<string, boolean>,
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
              <SmartTable
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
