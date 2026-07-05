import Image from "next/image";
import Link from "next/link";
import { products } from "@/data/products";
import FeaturedProducts from "@/components/FeaturedProducts";
import EmailCapture from "@/components/EmailCapture";

export default function Home() {
  const picks = products.slice(0, 3);

  return (
    <div className="bg-cream">
      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section className="flex min-h-[560px] sm:min-h-[640px]">
        {/* Text half */}
        <div className="flex-1 flex items-center px-6 sm:px-10 pt-20 pb-16 sm:pt-24 sm:pb-20 bg-cream">
          <div className="max-w-[480px]">
            <h1
              className="font-display italic text-charcoal leading-[1.08] mb-6"
              style={{ fontSize: "clamp(2.4rem, 5vw, 4.2rem)", fontWeight: 300 }}
            >
              Fashion is overwhelming.
              <br />
              We made it quiet.
            </h1>
            <p className="text-[15px] font-light text-charcoal/60 max-w-md leading-relaxed mb-10">
              Every piece is scored for what it&rsquo;s made of, what it costs to
              make, and whether it&rsquo;s worth it.
            </p>
            <Link
              href="/shop"
              className="text-[13px] text-charcoal hover:text-charcoal/60 transition-colors"
            >
              Explore the collection →
            </Link>
          </div>
        </div>
        {/* Image half */}
        <div className="hidden sm:block relative w-[50%] flex-shrink-0">
          <Image
            src="/images/pexels-marina-zasorina-9374415.jpg"
            alt=""
            fill
            className="object-cover"
            priority
          />
        </div>
      </section>

      {/* ── What we do ──────────────────────────────────────────────── */}
      <section
        className="max-w-6xl mx-auto px-6 sm:px-10 py-16 sm:py-20"
        style={{ borderTop: "1px solid #EDE8DC" }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-16">
          <WhatWeDoColumn
            label="We find it"
            body="Curated picks across natural and low-impact materials. We look so you don't have to."
          />
          <WhatWeDoColumn
            label="We score it"
            body="Each piece is rated for breathability, material cleanliness, and fair pricing — with the numbers shown."
          />
          <WhatWeDoColumn
            label="You choose"
            body="With the full picture in front of you — not just the marketing — to decide what's worth your money."
          />
        </div>
      </section>

      {/* ── Atmospheric divider ─────────────────────────────────────── */}
      <div className="relative w-full h-[340px] sm:h-[440px] overflow-hidden">
        <Image
          src="/images/pexels-cottonbro-5590903.jpg"
          alt=""
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-charcoal/30" />
      </div>

      {/* ── Latest picks ────────────────────────────────────────────── */}
      <section
        className="max-w-6xl mx-auto px-6 sm:px-10 py-16 sm:py-20"
        style={{ borderTop: "1px solid #EDE8DC" }}
      >
        <div className="flex items-baseline justify-between mb-10">
          <h2
            className="font-display italic text-charcoal"
            style={{ fontSize: "1.75rem", fontWeight: 300 }}
          >
            Latest picks
          </h2>
          <Link
            href="/shop"
            className="text-[12px] text-charcoal/50 hover:text-charcoal transition-colors"
          >
            See all picks →
          </Link>
        </div>
        <FeaturedProducts products={picks} />
      </section>

      {/* ── Email capture ───────────────────────────────────────────── */}
      <section
        className="max-w-6xl mx-auto px-6 sm:px-10 py-16 sm:py-20"
        style={{ borderTop: "1px solid #EDE8DC" }}
      >
        <EmailCapture />
      </section>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer
        className="max-w-6xl mx-auto px-6 sm:px-10 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        style={{ borderTop: "1px solid #EDE8DC" }}
      >
        <span
          className="font-display italic text-charcoal text-lg"
          style={{ fontWeight: 300 }}
        >
          rhenoy collective
        </span>
        <p className="text-[11px] text-charcoal/40 tracking-wide">
          We score. You decide.
        </p>
        <nav className="flex gap-6">
          {[
            { href: "/shop", label: "Shop" },
            { href: "/journal", label: "Journal" },
            { href: "/calculator", label: "Calculator" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-[11px] text-charcoal/40 hover:text-charcoal transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>
      </footer>
    </div>
  );
}

function WhatWeDoColumn({
  label,
  body,
}: {
  label: string;
  body: string;
}) {
  return (
    <div>
      <p className="text-[10px] tracking-widest uppercase text-charcoal mb-3">
        {label}
      </p>
      <p className="text-[13px] font-light text-charcoal/60 leading-relaxed">
        {body}
      </p>
    </div>
  );
}
