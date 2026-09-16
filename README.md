# Premiere Main

**Collection Development PLM**
 built during the **IFM × 42** hackathon.

 > Available at: https://atelier-atelier.vercel.app

Premiere Main is a product-lifecycle prototype for luxury houses. It connects the **Creative Studio** and the **Production Atelier** around a shared, visual source of truth: every prototype, every checkpoint, every GO / KO.

<img width="1294" height="767" alt="Screenshot 2026-09-16 at 23 03 01" src="https://github.com/user-attachments/assets/49f08e0b-15bc-47a8-9e43-24b64d90a8cf" />



The interface is designed like a quiet operations desk — precise, editorial, and fast to scan — so management can see what is blocked, who owns it, and what happens next.

> Prototype. All product data, activity, and analytics are mocked. There is no production backend.

---

## The problem

Luxury collection development still lives in spreadsheets, emails, and photos scattered across ateliers. Status language is rich (`▲`, `O`, `X`, `Δ`) but hard to share. Studio, pattern, and factory teams do not look at the same sheet at the same time.

Premiere Main turns that atelier language into a single product workspace:

- one library of products in development
- one technical sheet per factory gate
- one status vocabulary everyone can read
- one place to comment, attach mockup photos, and unblock a KO

---

## What you can do

### Dashboard
A management overview: products in development, active KO alerts, GO Style / GO Solidity validations, an activity feed, and **project weather** (Quality, Time to Market, Margin, Feasibility).

### Product Library
Browse the collection as a visual catalog. Search by name or SKU, filter by category (Bags, Ready-to-Wear, Accessories) and factory site (`ARCO`, `MLM`, `FLR`). Each card shows GO Style and GO Solidity.

<img width="1485" height="845" alt="Screenshot 2026-09-16 at 23 06 27" src="https://github.com/user-attachments/assets/80f450be-450e-41ca-a9ad-81fda627ce4b" />

### Add Product
Two intake paths:

| Mode | What it does |
| --- | --- |
| **AI Scan** | Simulated drop of an atelier spreadsheet (`.xlsx`, `.pdf`, `.csv`). Extraction is mocked, then a Smart Table is shown for review before opening the product. |
| **Manual Form** | Name, SKU / PDM ID, and factory site. Initializes a technical table. |

### Product sheet
Cover, metadata (designer, collection, factory), and two workspaces:

1. **Version Tracking & Approvals** — three sequential gates (Studio → Development → Production), overall status, and a chronological changelog.
2. **Product Analytics & Live Data** — quality / TTM / margin / feasibility widgets, a live atelier feed, and phase timing.

<img width="1209" height="768" alt="Screenshot 2026-09-16 at 23 11 47" src="https://github.com/user-attachments/assets/0887f377-63f3-4ba4-a853-7dfd347cc618" />


### Technical specifications
Each gate opens a department-level Smart Table with **18 atelier checkpoints** (dimensional, construction, cadrage, lining, PMET, threads, coloration, and more). You can:

- update checkpoint status
- attach / zoom mockup photos
- comment with Studio and Atelier on a given row
- review **Mockup Analysis n°1 / n°2 / n°3** side by side

### Analytics
Collection-wide readiness: checkpoint distribution, stacked status by collection, and a list of blocking KO issues with a jump to the product.
<img width="1318" height="780" alt="Screenshot 2026-09-16 at 23 09 04" src="https://github.com/user-attachments/assets/4d8e43cb-3af5-45f3-bc89-9682d7e0f1ef" />


## Status language

Premiere Main keeps the atelier codes instead of flattening them into generic tags.

| Code | Symbol | Meaning |
| --- | --- | --- |
| `triangle` | ▲ | Target defined — sample validation pending |
| `ok` | O | OK on mockup |
| `ko` | X | KO — new presentation required |
| `delta` | Δ | Target defined — GoProd validation pending |
| `empty` | — | Not evaluated |

Product-level gates use **GO Style** and **GO Solidity**: `GO` · `PENDING` · `KO`.

Approval workflow:

```
Studio (Creative) → Development (Pattern & Mockup) → Production (Industrialization)
```

A later gate stays **locked** until the previous one is approved. A KO on Style or Solidity blocks the timeline.

---

## App map

| Route | Page |
| --- | --- |
| `/` | Dashboard |
| `/library` | Product Library |
| `/add` | Add Product (AI scan or manual) |
| `/analytics` | Readiness & risk |
| `/product/$id` | Product sheet |
| `/product/$id/specifications/$gateId` | Gate specs (`studio` · `development` · `production`) |

Sample products in the mock catalog:

| Product | SKU | Category | Site |
| --- | --- | --- | --- |
| Jacquard Peuplier | 136511 | Bags | ARCO |
| Velours Aurore | 141207 | Bags | MLM |
| Manteau Sénéque | 128840 | Ready-to-Wear | FLR |

---

## Stack

| Layer | Choice |
| --- | --- |
| Framework | [TanStack Start](https://tanstack.com/start) (SSR) |
| UI | React 19, file-based [TanStack Router](https://tanstack.com/router) |
| Styling | Tailwind CSS 4, Radix UI primitives |
| Charts | Recharts |
| Validation | Zod |
| Language | TypeScript (strict) |
| Bundler | Vite 8 |
| Deploy | Vercel (`nitro` preset) |

Node **20+** is required.

---

## Getting started

```bash
git clone https://github.com/dna-ahm/atelier-atelier.git
cd atelier-atelier
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or the port printed by Vite).

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Local development server |
| `npm run build` | Production build |
| `npm run preview` | Preview the production build |
| `npm start` | Serve the built Nitro output (`.output/server/index.mjs`) |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

Environment variables are optional for this prototype. See `.env.example` if you later wire a real API.

---

## Project structure

```
src/
  routes/                 # File-based routes (TanStack Router)
    index.tsx             # Dashboard
    library.tsx
    add.tsx
    analytics.tsx
    product.$id.tsx
    product.$id.index.tsx
    product.$id.specifications.$gateId.tsx
  components/
    layout/nav.tsx        # Header + footer
    smart-table.tsx       # Checkpoint table
    status-badge.tsx      # ▲ O X Δ pills and GO badges
    ui/                   # Radix / shadcn primitives
  lib/
    mock-data.ts          # Products, activity, weather
    specification-rows.ts # 18-checkpoint atelier sheet
  styles.css              # Design tokens
public/
  products/               # Product covers
  media/checkpoints/      # Mockup photos
```

`src/routeTree.gen.ts` is generated. Do not edit it by hand.

---

## Data model (prototype)

Products live in `src/lib/mock-data.ts`. Each product has nested **checkpoint rows** (optional sub-rows), comments, media, and GO flags.

Specification pages expand those rows onto a canonical atelier checklist via `createSpecificationRows()` in `src/lib/specification-rows.ts`. Aliases map English labels (e.g. *Dimensional*) to atelier French (*Dimensionnel*).

State changes (status, comments) are in-memory for the session. Reloading the page restores mock data.

---

## Design

Editorial luxury × operations:

- Inter + JetBrains Mono
- Hairline borders, serif-scale titles, tight tracking labels
- Lime (`#7BC832`) as the primary action / GO color
- Semantic tones for warning, danger, and pending GoProd

The visual language is meant to feel like a maison tool, not a generic SaaS dashboard.

---

## Deployment

Configured for Vercel (`vercel.json`, Nitro `vercel` preset):

```bash
npm run build
```

Push to the connected GitHub remote to trigger a deploy, or use the Vercel CLI.

---

## Hackathon context

Built at the **IFM × 42** hackathon: fashion-school domain knowledge (collection development, atelier checkpoints, GO Style / GO Solidity) paired with an engineering prototype that can be demoed end to end in a browser.

**v0.1** — demo-ready. Next steps if this were taken further: persist products, real spreadsheet / PDF extraction, auth by role (Studio vs Atelier vs Management), and live factory events instead of mocked feeds.

---

## License

Private hackathon prototype. Not an official Premiere Main / maison product.
