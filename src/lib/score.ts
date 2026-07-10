// Shared scoring logic — used by CalculatorTool and admin product save

// ── Fibre data ────────────────────────────────────────────────────────────────

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

// APPROXIMATE wholesale fabric cost per metre (EUR).
// These are mid-market estimates for woven/knit fabric at small-brand MOQ.
// Actual costs vary by mill, finish, weight, and order volume.
export const FIBRE_COST_PER_METRE: Record<string, number> = {
  "linen-eu":       12,
  "linen-unknown":   8,
  "cotton-organic":  8,
  "cotton-conv":     5,
  "silk-mulberry":  38,
  "silk-generic":   26,
  "tencel":          9,
  "hemp":           10,
  "polyester":       3,
  "nylon":           5,
  "viscose":         5,
  "wool-merino":    24,
  "wool-generic":   14,
  "elastane":        8,
};

// ── Garment types ─────────────────────────────────────────────────────────────

// APPROXIMATE per-garment estimates for fabric yardage (metres) and
// construction labour (hours). Derived from industry-standard cut-make-trim
// benchmarks for mid-complexity garments. Real values vary by silhouette,
// lining, finishing detail, and factory efficiency — treat as ballpark only.
export const GARMENT_TYPES = {
  "top":       { label: "Top / Shirt",         fabricMetres: 1.5, labourHours: 1.5 },
  "pants":     { label: "Pants / Shorts",       fabricMetres: 1.8, labourHours: 2.0 },
  "skirt":     { label: "Skirt",                fabricMetres: 1.5, labourHours: 1.5 },
  "dress":     { label: "Dress",                fabricMetres: 2.5, labourHours: 2.5 },
  "outerwear": { label: "Jacket / Outerwear",   fabricMetres: 3.5, labourHours: 5.0 },
  "knitwear":  { label: "Knitwear / Sweater",   fabricMetres: 1.2, labourHours: 2.0 },
} as const;

export type GarmentType = keyof typeof GARMENT_TYPES;

export const GARMENT_OPTIONS = Object.entries(GARMENT_TYPES).map(([value, { label }]) => ({
  value: value as GarmentType,
  label,
}));

// ── Manufacturing location ────────────────────────────────────────────────────

// APPROXIMATE garment-worker hourly wages (EUR) based on published minimum
// wage and living-wage survey data. Real wages vary by factory, region within
// country, and whether overtime applies.
export const COUNTRY_WAGE_DATA: Record<string, { label: string; hourlyWage: number }> = {
  china:     { label: "China",    hourlyWage: 3.5  },
  vietnam:   { label: "Vietnam",  hourlyWage: 2.5  },
  indonesia: { label: "Indonesia",hourlyWage: 2.0  },
  india:     { label: "India",    hourlyWage: 2.0  },
  portugal:  { label: "Portugal", hourlyWage: 6.0  },
  italy:     { label: "Italy",    hourlyWage: 14.0 },
  usa:       { label: "USA",      hourlyWage: 18.0 },
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
  { value: "china",              label: "China" },
  { value: "vietnam",            label: "Vietnam" },
  { value: "indonesia",          label: "Indonesia" },
  { value: "india",              label: "India" },
  { value: "portugal",           label: "Portugal" },
  { value: "italy",              label: "Italy" },
  { value: "usa",                label: "USA" },
  { value: "europe-unspecified", label: "Europe (unspecified)" },
  { value: "asia-unspecified",   label: "Asia (unspecified)" },
  { value: "not-disclosed",      label: "Not disclosed" },
];

// ── COGS-based fair price calculation ─────────────────────────────────────────
//
// fabric_cost = fabric_yardage × weighted_cost_per_metre (by fibre %)
// labour_cost = labour_hours × hourly_wage
// COGS        = fabric_cost + labour_cost
// fair_low    = COGS ÷ (1 − 0.55)   → implies 55% gross margin (mid brand)
// fair_high   = COGS ÷ (1 − 0.70)   → implies 70% gross margin (premium brand)
//
// For unspecified regions: span from cheapest-country fair_low to
// most-expensive-country fair_high.

function weightedCostPerMetre(rows: FiberRow[]): number {
  const total = rows.reduce((s, r) => s + r.pct, 0);
  if (total === 0) return FIBRE_COST_PER_METRE["cotton-conv"];
  let cost = 0;
  for (const row of rows) {
    const unitCost = FIBRE_COST_PER_METRE[row.fiber] ?? FIBRE_COST_PER_METRE["cotton-conv"];
    cost += unitCost * (row.pct / total);
  }
  return cost;
}

function cogsForWage(
  fabricMetres: number,
  costPerMetre: number,
  labourHours: number,
  hourlyWage: number
): number {
  return fabricMetres * costPerMetre + labourHours * hourlyWage;
}

function fairRangeFromCogs(cogs: number): { low: number; high: number } {
  return {
    low:  Math.round(cogs / (1 - 0.55)),
    high: Math.round(cogs / (1 - 0.70)),
  };
}

export type FairPriceResult =
  | { available: false; reason: "not-disclosed" }
  | { available: true; low: number; high: number; spanningCountries: string[] | null };

export function calcFairPrice(
  rows: FiberRow[],
  garmentType: GarmentType,
  location: ManufacturingLocation
): FairPriceResult {
  if (location === "not-disclosed") {
    return { available: false, reason: "not-disclosed" };
  }

  const { fabricMetres, labourHours } = GARMENT_TYPES[garmentType];
  const costPerMetre = weightedCostPerMetre(rows);

  if (location in REGION_COUNTRIES) {
    const countries = REGION_COUNTRIES[location];
    const ranges = countries.map((c) => {
      const cogs = cogsForWage(fabricMetres, costPerMetre, labourHours, COUNTRY_WAGE_DATA[c].hourlyWage);
      return fairRangeFromCogs(cogs);
    });
    return {
      available: true,
      low:  Math.min(...ranges.map((r) => r.low)),
      high: Math.max(...ranges.map((r) => r.high)),
      spanningCountries: countries.map((c) => COUNTRY_WAGE_DATA[c].label),
    };
  }

  const wage = COUNTRY_WAGE_DATA[location].hourlyWage;
  const cogs = cogsForWage(fabricMetres, costPerMetre, labourHours, wage);
  return {
    available: true,
    ...fairRangeFromCogs(cogs),
    spanningCountries: null,
  };
}

// ── Combined score entry point ────────────────────────────────────────────────

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
  garmentType: GarmentType,
  location: ManufacturingLocation
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

  if (transparency === "disclosed")     clean = Math.min(10, clean + 0.5);
  if (transparency === "not-disclosed") clean = Math.max(0,  clean - 0.5);

  const fp = calcFairPrice(rows, garmentType, location);

  return {
    breathability: Math.round(breathability * 10) / 10,
    clean:         Math.round(clean         * 10) / 10,
    fairPriceLow:             fp.available ? fp.low  : null,
    fairPriceHigh:            fp.available ? fp.high : null,
    fairPriceSpanningCountries: fp.available ? fp.spanningCountries : null,
    fairPriceUnavailable:     !fp.available,
  };
}

// ── Fibre name → value matcher (used by scraper) ──────────────────────────────

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
