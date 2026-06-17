import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SmartTable } from "@/components/smart-table";
import { Nav, Footer } from "@/components/layout/nav";
import { PRODUCTS } from "@/lib/mock-data";
import { createSpecificationRows } from "@/lib/specification-rows";

export const Route = createFileRoute("/add")({
  head: () => ({
    meta: [
      { title: "Add Product — Premiere Main" },
      { name: "description", content: "Create a new product via AI scan or manual entry." },
    ],
  }),
  component: AddProduct,
});

function AddProduct() {
  const navigate = useNavigate();
  const product = PRODUCTS[0];
  const [tab, setTab] = useState<"scan" | "manual">("scan");
  const [scanning, setScanning] = useState<"idle" | "loading" | "done">("idle");
  const [showValidation, setShowValidation] = useState(false);
  const [form, setForm] = useState({ name: "", sku: "", site: "ARCO" });

  const scannedRows = useMemo(
    () => createSpecificationRows(product.rows),
    [product.rows],
  );

  const simulate = () => {
    setScanning("loading");
    setTimeout(() => {
      setScanning("done");
      setShowValidation(true);
    }, 1600);
  };

  const closeValidation = () => {
    setShowValidation(false);
    setScanning("idle");
  };

  const validateAndRedirect = () => {
    setShowValidation(false);
    navigate({ to: "/product/$id", params: { id: product.id } });
  };

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="mx-auto max-w-[1100px] px-8 py-14">
        <div className="border-b hairline pb-8">
          <div className="tracking-luxury text-[10px] text-muted-foreground">New entry</div>
          <h1 className="mt-2 font-serif text-5xl">Initiate a product</h1>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">
            Scan an atelier spreadsheet to auto-fill the technical sheet, or compose it manually.
          </p>
        </div>

        <div className="mt-8 flex gap-1 border hairline w-fit">
          {(["scan", "manual"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-2.5 text-[11px] tracking-luxury ${
                tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              {t === "scan" ? "AI Scan" : "Manual Form"}
            </button>
          ))}
        </div>

        {tab === "scan" ? (
          <div className="mt-10 border hairline bg-card">
            <div className="grid place-items-center border-b hairline py-20 text-center">
              <div className="max-w-md px-8">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border hairline font-serif text-2xl">
                  ↑
                </div>
                <h3 className="mt-6 font-serif text-3xl">Drop atelier spreadsheet</h3>
                <p className="mt-3 text-sm text-muted-foreground">
                  .xlsx, .pdf or .csv — our AI extracts metadata, checkpoints and statuses
                  automatically.
                </p>
                <button
                  onClick={simulate}
                  disabled={scanning !== "idle"}
                  className="mt-8 rounded-sm bg-primary px-6 py-3 text-[11px] tracking-luxury text-primary-foreground transition-opacity disabled:opacity-60"
                >
                  {scanning === "idle"
                    ? "Simulate Scan"
                    : scanning === "loading"
                      ? "Reading spreadsheet…"
                      : "Scan complete — review below"}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-3 divide-x hairline text-center text-[11px]">
              {["Extracts SKU & collection", "Parses 6 atelier checkpoints", "Builds the Smart Table"].map(
                (s) => (
                  <div key={s} className="p-6 text-muted-foreground">
                    {s}
                  </div>
                ),
              )}
            </div>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              navigate({ to: "/product/$id", params: { id: PRODUCTS[0].id } });
            }}
            className="mt-10 grid gap-6 border hairline bg-card p-10"
          >
            <Field label="Product name" placeholder="e.g. Jacquard Peuplier">
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border-b hairline bg-transparent py-2 text-lg focus:border-foreground focus:outline-none"
              />
            </Field>
            <Field label="SKU / PDM ID" placeholder="e.g. 136511">
              <input
                required
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                className="w-full border-b hairline bg-transparent py-2 font-mono text-lg focus:border-foreground focus:outline-none"
              />
            </Field>
            <Field label="Factory site">
              <select
                value={form.site}
                onChange={(e) => setForm({ ...form, site: e.target.value })}
                className="w-full border-b hairline bg-transparent py-2 text-lg focus:border-foreground focus:outline-none"
              >
                <option>ARCO</option>
                <option>MLM</option>
                <option>FLR</option>
              </select>
            </Field>
            <button
              type="submit"
              className="mt-4 w-fit rounded-sm bg-primary px-6 py-3 text-[11px] tracking-luxury text-primary-foreground"
            >
              Initialize Technical Table →
            </button>
          </form>
        )}
      </main>
      <Footer />

      {showValidation && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={closeValidation}
            aria-label="Close"
          />
          <div className="absolute inset-4 flex flex-col overflow-hidden border hairline bg-background shadow-2xl sm:inset-8 md:inset-12">
            <div className="flex shrink-0 items-start justify-between gap-4 border-b hairline p-6">
              <div>
                <div className="tracking-luxury text-[10px] text-muted-foreground">AI extraction</div>
                <h2 className="mt-1 font-serif text-3xl">Validate extracted data</h2>
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                  Review the smart table generated from the spreadsheet before creating the product
                  technical sheet.
                </p>
              </div>
              <button
                type="button"
                onClick={closeValidation}
                className="text-xl text-muted-foreground hover:text-foreground"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              <SmartTable rows={scannedRows} readOnly />
            </div>

            <div className="flex shrink-0 items-center justify-end gap-3 border-t hairline p-6">
              <button
                type="button"
                onClick={closeValidation}
                className="rounded-sm border hairline px-6 py-3 text-[11px] tracking-luxury text-muted-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={validateAndRedirect}
                className="rounded-sm bg-primary px-6 py-3 text-[11px] tracking-luxury text-primary-foreground"
              >
                Validate & open product →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  placeholder,
  children,
}: {
  label: string;
  placeholder?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="tracking-luxury text-[10px] text-muted-foreground">{label}</div>
      {children}
      {placeholder && (
        <div className="mt-1 text-[11px] text-muted-foreground">{placeholder}</div>
      )}
    </label>
  );
}
