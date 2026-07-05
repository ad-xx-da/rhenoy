"use client";

import { useState } from "react";

// ── Data ────────────────────────────────────────────────────────────────────

const FIBERS = [
  { label: "Linen EU",            value: "linen-eu",       breathability: 9, clean: 9 },
  { label: "Linen (unknown origin)", value: "linen-unknown", breathability: 8, clean: 7 },
  { label: "Cotton organic",      value: "cotton-organic", breathability: 8, clean: 9 },
  { label: "Cotton conventional", value: "cotton-conv",    breathability: 7, clean: 5 },
  { label: "Silk mulberry",       value: "silk-mulberry",  breathability: 9, clean: 8 },
  { label: "Silk (generic)",      value: "silk-generic",   breathability: 8, clean: 7 },
  { label: "TENCEL Lyocell",      value: "tencel",         breathability: 7, clean: 8 },
  { label: "Hemp",                value: "hemp",           breathability: 8, clean: 9 },
  { label: "Polyester",           value: "polyester",      breathability: 2, clean: 2 },
  { label: "Nylon",               value: "nylon",          breathability: 2, clean: 2 },
  { label: "Viscose",             value: "viscose",        breathability: 4, clean: 4 },
  { label: "Wool merino",         value: "wool-merino",    breathability: 7, clean: 7 },
  { label: "Wool (generic)",      value: "wool-generic",   breathability: 6, clean: 6 },
  { label: "Elastane",            value: "elastane",       breathability: 1, clean: 2 },
];

const GARMENT_TYPES = ["Dress", "Top", "Trousers", "Outerwear", "Knitwear"];

const TRANSPARENCY = [
  { value: "disclosed",  label: "Disclosed" },
  { value: "partial",    label: "Partial" },
  { value: "not-disclosed", label: "Not disclosed" },
];

// ── Types ────────────────────────────────────────────────────────────────────

type FiberRow = { fiber: string; pct: string };
type TransparencyValue = "disclosed" | "partial" | "not-disclosed";

// ── Helpers ──────────────────────────────────────────────────────────────────

function getFiberData(value: string) {
  return FIBERS.find((f) => f.value === value) ?? FIBERS[0];
}

function calcScores(
  rows: FiberRow[],
  transparency: TransparencyValue
): { breathability: number; clean: number } | null {
  const total = rows.reduce((s, r) => s + (parseFloat(r.pct) || 0), 0);
  if (Math.round(total) !== 100) return null;

  let breathability = 0;
  let clean = 0;
  for (const row of rows) {
    const pct = parseFloat(row.pct) || 0;
    const fiber = getFiberData(row.fiber);
    breathability += (fiber.breathability * pct) / 100;
    clean += (fiber.clean * pct) / 100;
  }

  if (transparency === "disclosed") clean = Math.min(10, clean + 0.5);
  if (transparency === "not-disclosed") clean = Math.max(0, clean - 0.5);

  return {
    breathability: Math.round(breathability * 10) / 10,
    clean: Math.round(clean * 10) / 10,
  };
}

function fairRange(price: number) {
  return { low: price * 0.3, high: price * 0.45 };
}

function verdict(price: number, transparency: TransparencyValue): string {
  const { high } = fairRange(price);
  const tNote =
    transparency === "disclosed"
      ? "Factory is disclosed."
      : transparency === "partial"
      ? "Factory partially disclosed."
      : "Factory not disclosed.";

  if (price <= high) {
    return `Retail price is within fair range. ${tNote}`;
  }
  const gap = (price - high).toFixed(0);
  return `Retail price is above fair range by €${gap}. ${tNote}`;
}

function BigScore({ label, score }: { label: string; score: number }) {
  return (
    <div>
      <p className="text-[10px] tracking-[0.3em] uppercase text-charcoal/50 mb-3">
        {label}
      </p>
      <div className="flex items-baseline gap-1.5">
        <span
          className="font-display text-charcoal leading-none"
          style={{ fontSize: "72px", fontWeight: 300 }}
        >
          {score}
        </span>
        <span
          className="font-display text-charcoal/40"
          style={{ fontSize: "1.1rem", fontWeight: 300 }}
        >
          /10
        </span>
      </div>
    </div>
  );
}

// ── Scrape result type ────────────────────────────────────────────────────────

type ScrapeResult = {
  productName: string | null;
  brand: string | null;
  fibres: { name: string; percentage: number }[] | null;
  price: number | null;
  currency: string | null;
  countryOfOrigin: string | null;
  certifications: string[] | null;
  treatments: string[] | null;
  dataCompleteness: number;
};

// Map common fibre names from API to our dropdown values
function matchFiber(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("linen") && (n.includes("eu") || n.includes("european"))) return "linen-eu";
  if (n.includes("linen")) return "linen-unknown";
  if (n.includes("cotton") && (n.includes("organic") || n.includes("gots"))) return "cotton-organic";
  if (n.includes("cotton")) return "cotton-conv";
  if (n.includes("silk") && n.includes("mulberry")) return "silk-mulberry";
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

// ── Component ─────────────────────────────────────────────────────────────────

export default function CalculatorPage() {
  const [rows, setRows] = useState<FiberRow[]>(() => [{ fiber: "linen-eu", pct: "" }]);
  const [garment, setGarment] = useState("Top");
  const [price, setPrice] = useState("");
  const [transparency, setTransparency] = useState<TransparencyValue>("partial");
  const [showBreakdown, setShowBreakdown] = useState(false);

  // URL analyser state
  const [productUrl, setProductUrl] = useState("");
  const [scraping, setScraping] = useState(false);
  const [scrapeResult, setScrapeResult] = useState<ScrapeResult | null>(null);
  const [scrapeError, setScrapeError] = useState<string | null>(null);

  async function handleAnalyse() {
    if (!productUrl.trim()) return;
    setScraping(true);
    setScrapeResult(null);
    setScrapeError(null);
    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: productUrl.trim() }),
      });
      const data: ScrapeResult = await res.json();
      if (!res.ok) throw new Error("Failed to analyse URL");
      setScrapeResult(data);

      // Auto-fill fibres
      if (data.fibres && data.fibres.length > 0) {
        setRows(
          data.fibres.map((f) => ({
            fiber: matchFiber(f.name),
            pct: String(f.percentage),
          }))
        );
      }

      // Auto-fill price
      if (data.price) {
        setPrice(String(data.price));
      }

      // Auto-fill transparency
      setTransparency(data.countryOfOrigin ? "partial" : "not-disclosed");
    } catch {
      setScrapeError("Could not retrieve product data. Check the URL and try again.");
    } finally {
      setScraping(false);
    }
  }

  // Fiber row helpers
  function updateRow(i: number, field: keyof FiberRow, val: string) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: val } : r)));
  }
  function addRow() {
    setRows((prev) => [...prev, { fiber: "linen-eu", pct: "" }]);
  }
  function removeRow(i: number) {
    setRows((prev) => prev.filter((_, idx) => idx !== i));
  }

  const totalPct = rows.reduce((s, r) => s + (parseFloat(r.pct) || 0), 0);
  const pctOk = Math.round(totalPct) === 100;

  const numPrice = parseFloat(price);
  const priceOk = !isNaN(numPrice) && numPrice > 0;

  const scores = pctOk ? calcScores(rows, transparency) : null;
  const range = priceOk ? fairRange(numPrice) : null;
  const verdictText = priceOk ? verdict(numPrice, transparency) : null;

  const inputCls =
    "w-full bg-cream border text-charcoal text-[13px] px-3 py-2 focus:outline-none focus:border-charcoal/40 transition-colors appearance-none";
  const borderColor = "border-[#EDE8DC]";

  return (
    <div style={{ minHeight: "100vh", background: "#E8E3DA", padding: "60px 40px" }}>
      <div style={{ maxWidth: "860px", margin: "0 auto", position: "relative" }}>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/lace_border_only.png"
          alt=""
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: "-32px",
            width: "calc(100% + 64px)",
            height: "calc(100% + 64px)",
            objectFit: "fill",
            pointerEvents: "none",
            zIndex: 2,
            filter: "sepia(0.2) brightness(1.05)",
            opacity: 0.9,
          }}
        />

        <div style={{ position: "relative", zIndex: 1, background: "#F7F4EE", padding: "56px 64px" }}>

          {/* ── URL analyser ─────────────────────────────────────────── */}
          <div style={{ marginBottom: "40px" }}>
            <p style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#2C2B27", opacity: 0.5, marginBottom: "10px" }}>
              Analyse a product
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <input
                type="text"
                placeholder="Paste a product URL to auto-fill"
                value={productUrl}
                onChange={(e) => setProductUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAnalyse()}
                style={{ flex: 1, padding: "10px 14px", border: "1px solid #C8BFB0", background: "#F7F4EE", fontSize: "13px", borderRadius: "3px", color: "#2C2B27", outline: "none" }}
              />
              <button
                onClick={handleAnalyse}
                disabled={scraping || !productUrl.trim()}
                style={{ padding: "10px 20px", background: "#2C2B27", color: "#F7F4EE", border: "none", borderRadius: "3px", fontSize: "13px", cursor: "pointer", opacity: (scraping || !productUrl.trim()) ? 0.4 : 1, whiteSpace: "nowrap" }}
              >
                {scraping ? "Analysing…" : "Analyse"}
              </button>
            </div>
            {scraping && <p style={{ fontSize: "12px", color: "#2C2B27", opacity: 0.5, marginTop: "6px" }}>Finding product data…</p>}
            {scrapeError && <p style={{ fontSize: "12px", color: "#E8C8BE", marginTop: "6px" }}>{scrapeError}</p>}
            {scrapeResult && !scraping && (
              <div style={{ marginTop: "8px" }}>
                <p style={{ fontSize: "12px", color: scrapeResult.dataCompleteness < 50 ? "#E8C8BE" : "#2C2B27", opacity: scrapeResult.dataCompleteness < 50 ? 1 : 0.6 }}>
                  {scrapeResult.dataCompleteness}% data found
                  {scrapeResult.fibres && scrapeResult.fibres.length > 0 && " — fibre composition confirmed"}
                  {scrapeResult.price && ", price confirmed"}
                  {scrapeResult.countryOfOrigin && ", origin confirmed"}
                  {!scrapeResult.certifications?.length && ". Certifications not found"}{"."}
                </p>
                {scrapeResult.dataCompleteness < 50 && (
                  <p style={{ fontSize: "12px", color: "#2C2B27", opacity: 0.5, marginTop: "4px" }}>
                    Limited data found for this product. You can fill in the remaining fields manually.
                  </p>
                )}
                {scrapeResult.productName && (
                  <p style={{ fontSize: "12px", color: "#2C2B27", opacity: 0.4, fontStyle: "italic", marginTop: "4px" }}>
                    {scrapeResult.brand ? `${scrapeResult.brand} — ` : ""}{scrapeResult.productName}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* ── Header ───────────────────────────────────────────────── */}
          <p className="text-[10px] tracking-[0.35em] uppercase text-charcoal/50 mb-3">Tool</p>
          <h1 className="font-display italic text-charcoal mb-4" style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 300 }}>
            Fabric calculator
          </h1>
          <p className="text-[14px] font-light text-charcoal/60 leading-relaxed mb-12">
            Enter a fibre composition, garment type, retail price, and factory transparency.
            We estimate breathability, material cleanliness, and whether the price is fair.
          </p>

          {/* ── Fibre composition ─────────────────────────────────────── */}
          <section className="mb-10">
            <p className="text-[10px] tracking-[0.3em] uppercase text-charcoal/50 mb-4">Fibre composition</p>
            <div className="space-y-2">
              {rows.map((row, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <select
                    value={row.fiber}
                    onChange={(e) => updateRow(i, "fiber", e.target.value)}
                    className={`${inputCls} ${borderColor} flex-1`}
                    style={{ borderRadius: 0 }}
                  >
                    {FIBERS.map((f) => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                  <div className="relative w-24 flex-shrink-0">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      placeholder="0"
                      value={row.pct}
                      onChange={(e) => updateRow(i, "pct", e.target.value)}
                      className={`${inputCls} ${borderColor} text-right pr-6`}
                      style={{ borderRadius: 0 }}
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[12px] text-charcoal/40 pointer-events-none">%</span>
                  </div>
                  {rows.length > 1 && (
                    <button
                      onClick={() => removeRow(i)}
                      className="flex-shrink-0 w-9 h-[38px] flex items-center justify-center text-charcoal/30 hover:text-charcoal/70 transition-colors border border-[#EDE8DC]"
                      aria-label="Remove row"
                    >×</button>
                  )}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mt-3">
              <button onClick={addRow} className="text-[11px] text-charcoal/40 hover:text-charcoal/70 transition-colors underline underline-offset-2">
                + Add fibre
              </button>
              <span className={`text-[11px] tabular-nums ${pctOk ? "text-sage" : totalPct > 0 ? "text-blush" : "text-charcoal/30"}`}>
                {Math.round(totalPct)}% of 100
              </span>
            </div>
          </section>

          {/* ── Garment type ─────────────────────────────────────────── */}
          <section className="mb-10">
            <p className="text-[10px] tracking-[0.3em] uppercase text-charcoal/50 mb-4">Garment type</p>
            <div className="flex flex-wrap gap-2">
              {GARMENT_TYPES.map((g) => (
                <button
                  key={g}
                  onClick={() => setGarment(g)}
                  className={`text-[12px] px-4 py-2 border transition-colors ${garment === g ? "border-charcoal bg-charcoal text-cream" : "border-[#EDE8DC] text-charcoal/60 hover:border-charcoal/30 hover:text-charcoal"}`}
                  style={{ borderRadius: 0 }}
                >{g}</button>
              ))}
            </div>
          </section>

          {/* ── Retail price ─────────────────────────────────────────── */}
          <section className="mb-10">
            <p className="text-[10px] tracking-[0.3em] uppercase text-charcoal/50 mb-4">Retail price</p>
            <div className="relative max-w-[160px]">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-charcoal/40 pointer-events-none">€</span>
              <input
                type="number"
                min={0}
                placeholder="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={`${inputCls} ${borderColor} pl-7`}
                style={{ borderRadius: 0 }}
              />
            </div>
          </section>

          {/* ── Factory transparency ──────────────────────────────────── */}
          <section className="mb-14">
            <p className="text-[10px] tracking-[0.3em] uppercase text-charcoal/50 mb-4">Factory transparency</p>
            <div className="flex flex-wrap gap-2">
              {TRANSPARENCY.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setTransparency(value as TransparencyValue)}
                  className={`text-[12px] px-4 py-2 border transition-colors ${transparency === value ? "border-charcoal bg-charcoal text-cream" : "border-[#EDE8DC] text-charcoal/60 hover:border-charcoal/30 hover:text-charcoal"}`}
                  style={{ borderRadius: 0 }}
                >{label}</button>
              ))}
            </div>
          </section>

          {/* ── Results ──────────────────────────────────────────────── */}
          {(scores || range) && (
            <section className="mt-16">
              <div className="rounded-lg px-8 py-10" style={{ backgroundColor: "#EDE8DF" }}>
                <p className="text-[10px] tracking-[0.3em] uppercase text-charcoal/50 mb-8">Results</p>

                {scores && (
                  <div className="grid grid-cols-2 gap-8 mb-10">
                    <BigScore label="Breathability" score={scores.breathability} />
                    <BigScore label="Clean score" score={scores.clean} />
                  </div>
                )}

                {range && (
                  <div className="mb-8" style={{ borderTop: "1px solid #D8D2C8", paddingTop: "2rem" }}>
                    <p className="text-[10px] tracking-[0.3em] uppercase text-charcoal/50 mb-3">Fair price range</p>
                    <p className="font-display text-charcoal leading-none mb-1" style={{ fontSize: "2rem", fontWeight: 300 }}>
                      €{range.low.toFixed(0)}–€{range.high.toFixed(0)}
                    </p>
                    <p className="text-[12px] text-charcoal/50 mt-2">estimated cost of goods</p>
                  </div>
                )}

                {verdictText && (
                  <p className="text-charcoal leading-snug" style={{ fontSize: "1rem", fontWeight: 400 }}>{verdictText}</p>
                )}

                {range && (
                  <div className="mt-10">
                    <button
                      onClick={() => setShowBreakdown((v) => !v)}
                      className="text-[13px] text-charcoal underline underline-offset-4 hover:text-charcoal/60 transition-colors"
                    >
                      See how this is calculated
                    </button>

                    {showBreakdown && (
                      <div className="mt-6 space-y-6" style={{ borderTop: "1px solid #EDE8DC", paddingTop: "1.5rem" }}>
                        <div>
                          <p className="text-[10px] tracking-[0.3em] uppercase text-charcoal/50 mb-3">
                            Estimated cost of goods — {garment}
                          </p>
                          <div className="space-y-2">
                            {[{ label: "Fabric", share: 0.45 }, { label: "Labour", share: 0.35 }, { label: "Overhead", share: 0.20 }].map(({ label, share }) => {
                              const mid = (range.low + range.high) / 2;
                              return (
                                <div key={label} className="flex justify-between text-[13px]">
                                  <span className="text-charcoal/60">{label}</span>
                                  <span className="text-charcoal tabular-nums">€{(mid * share).toFixed(0)}</span>
                                </div>
                              );
                            })}
                            <div className="flex justify-between text-[13px] pt-2" style={{ borderTop: "1px solid #EDE8DC" }}>
                              <span className="text-charcoal/60">Total estimated COG</span>
                              <span className="text-charcoal tabular-nums">€{((range.low + range.high) / 2).toFixed(0)}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <p className="text-[10px] tracking-[0.3em] uppercase text-charcoal/50 mb-2">Fair price range</p>
                          <p className="text-[13px] font-light text-charcoal/70 leading-relaxed">
                            We estimate cost of goods at 30–45% of retail price. A brand charging significantly above this range is extracting margin beyond what materials, labour, and overhead require. The range is not a guarantee — it is a benchmark for asking better questions.
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] tracking-[0.3em] uppercase text-charcoal/50 mb-2">Factory transparency</p>
                          <p className="text-[13px] font-light text-charcoal/70 leading-relaxed">
                            {transparency === "disclosed" && "The brand publicly names the factory. This allows independent verification of wages, conditions, and certifications. We add 0.5 to the clean score as a result."}
                            {transparency === "partial" && "The brand shares some supply chain information — a region, a tier-one supplier list — but not the full picture. Common across mid-market brands."}
                            {transparency === "not-disclosed" && "No factory information is available. Without visibility into where and how a garment is made, labour and environmental claims cannot be independently assessed. We subtract 0.5 from the clean score as a result."}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>
          )}

          {!scores && !range && (
            <p className="text-[12px] text-charcoal/30 mt-2">Fill in the fields above to see scores and fair price range.</p>
          )}

        </div>
      </div>
    </div>
  );
}
