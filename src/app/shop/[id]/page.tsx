import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface DbProduct {
  id: number;
  url: string;
  brand: string | null;
  product_name: string | null;
  fibre_composition: { fiber: string; pct: number }[] | null;
  price: number | null;
  fair_price_low: number | null;
  fair_price_high: number | null;
  fair_price_spanning_countries: string[] | null;
  manufacturing_location: string | null;
  garment_type: string | null;
  image_url: string | null;
  breathability_score: number | null;
  clean_score: number | null;
  factory_transparency: string | null;
  data_completeness: number | null;
}

async function getProduct(id: string): Promise<DbProduct | null> {
  try {
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/products/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function materialLabel(fibres: { fiber: string; pct: number }[] | null): string {
  if (!fibres || fibres.length === 0) return "—";
  return fibres
    .map((f) => {
      const name = f.fiber
        .replace(/-/g, " ")
        .replace(/\b(unknown|generic|unspecified)\b/gi, "")
        .replace(/\s+/g, " ")
        .trim();
      return `${f.pct}% ${name}`;
    })
    .join(", ");
}

function ScoreBar({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="flex items-center gap-4">
      <span className="text-[11px] tracking-[0.25em] uppercase text-charcoal/40 w-28">{label}</span>
      <div className="flex-1 h-[2px] bg-charcoal/10 relative">
        {value != null && (
          <div
            className="absolute left-0 top-0 h-full bg-charcoal/40"
            style={{ width: `${(value / 10) * 100}%` }}
          />
        )}
      </div>
      <span
        className="font-display italic text-charcoal"
        style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.3rem", fontWeight: 300 }}
      >
        {value ?? "—"}
        {value != null && <span className="text-charcoal/30 text-sm not-italic">/10</span>}
      </span>
    </div>
  );
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await getProduct(id);
  if (!p) notFound();

  const brand = p.brand ?? "Unknown brand";
  const hasFairPrice = p.fair_price_low != null && p.fair_price_high != null;

  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-5xl mx-auto px-6 sm:px-10 pt-28 pb-24">
        {/* Breadcrumb */}
        <Link
          href="/shop"
          className="text-[10px] tracking-[0.3em] uppercase text-charcoal/40 hover:text-charcoal transition-colors mb-10 inline-block"
        >
          ← Back to shop
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-6">
          {/* Image */}
          <div>
            {p.image_url ? (
              <div className="relative w-full aspect-[3/4] overflow-hidden">
                <Image
                  src={p.image_url}
                  alt={p.product_name ?? ""}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            ) : (
              <div className="w-full aspect-[3/4]" style={{ backgroundColor: "#EDE8DC" }} />
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <p className="text-[10px] tracking-[0.35em] uppercase text-charcoal/40 mb-2">{brand}</p>
            <h1
              className="font-display italic text-charcoal leading-tight mb-6"
              style={{ fontSize: "clamp(1.6rem, 4vw, 2.4rem)", fontWeight: 300, fontFamily: "var(--font-cormorant)" }}
            >
              {p.product_name ?? "Untitled"}
            </h1>

            {/* Scores */}
            <div className="flex flex-col gap-4 pb-6 mb-6" style={{ borderBottom: "1px solid #EDE8DC" }}>
              <ScoreBar label="Breathability" value={p.breathability_score} />
              <ScoreBar label="Clean materials" value={p.clean_score} />
            </div>

            {/* Fibre composition */}
            <div className="mb-6" style={{ borderBottom: "1px solid #EDE8DC", paddingBottom: "1.5rem" }}>
              <p className="text-[10px] tracking-[0.3em] uppercase text-charcoal/40 mb-2">Composition</p>
              <p className="text-[14px] text-charcoal/70 leading-relaxed">{materialLabel(p.fibre_composition)}</p>
            </div>

            {/* Fair price */}
            <div className="mb-6" style={{ borderBottom: "1px solid #EDE8DC", paddingBottom: "1.5rem" }}>
              <p className="text-[10px] tracking-[0.3em] uppercase text-charcoal/40 mb-2">Pricing</p>
              <div className="flex items-baseline gap-4">
                <span className="text-[15px] text-charcoal">
                  {p.price != null ? `€${p.price} retail` : "Price unknown"}
                </span>
                {hasFairPrice && (
                  <span className="text-[12px] text-charcoal/40">
                    fair est. €{Math.round(p.fair_price_low!)}–{Math.round(p.fair_price_high!)}
                  </span>
                )}
              </div>
              {hasFairPrice && p.fair_price_spanning_countries && p.fair_price_spanning_countries.length > 0 && (
                <p className="text-[11px] text-charcoal/35 mt-1 leading-snug">
                  Range reflects {p.fair_price_spanning_countries.join("–")} wage data; exact country not disclosed
                </p>
              )}
              {!hasFairPrice && (
                <p className="text-[11px] text-charcoal/35 mt-1 italic">
                  Fair price estimate unavailable — manufacturing location not disclosed
                </p>
              )}
            </div>

            {/* Manufacturing + transparency */}
            <div className="mb-8 flex flex-col gap-2">
              {p.manufacturing_location && (
                <p className="text-[12px] text-charcoal/50">
                  <span className="text-[10px] tracking-widest uppercase text-charcoal/30 mr-2">Made in</span>
                  {p.manufacturing_location}
                </p>
              )}
              {p.factory_transparency && (
                <p className="text-[12px] text-charcoal/50">
                  <span className="text-[10px] tracking-widest uppercase text-charcoal/30 mr-2">Transparency</span>
                  {p.factory_transparency}
                </p>
              )}
            </div>

            {/* CTA */}
            <a
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-center text-[12px] tracking-[0.2em] uppercase text-cream px-8 py-4 transition-opacity hover:opacity-80"
              style={{ backgroundColor: "#2C2B27" }}
            >
              Shop this at {brand} →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
