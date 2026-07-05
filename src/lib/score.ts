// Shared scoring logic — used by CalculatorTool and admin product save

export const FIBERS = [
  { label: "Linen EU",               value: "linen-eu",       breathability: 9, clean: 9 },
  { label: "Linen (unknown origin)", value: "linen-unknown",  breathability: 8, clean: 7 },
  { label: "Cotton organic",         value: "cotton-organic", breathability: 8, clean: 9 },
  { label: "Cotton conventional",    value: "cotton-conv",    breathability: 7, clean: 5 },
  { label: "Silk mulberry",          value: "silk-mulberry",  breathability: 9, clean: 8 },
  { label: "Silk (generic)",         value: "silk-generic",   breathability: 8, clean: 7 },
  { label: "TENCEL Lyocell",         value: "tencel",         breathability: 7, clean: 8 },
  { label: "Hemp",                   value: "hemp",           breathability: 8, clean: 9 },
  { label: "Polyester",              value: "polyester",      breathability: 2, clean: 2 },
  { label: "Nylon",                  value: "nylon",          breathability: 2, clean: 2 },
  { label: "Viscose",                value: "viscose",        breathability: 4, clean: 4 },
  { label: "Wool merino",            value: "wool-merino",    breathability: 7, clean: 7 },
  { label: "Wool (generic)",         value: "wool-generic",   breathability: 6, clean: 6 },
  { label: "Elastane",               value: "elastane",       breathability: 1, clean: 2 },
] as const;

export type FiberValue = (typeof FIBERS)[number]["value"];
export type TransparencyValue = "disclosed" | "partial" | "not-disclosed";

export interface FiberRow {
  fiber: FiberValue | string;
  pct: number; // 0–100
}

export interface Scores {
  breathability: number;
  clean: number;
  fairPriceLow: number;
  fairPriceHigh: number;
}

function getFiberData(value: string) {
  return FIBERS.find((f) => f.value === value) ?? { breathability: 5, clean: 5 };
}

export function calcScores(
  rows: FiberRow[],
  transparency: TransparencyValue,
  price: number
): Scores {
  const total = rows.reduce((s, r) => s + r.pct, 0);
  let breathability = 0;
  let clean = 0;

  for (const row of rows) {
    const weight = total > 0 ? row.pct / total : 0;
    const fiber = getFiberData(row.fiber);
    breathability += fiber.breathability * weight;
    clean += fiber.clean * weight;
  }

  if (transparency === "disclosed") clean = Math.min(10, clean + 0.5);
  if (transparency === "not-disclosed") clean = Math.max(0, clean - 0.5);

  return {
    breathability: Math.round(breathability * 10) / 10,
    clean: Math.round(clean * 10) / 10,
    fairPriceLow: Math.round(price * 0.3 * 100) / 100,
    fairPriceHigh: Math.round(price * 0.45 * 100) / 100,
  };
}

// Map a fibre name string from the scraper to the closest FIBER value key
export function matchFiber(name: string): FiberValue {
  const n = name.toLowerCase();
  if (n.includes("linen")) return n.includes("eu") || n.includes("europ") ? "linen-eu" : "linen-unknown";
  if (n.includes("organic") && n.includes("cotton")) return "cotton-organic";
  if (n.includes("cotton")) return "cotton-conv";
  if (n.includes("mulberry") && n.includes("silk")) return "silk-mulberry";
  if (n.includes("silk")) return "silk-generic";
  if (n.includes("tencel") || n.includes("lyocell")) return "tencel";
  if (n.includes("hemp")) return "hemp";
  if (n.includes("polyester")) return "polyester";
  if (n.includes("nylon") || n.includes("polyamide")) return "nylon";
  if (n.includes("viscose") || n.includes("rayon")) return "viscose";
  if (n.includes("merino")) return "wool-merino";
  if (n.includes("wool")) return "wool-generic";
  if (n.includes("elastane") || n.includes("spandex") || n.includes("lycra")) return "elastane";
  return "cotton-conv"; // fallback
}
