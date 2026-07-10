import EmailCapture from "@/components/EmailCapture";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Shop — rhenoy collective",
};

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
  created_at: string;
}

async function getProducts(): Promise<DbProduct[]> {
  try {
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/products`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

function materialLabel(fibres: { fiber: string; pct: number }[] | null): string {
  if (!fibres || fibres.length === 0) return "—";
  return fibres.map((f) => `${f.pct}% ${f.fiber.replace(/-/g, " ")}`).join(", ");
}

export default async function ShopPage() {
  const products = await getProducts();

  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-6xl mx-auto px-6 sm:px-10 pt-28 pb-24">
        <p className="text-[10px] tracking-[0.35em] uppercase text-charcoal/50 mb-3">Shop</p>
        <h1
          className="font-display italic text-charcoal mb-4"
          style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 300, fontFamily: "var(--font-cormorant)" }}
        >
          {products.length > 0 ? "Scored picks." : "The collection is coming."}
        </h1>

        {products.length === 0 ? (
          <>
            <p className="text-[14px] font-light text-charcoal/60 leading-relaxed mb-16 max-w-md">
              We are still building the shop. Every piece will be scored for breathability,
              material cleanliness, and fair pricing before it goes live.
            </p>
            <div style={{ borderTop: "1px solid #EDE8DC", paddingTop: "3rem" }}>
              <EmailCapture
                heading="Get notified when we launch."
                subtext="No spam. Just a note when the shop goes live."
              />
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-10">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ScorePill({ label, value }: { label: string; value: number | null }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="text-[10px] tracking-widest uppercase text-charcoal/40">{label}</span>
      <span className="font-display text-cream" style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.1rem" }}>
        {value ?? "—"}
      </span>
      <span className="text-cream/30 text-[10px]">/10</span>
    </span>
  );
}

function ProductCard({ product: p }: { product: DbProduct }) {
  return (
    <Link
      href={p.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block"
      style={{ border: "1px solid #EDE8DC", background: "#F7F4EE" }}
    >
      {/* Product image */}
      {p.image_url ? (
        <div className="relative w-full aspect-[4/3] overflow-hidden">
          <Image
            src={p.image_url}
            alt={p.product_name ?? ""}
            fill
            className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
            unoptimized
          />
        </div>
      ) : (
        <div
          className="w-full aspect-[4/3]"
          style={{ backgroundColor: "#EDE8DC" }}
        />
      )}

      {/* Score strip */}
      <div
        className="flex items-center gap-4 px-4 py-3"
        style={{ backgroundColor: "#2C2B27" }}
      >
        <ScorePill label="Breath." value={p.breathability_score} />
        <span className="text-white/20 text-[10px]">|</span>
        <ScorePill label="Clean" value={p.clean_score} />
      </div>

      {/* Body */}
      <div className="px-4 py-5">
        <p className="text-[10px] tracking-[0.25em] uppercase text-charcoal/40 mb-1">
          {p.brand ?? "—"}
        </p>
        <p
          className="font-display italic text-charcoal leading-snug mb-3"
          style={{ fontSize: "1.15rem", fontWeight: 300, fontFamily: "var(--font-cormorant)" }}
        >
          {p.product_name ?? "Untitled"}
        </p>
        <p className="text-[11px] text-charcoal/50 mb-4 leading-relaxed">
          {materialLabel(p.fibre_composition)}
        </p>
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-[13px] text-charcoal">
            {p.price != null ? `€${p.price}` : "—"}
          </span>
          {p.fair_price_low != null && p.fair_price_high != null ? (
            <span className="text-[11px] text-charcoal/40">
              fair €{Math.round(p.fair_price_low)}–{Math.round(p.fair_price_high)}
            </span>
          ) : (
            <span className="text-[11px] text-charcoal/30 italic">fair range n/a</span>
          )}
        </div>
        {p.fair_price_spanning_countries && p.fair_price_spanning_countries.length > 0 && (
          <p className="text-[10px] text-charcoal/35 leading-snug">
            Range reflects {p.fair_price_spanning_countries.join("–")} wage data; exact country not disclosed
          </p>
        )}
      </div>

      {/* CTA */}
      <div
        className="px-4 py-3 text-[11px] text-charcoal/50 group-hover:text-charcoal transition-colors"
        style={{ borderTop: "1px solid #EDE8DC" }}
      >
        View product →
      </div>
    </Link>
  );
}
