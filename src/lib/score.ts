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

// ── Manufacturing location ────────────────────────────────────────────────────

// Wage multiplier: how much of retail price should cover manufacturing costs.
// Based on typical garment industry labour cost as % of retail (rough approximation).
// Higher wage = higher fair floor and ceiling.
export const COUNTRY_WAGE_DATA: Record<string, { label: string; multiplierLow: number; multiplierHigh: number }> = {
  china:      { label: "China",      multiplierLow: 0.22, multiplierHigh: 0.33 },
  vietnam:    { label: "Vietnam",    multiplierLow: 0.20, multiplierHigh: 0.30 },
  indonesia:  { label: "Indonesia",  multiplierLow: 0.20, multiplierHigh: 0.30 },
  india:      { label: "India",      multiplierLow: 0.20, multiplierHigh: 0.30 },
  portugal:   { label: "Portugal",   multiplierLow: 0.30, multiplierHigh: 0.45 },
  italy:      { label: "Italy",      multiplierLow: 0.38, multiplierHigh: 0.55 },
  usa:        { label: "USA",        multiplierLow: 0.40, multiplierHigh: 0.58 },
};

export const REGION_COUNTRIES: Record<string, string[]> = {
  "europe-unspecified": ["portugal", "italy"],
  "asia-unspecified":   ["china", "vietnam", "indonesia", "india"],
};

export type ManufacturingLocation =
  | keyof typeof COUNTRY_WAGE_DATA
  | "europe-unspecified"
  | "asia-unspecified"
  | "not-disclosed";

export const MANUFACTURING_OPTIONS: { value: ManufacturingLocation; label: string }[] = [
  { value: "china",               label: "China" },
  { value: "vietnam",             label: "Vietnam" },
  { value: "indonesia",           label: "Indonesia" },
  { value: "india",               label: "India" },
  { value: "portugal",            label: "Portugal" },
  { value: "italy",               label: "Italy" },
  { value: "usa",                 label: "USA" },
  { value: "europe-unspecified",  label: "Europe (unspecified)" },
  { value: "asia-unspecified",    label: "Asia (unspecified)" },
  { value: "not-disclosed",       label: "Not disclosed" },
];

export type FairPriceResult =
  | { available: false; reason: "not-disclosed" }
  | { available: true; low: number; high: number; spanningCountries: string[] | null };

export function calcFairPrice(price: number, location: ManufacturingLocation): FairPriceResult {
  if (location === "not-disclosed") {
    return { available: false, reason: "not-disclosed" };
  }

  if (location in REGION_COUNTRIES) {
    const countries = REGION_COUNTRIES[location];
    const lows = countries.map((c) => price * COUNTRY_WAGE_DATA[c].multiplierLow);
    const highs = countries.map((c) => price * COUNTRY_WAGE_DATA[c].multiplierHigh);
    return {
      available: true,
      low: Math.round(Math.min(...lows)),
      high: Math.round(Math.max(...highs)),
      spanningCountries: countries.map((c) => COUNTRY_WAGE_DATA[c].label),
    };
  }

  const country = COUNTRY_WAGE_DATA[location];
  return {
    available: true,
    low: Math.round(price * country.multiplierLow),
    high: Math.round(price * country.multiplierHigh),
    spanningCountries: null,
  };
}

// ── Breathability + clean scores ──────────────────────────────────────────────

export interface Scores {
  breathability: number;
  clean: number;
  fairPriceLow: number | null;
  fairPriceHigh: number | null;
  fairPriceSpanningCountries: string[] | null;
  fairPriceUnavailable: boolean;
}

function getFiberData(value: string) {
  return FIBERS.find((f) => f.value === value) ?? { breathability: 5, clean: 5 };
}

export function calcScores(
  rows: FiberRow[],
  transparency: TransparencyValue,
  price: number,
  location: ManufacturingLocation = "not-disclosed"
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

  const fp = calcFairPrice(price, location);

  return {
    breathability: Math.round(breathability * 10) / 10,
    clean: Math.round(clean * 10) / 10,
    fairPriceLow: fp.available ? fp.low : null,
    fairPriceHigh: fp.available ? fp.high : null,
    fairPriceSpanningCountries: fp.available ? fp.spanningCountries : null,
    fairPriceUnavailable: !fp.available,
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
  return "cotton-conv";
}
