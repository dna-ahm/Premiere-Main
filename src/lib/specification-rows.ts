import type { CheckRow } from "@/lib/mock-data";

export const SPECIFICATION_CHECKPOINTS = [
  "Dimensionnel",
  "Construction",
  "Main SAC",
  "Main POCHETTE",
  "Cadrage EXTERIEUR SAC",
  "CADRAGE POCHETTE",
  "Cadrage DOUBLURE",
  "Corps",
  "Fond",
  "PORTE ADRESSE",
  "POIGNEE TRESSEE",
  "Doublure",
  "Made in SAC",
  "MADE IN POCHETTE",
  "PMET",
  "Fils",
  "Coloration",
  "Autre composants (patte épaule, porte-adresse, cloche-clés, dragonne etc.)",
] as const;

const CHECKPOINT_ALIASES: Record<(typeof SPECIFICATION_CHECKPOINTS)[number], string[]> = {
  Dimensionnel: ["Dimensionnel", "Dimensional"],
  Construction: ["Construction"],
  "Main SAC": ["Main SAC"],
  "Main POCHETTE": ["Main POCHETTE"],
  "Cadrage EXTERIEUR SAC": ["Cadrage EXTERIEUR SAC"],
  "CADRAGE POCHETTE": ["CADRAGE POCHETTE"],
  "Cadrage DOUBLURE": ["Cadrage DOUBLURE"],
  Corps: ["Corps"],
  Fond: ["Fond"],
  "PORTE ADRESSE": ["PORTE ADRESSE", "Porte adresse"],
  "POIGNEE TRESSEE": ["POIGNEE TRESSEE", "Poignée tressée"],
  Doublure: ["Doublure", "Lining (Doublure)"],
  "Made in SAC": ["Made in SAC"],
  "MADE IN POCHETTE": ["MADE IN POCHETTE"],
  PMET: ["PMET", "Metal Pieces (PMET)"],
  Fils: ["Fils", "Threads (Fils)"],
  Coloration: ["Coloration"],
  "Autre composants (patte épaule, porte-adresse, cloche-clés, dragonne etc.)": [
    "Autre composants (patte épaule, porte-adresse, cloche-clés, dragonne etc.)",
  ],
};

/** Atelier photos — assigned to a subset of checkpoints only */
const CHECKPOINT_MEDIA: Partial<Record<(typeof SPECIFICATION_CHECKPOINTS)[number], string>> = {
  "Main SAC": "/media/checkpoints/cadrage-exterieur-2.png",
  "Main POCHETTE": "/media/checkpoints/cadrage-pochette-2.png",
  "Cadrage EXTERIEUR SAC": "/media/checkpoints/cadrage-exterieur-1.png",
  "CADRAGE POCHETTE": "/media/checkpoints/cadrage-pochette-1.png",
  "Cadrage DOUBLURE": "/media/checkpoints/cadrage-doublure.png",
  Doublure: "/media/checkpoints/cadrage-doublure-1.png",
};

function productRowLookup(rows: CheckRow[]) {
  const lookup = new Map<string, CheckRow>();
  const add = (row: CheckRow) => lookup.set(row.label.trim().toLowerCase(), row);
  for (const row of rows) {
    add(row);
    row.subRows?.forEach(add);
  }
  return lookup;
}

export function createSpecificationRows(productRows: CheckRow[]): CheckRow[] {
  const lookup = productRowLookup(productRows);
  return SPECIFICATION_CHECKPOINTS.map((label, index) => {
    const aliases = CHECKPOINT_ALIASES[label];
    const match = aliases
      .map((alias) => lookup.get(alias.trim().toLowerCase()))
      .find((row): row is CheckRow => !!row);

    return {
      id: `spec-${index + 1}`,
      index: String(index + 1),
      label,
      status: match?.status ?? "empty",
      note: match?.note,
      media: match?.media ?? CHECKPOINT_MEDIA[label],
      comments: match ? [...match.comments] : [],
    };
  });
}
