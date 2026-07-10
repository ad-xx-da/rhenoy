"use client";

import { useState } from "react";
import Image from "next/image";
import {
  calcScores,
  matchFiber,
  FIBERS,
  GARMENT_OPTIONS,
  MANUFACTURING_OPTIONS,
  type TransparencyValue,
  type ManufacturingLocation,
  type GarmentType,
  type FiberRow,
} from "@/lib/score";

// ── Types ────────────────────────────────────────────────────────────────────

type ScrapeResult = {
  productName: string | null;
  brand: string | null;
  fibres: { name: string; percentage: number }[] | null;
  price: number | null;
  currency: string | null;
  dataCompleteness: number | null;
  garmentType: string | null;
  imageUrl: string | null;
  hostedImageUrl: string | null;
};

type EditableProduct = {
  url: string;
  brand: string;
  product_name: string;
  fibre_composition: FiberRow[];
  // null means "not yet filled in — needs manual review"
  price: number | null;
  garment_type: GarmentType | null;
  fair_price_low: number | null;
  fair_price_high: number | null;
  fair_price_spanning_countries: string[] | null;
  manufacturing_location: ManufacturingLocation;
  breathability_score: number | null;
  clean_score: number | null;
  factory_transparency: TransparencyValue;
  data_completeness: number | null;
  image_url: string | null;
};

// ── Score computation (only when inputs are complete) ─────────────────────────
// Returns null for any score that can't be computed due to missing inputs.
// Downstream: we show a "needs review" warning instead of running on nulls.

function tryCalcScores(p: EditableProduct): Pick<
  EditableProduct,
  "breathability_score" | "clean_score" | "fair_price_low" | "fair_price_high" | "fair_price_spanning_countries"
> {
  const fibresReady = p.fibre_composition.length > 0 &&
    p.fibre_composition.every((r) => r.pct > 0) &&
    p.fibre_composition.reduce((s, r) => s + r.pct, 0) > 0;

  if (!fibresReady || !p.garment_type) {
    return {
      breathability_score: null,
      clean_score: null,
      fair_price_low: null,
      fair_price_high: null,
      fair_price_spanning_countries: null,
    };
  }

  const scores = calcScores(
    p.fibre_composition,
    p.factory_transparency,
    p.garment_type as GarmentType,
    p.manufacturing_location
  );

  // Fair price needs manufacturing location — calcScores handles not-disclosed → null
  return {
    breathability_score: scores.breathability,
    clean_score: scores.clean,
    fair_price_low: scores.fairPriceLow,
    fair_price_high: scores.fairPriceHigh,
    fair_price_spanning_countries: scores.fairPriceSpanningCountries,
  };
}

// ── Build form state from scrape result ───────────────────────────────────────

const GARMENT_TYPE_MAP: Record<string, GarmentType> = {
  top: "top", shirt: "top", blouse: "top", tshirt: "top", "t-shirt": "top",
  halter: "top", neckholder: "top", crop: "top",
  pants: "pants", shorts: "pants", trousers: "pants", jeans: "pants",
  skirt: "skirt",
  dress: "dress", jumpsuit: "dress", romper: "dress",
  outerwear: "outerwear", jacket: "outerwear", coat: "outerwear", blazer: "outerwear",
  knitwear: "knitwear", sweater: "knitwear", knit: "knitwear", cardigan: "knitwear",
};

function matchGarmentType(raw: string | null): GarmentType | null {
  if (!raw) return null;
  const key = raw.toLowerCase().trim();
  return GARMENT_TYPE_MAP[key] ?? null;
}

function buildEditable(url: string, raw: ScrapeResult): EditableProduct {
  const fibreRows: FiberRow[] = (raw.fibres ?? []).map((f) => ({
    fiber: matchFiber(f.name),
    // null percentage from scraper → 0 so the row shows but flags as needing review
    pct: f.percentage ?? 0,
  }));

  const base: EditableProduct = {
    url,
    brand: raw.brand ?? "",
    product_name: raw.productName ?? "",
    fibre_composition: fibreRows,
    price: raw.price ?? null,           // null = scraper didn't find it
    garment_type: matchGarmentType(raw.garmentType),
    fair_price_low: null,
    fair_price_high: null,
    fair_price_spanning_countries: null,
    manufacturing_location: "not-disclosed",
    breathability_score: null,
    clean_score: null,
    factory_transparency: "partial",
    data_completeness: raw.dataCompleteness ?? null,
    image_url: raw.hostedImageUrl ?? null,
  };

  return { ...base, ...tryCalcScores(base) };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function Field({
  label,
  missing,
  children,
}: {
  label: string;
  missing?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-center gap-2 text-[10px] tracking-[0.25em] uppercase text-charcoal/50 mb-1">
        {label}
        {missing && (
          <span className="text-[9px] tracking-widest uppercase" style={{ color: "#E8C8BE" }}>
            needs review
          </span>
        )}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full bg-cream border border-[#C8BFB0] text-charcoal text-[13px] px-3 py-2 focus:outline-none focus:border-charcoal/40 transition-colors";

const missingInputCls =
  "w-full bg-cream border text-charcoal text-[13px] px-3 py-2 focus:outline-none transition-colors border-[#E8C8BE]";

// ── Main ─────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);

  const [url, setUrl] = useState("");
  const [scraping, setScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState<string | null>(null);

  const [product, setProduct] = useState<EditableProduct | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    if (password.trim()) setAuthed(true);
  }

  async function handleScrape(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setScraping(true);
    setScrapeError(null);
    setProduct(null);
    setSaved(false);
    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail ?? data.error ?? "Scrape failed");
      setProduct(buildEditable(url.trim(), data));
    } catch (err) {
      setScrapeError(err instanceof Error ? err.message : String(err));
    } finally {
      setScraping(false);
    }
  }

  function updateProduct(patch: Partial<EditableProduct>) {
    if (!product) return;
    const next = { ...product, ...patch };
    setProduct({ ...next, ...tryCalcScores(next) });
  }

  function updateFibreRow(i: number, key: "fiber" | "pct", val: string | number) {
    if (!product) return;
    const rows = [...product.fibre_composition];
    rows[i] = { ...rows[i], [key]: key === "pct" ? Number(val) : val };
    updateProduct({ fibre_composition: rows });
  }

  function addFibreRow() {
    if (!product) return;
    updateProduct({ fibre_composition: [...product.fibre_composition, { fiber: "cotton-conv", pct: 0 }] });
  }

  function removeFibreRow(i: number) {
    if (!product) return;
    updateProduct({ fibre_composition: product.fibre_composition.filter((_, idx) => idx !== i) });
  }

  async function handleSave() {
    if (!product) return;
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-password": password },
        body: JSON.stringify(product),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      setSaved(true);
      setProduct(null);
      setUrl("");
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  // ── Auth gate ─────────────────────────────────────────────────────────────

  if (!authed) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <p
            className="font-display italic text-charcoal mb-8"
            style={{ fontSize: "1.6rem", fontWeight: 300, fontFamily: "var(--font-cormorant)" }}
          >
            Admin
          </p>
          <form onSubmit={handleAuth} className="flex flex-col gap-3">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputCls}
              autoFocus
            />
            <button
              type="submit"
              className="px-4 py-2 text-[12px] text-charcoal"
              style={{ backgroundColor: "#E8C8BE", borderRadius: 0 }}
            >
              Enter
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Main form ─────────────────────────────────────────────────────────────

  const scoresReady = product?.breathability_score != null;
        const garmentMissing = !product?.garment_type;
  const fibresTotal = product?.fibre_composition.reduce((s, r) => s + r.pct, 0) ?? 0;
  const fibresMissing = !product || product.fibre_composition.length === 0 || fibresTotal === 0;

  return (
    <div className="min-h-screen bg-cream px-6 sm:px-10 pt-24 pb-20">
      <div className="max-w-2xl mx-auto">
        <div className="mb-10" style={{ borderBottom: "1px solid #EDE8DC", paddingBottom: "1.5rem" }}>
          <p className="text-[10px] tracking-[0.3em] uppercase text-charcoal/40 mb-1">Admin</p>
          <h1
            className="font-display italic text-charcoal"
            style={{ fontSize: "2rem", fontWeight: 300, fontFamily: "var(--font-cormorant)" }}
          >
            Add a product
          </h1>
        </div>

        <form onSubmit={handleScrape} className="flex gap-2 mb-10">
          <input
            type="url"
            placeholder="Paste product URL…"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className={`${inputCls} flex-1`}
          />
          <button
            type="submit"
            disabled={scraping}
            className="px-5 py-2 text-[12px] text-charcoal disabled:opacity-40 whitespace-nowrap"
            style={{ backgroundColor: "#E8C8BE", borderRadius: 0 }}
          >
            {scraping ? "Analysing…" : "Analyse"}
          </button>
        </form>

        {scrapeError && <p className="text-[12px] text-charcoal/50 mb-6">Error: {scrapeError}</p>}
        {saved && <p className="text-[13px] mb-6" style={{ color: "#8FA68A" }}>Saved to shop.</p>}

        {product && (
          <div
            className="flex flex-col gap-6"
            style={{ background: "#F7F4EE", border: "1px solid #C8BFB0", borderRadius: "8px", padding: "2rem" }}
          >
            {/* Product image */}
            <Field label="Product image" missing={!product.image_url}>
              {product.image_url ? (
                <div className="relative w-full aspect-[4/3] overflow-hidden" style={{ borderRadius: "4px" }}>
                  <Image
                    src={product.image_url}
                    alt=""
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <div
                  className="flex items-center justify-center text-[11px] text-charcoal/30 italic"
                  style={{ height: "80px", border: "1px dashed #C8BFB0", borderRadius: "4px" }}
                >
                  No image scraped — add one manually after saving
                </div>
              )}
            </Field>

            <Field label="Brand" missing={!product.brand}>
              <input
                className={product.brand ? inputCls : missingInputCls}
                value={product.brand}
                placeholder="Unknown brand"
                onChange={(e) => setProduct({ ...product, brand: e.target.value })}
              />
            </Field>

            <Field label="Product name" missing={!product.product_name}>
              <input
                className={product.product_name ? inputCls : missingInputCls}
                value={product.product_name}
                placeholder="Unknown product name"
                onChange={(e) => setProduct({ ...product, product_name: e.target.value })}
              />
            </Field>

            <Field label="Price (€)" missing={product.price == null}>
              <input
                type="number"
                className={product.price != null ? inputCls : missingInputCls}
                value={product.price ?? ""}
                placeholder="Enter price"
                onChange={(e) => {
                  const val = e.target.value === "" ? null : parseFloat(e.target.value);
                  updateProduct({ price: val });
                }}
              />
            </Field>

            <Field label="Garment type" missing={!product.garment_type}>
              <select
                className={product.garment_type ? inputCls : missingInputCls}
                value={product.garment_type ?? ""}
                onChange={(e) => updateProduct({ garment_type: e.target.value as GarmentType || null })}
              >
                <option value="" disabled>Select garment type…</option>
                {GARMENT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </Field>

            <Field label="Manufacturing location">
              <select
                className={inputCls}
                value={product.manufacturing_location}
                onChange={(e) => updateProduct({ manufacturing_location: e.target.value as ManufacturingLocation })}
              >
                {MANUFACTURING_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </Field>

            <Field label="Factory transparency">
              <select
                className={inputCls}
                value={product.factory_transparency}
                onChange={(e) => updateProduct({ factory_transparency: e.target.value as TransparencyValue })}
              >
                <option value="disclosed">Disclosed</option>
                <option value="partial">Partial</option>
                <option value="not-disclosed">Not disclosed</option>
              </select>
            </Field>

            <Field label="Fibre composition" missing={fibresMissing}>
              <div className="flex flex-col gap-2">
                {product.fibre_composition.length === 0 && (
                  <p className="text-[11px] italic text-charcoal/40">
                    No fibres scraped — add them manually below
                  </p>
                )}
                {product.fibre_composition.map((row, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <select
                      className={`${inputCls} flex-1`}
                      value={row.fiber}
                      onChange={(e) => updateFibreRow(i, "fiber", e.target.value)}
                    >
                      {FIBERS.map((f) => (
                        <option key={f.value} value={f.value}>{f.label}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      className={`${row.pct > 0 ? inputCls : missingInputCls} w-20`}
                      value={row.pct === 0 ? "" : row.pct}
                      placeholder="0"
                      onChange={(e) => updateFibreRow(i, "pct", e.target.value)}
                    />
                    <span className="text-[12px] text-charcoal/40">%</span>
                    <button
                      type="button"
                      onClick={() => removeFibreRow(i)}
                      className="text-[11px] text-charcoal/30 hover:text-charcoal/60 px-1"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addFibreRow}
                  className="text-[11px] text-charcoal/40 hover:text-charcoal self-start mt-1"
                >
                  + Add fibre
                </button>
              </div>
            </Field>

            <Field label="Data completeness (%)" missing={product.data_completeness == null}>
              <input
                type="number"
                className={product.data_completeness != null ? inputCls : missingInputCls}
                value={product.data_completeness ?? ""}
                placeholder="Unknown"
                onChange={(e) => {
                  const val = e.target.value === "" ? null : parseFloat(e.target.value);
                  setProduct({ ...product, data_completeness: val });
                }}
              />
            </Field>

            {/* Computed scores */}
            <div className="grid grid-cols-2 gap-6 pt-4" style={{ borderTop: "1px solid #EDE8DC" }}>
              {!scoresReady && (
                <div className="col-span-2">
                  <p className="text-[11px] italic text-charcoal/40">
                    Scores will appear once fibre composition is filled in.
                  </p>
                </div>
              )}
              {scoresReady && (
                <>
                  <div>
                    <p className="text-[10px] tracking-[0.25em] uppercase text-charcoal/40 mb-1">Breathability</p>
                    <p className="font-display text-charcoal" style={{ fontSize: "2.8rem", fontWeight: 300, fontFamily: "var(--font-cormorant)" }}>
                      {product.breathability_score}<span className="text-[1rem] text-charcoal/30"> /10</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] tracking-[0.25em] uppercase text-charcoal/40 mb-1">Clean score</p>
                    <p className="font-display text-charcoal" style={{ fontSize: "2.8rem", fontWeight: 300, fontFamily: "var(--font-cormorant)" }}>
                      {product.clean_score}<span className="text-[1rem] text-charcoal/30"> /10</span>
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] tracking-[0.25em] uppercase text-charcoal/40 mb-1">Fair price range</p>
                    {product.fair_price_low == null ? (
                      <p className="text-[13px] text-charcoal/50 italic">
                        Unavailable — set manufacturing location to calculate
                      </p>
                    ) : (
                      <>
                        <p className="text-[14px] text-charcoal">
                          €{product.fair_price_low} – €{product.fair_price_high}
                        </p>
                        {product.fair_price_spanning_countries && (
                          <p className="text-[11px] text-charcoal/40 mt-1">
                            Range reflects {product.fair_price_spanning_countries.join("–")} wage data; exact country not disclosed
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-4 pt-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || garmentMissing}
                className="px-6 py-2.5 text-[13px] text-charcoal disabled:opacity-40"
                title={garmentMissing ? "Select a garment type first" : undefined}
                style={{ backgroundColor: "#E8C8BE", borderRadius: 0 }}
              >
                {saving ? "Saving…" : "Save to Shop"}
              </button>
              {saveError && <p className="text-[12px] text-charcoal/40">{saveError}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
