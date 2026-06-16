export type StatusCode = "triangle" | "ok" | "ko" | "delta" | "empty";

export const STATUS_META: Record<StatusCode, { symbol: string; label: string; tone: string }> = {
  triangle: { symbol: "▲", label: "Target defined — sample validation pending", tone: "warning" },
  ok: { symbol: "O", label: "OK on mockup", tone: "success" },
  ko: { symbol: "X", label: "KO — new presentation required", tone: "danger" },
  delta: { symbol: "Δ", label: "Target defined — GoProd validation pending", tone: "pending" },
  empty: { symbol: "—", label: "Not evaluated", tone: "muted" },
};

export type Comment = { id: string; author: string; at: string; body: string };

export type CheckRow = {
  id: string;
  index: string;
  label: string;
  status: StatusCode;
  note?: string;
  updatedBy?: string;
  updatedAt?: string;
  comments: Comment[];
  subRows?: CheckRow[];
};

export type Product = {
  id: string;
  name: string;
  sku: string;
  collection: string;
  site: "ARCO" | "MLM" | "FLR";
  category: "Bags" | "Ready-to-Wear" | "Accessories";
  designer: string;
  createdAt: string;
  goStyle: "GO" | "PENDING" | "KO";
  goSolidity: "GO" | "PENDING" | "KO";
  cover: string;
  rows: CheckRow[];
};

const C = (author: string, body: string, at: string): Comment => ({
  id: crypto.randomUUID(),
  author,
  at,
  body,
});

export const PRODUCTS: Product[] = [
  {
    id: "p-136511",
    name: "Jacquard Peuplier",
    sku: "136511",
    collection: "26Q3",
    site: "ARCO",
    category: "Bags",
    designer: "Richard Allègre",
    createdAt: "2026-04-12",
    goStyle: "PENDING",
    goSolidity: "PENDING",
    cover:
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80",
    rows: [
      {
        id: "r1",
        index: "1",
        label: "Dimensional",
        status: "ok",
        note: "H 24 × L 32 × D 12 cm — within target",
        updatedBy: "M. Conti",
        updatedAt: "2 days ago",
        comments: [C("M. Conti", "Validated against the original toile.", "2d")],
      },
      {
        id: "r2",
        index: "2",
        label: "Construction",
        status: "triangle",
        note: "Edge bevel under review",
        updatedBy: "A. Rossi",
        updatedAt: "1 day ago",
        comments: [C("A. Rossi", "Awaiting second prototype from ARCO.", "1d")],
      },
      {
        id: "r3",
        index: "3",
        label: "Main",
        status: "triangle",
        comments: [],
        subRows: [
          {
            id: "r3a",
            index: "3.1",
            label: "Main SAC",
            status: "ok",
            note: "Jacquard tension correct",
            comments: [C("Studio", "Beautiful drape on the body.", "3d")],
          },
          {
            id: "r3b",
            index: "3.2",
            label: "Main POCHETTE",
            status: "ko",
            note: "Pattern misalignment at the flap",
            comments: [
              C("R. Allègre", "Pattern shifted 4mm at the flap seam — redo.", "5h"),
            ],
          },
        ],
      },
      {
        id: "r4",
        index: "4",
        label: "Lining (Doublure)",
        status: "ko",
        note: "Needs 2cm additional allowance",
        updatedBy: "R. Allègre",
        updatedAt: "5h ago",
        comments: [C("R. Allègre", "Lining needs 2cm more allowance.", "5h")],
      },
      {
        id: "r5",
        index: "5",
        label: "Metal Pieces (PMET)",
        status: "delta",
        note: "Brass finish locked — awaiting GoProd",
        comments: [],
      },
      {
        id: "r6",
        index: "6",
        label: "Threads (Fils)",
        status: "ok",
        note: "Gütermann 1024 — matched",
        comments: [],
      },
    ],
  },
  {
    id: "p-141207",
    name: "Velours Aurore",
    sku: "141207",
    collection: "26Q4",
    site: "MLM",
    category: "Bags",
    designer: "Inès Marchetti",
    createdAt: "2026-05-02",
    goStyle: "GO",
    goSolidity: "PENDING",
    cover:
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=80",
    rows: [
      { id: "r1", index: "1", label: "Dimensional", status: "ok", comments: [] },
      { id: "r2", index: "2", label: "Construction", status: "ok", comments: [] },
      {
        id: "r3",
        index: "3",
        label: "Main",
        status: "ok",
        comments: [],
        subRows: [
          { id: "r3a", index: "3.1", label: "Main SAC", status: "ok", comments: [] },
          { id: "r3b", index: "3.2", label: "Main POCHETTE", status: "ok", comments: [] },
        ],
      },
      { id: "r4", index: "4", label: "Lining (Doublure)", status: "delta", comments: [] },
      { id: "r5", index: "5", label: "Metal Pieces (PMET)", status: "ok", comments: [] },
      { id: "r6", index: "6", label: "Threads (Fils)", status: "triangle", comments: [] },
    ],
  },
  {
    id: "p-128840",
    name: "Manteau Sénéque",
    sku: "128840",
    collection: "26Q3",
    site: "FLR",
    category: "Ready-to-Wear",
    designer: "Léa Vautrin",
    createdAt: "2026-03-21",
    goStyle: "KO",
    goSolidity: "KO",
    cover:
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=900&q=80",
    rows: [
      { id: "r1", index: "1", label: "Dimensional", status: "triangle", comments: [] },
      { id: "r2", index: "2", label: "Construction", status: "ko", note: "Shoulder pitch off by 6mm", comments: [] },
      {
        id: "r3",
        index: "3",
        label: "Main",
        status: "ko",
        comments: [],
        subRows: [
          { id: "r3a", index: "3.1", label: "Main SAC", status: "empty", comments: [] },
          { id: "r3b", index: "3.2", label: "Main POCHETTE", status: "ko", comments: [] },
        ],
      },
      { id: "r4", index: "4", label: "Lining (Doublure)", status: "triangle", comments: [] },
      { id: "r5", index: "5", label: "Metal Pieces (PMET)", status: "delta", comments: [] },
      { id: "r6", index: "6", label: "Threads (Fils)", status: "ok", comments: [] },
    ],
  },
];

export const ACTIVITY = [
  { at: "5 min ago", who: "Richard Allègre", what: "updated Lining status", target: "SKU 136511 — Jacquard Peuplier" },
  { at: "1 h ago", who: "M. Conti", what: "validated Dimensional checkpoint", target: "SKU 136511" },
  { at: "3 h ago", who: "Inès Marchetti", what: "marked GO STYLE", target: "SKU 141207 — Velours Aurore" },
  { at: "Yesterday", who: "Atelier ARCO", what: "uploaded a new prototype scan", target: "SKU 136511" },
  { at: "Yesterday", who: "Léa Vautrin", what: "flagged Construction as KO", target: "SKU 128840 — Manteau Sénéque" },
  { at: "2 days ago", who: "Studio", what: "initialized new product", target: "SKU 141207" },
];

export const WEATHER = [
  { axis: "Quality", level: "amber" as const, note: "1 product with active KO checkpoint" },
  { axis: "Time To Market", level: "green" as const, note: "Within Q3 launch window" },
  { axis: "Margin", level: "green" as const, note: "Cost targets locked" },
  { axis: "Feasibility", level: "red" as const, note: "Manteau Sénéque shoulder pattern" },
];

export function getProduct(id: string) {
  return PRODUCTS.find((p) => p.id === id);
}
