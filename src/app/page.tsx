import Image from "next/image";
import Link from "next/link";
import EmailCapture from "@/components/EmailCapture";

export default function Home() {
  return (
    <div className="bg-cream">
      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section
        className="max-w-6xl mx-auto px-6 sm:px-16 pt-28 pb-20 sm:pt-36 sm:pb-28"
        style={{ borderBottom: "1px solid #E8C8BE" }}
      >
        <h1
          className="font-display italic text-charcoal leading-[1.06] mb-6"
          style={{
            fontSize: "clamp(2.8rem, 6vw, 5.2rem)",
            fontWeight: 400,
            maxWidth: "740px",
            fontFamily: "var(--font-cormorant)",
          }}
        >
          Fashion is overwhelming.
          <br />
          We made it quiet.
        </h1>
        <p
          className="text-[15px] font-light text-charcoal/60 leading-relaxed"
          style={{ maxWidth: "480px" }}
        >
          A community platform helping you navigate to better clothing. Every
          piece is scored for breathability, cleanliness, and fair price &mdash;
          so you can choose well.
        </p>
      </section>

      {/* ── Journal teaser ──────────────────────────────────────────── */}
      <section style={{ backgroundColor: "#EDE8DC" }}>
        <div className="max-w-6xl mx-auto px-6 sm:px-16">
          <div className="flex flex-col sm:flex-row sm:items-stretch gap-0">
            {/* Text */}
            <div className="flex-1 py-12 sm:py-16 sm:pr-12 flex flex-col justify-center">
              <p className="text-[10px] tracking-[0.3em] uppercase text-charcoal/50 mb-4">
                June 2026
              </p>
              <h2
                className="font-display italic text-charcoal leading-snug mb-4"
                style={{
                  fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
                  fontWeight: 300,
                  fontFamily: "var(--font-cormorant)",
                }}
              >
                36 Degrees and Still Wearing Plastic
              </h2>
              <p className="text-[13px] font-light text-charcoal/60 leading-relaxed mb-6">
                Europe is sweating through another record summer. Your wardrobe
                may be making it worse.
              </p>
              <Link
                href="/journal"
                className="text-[12px] text-charcoal hover:text-charcoal/50 transition-colors self-start"
              >
                Read the journal →
              </Link>
            </div>
            {/* Image */}
            <div className="hidden sm:block relative w-[42%] flex-shrink-0">
              <Image
                src="/images/beach-heat.jpg"
                alt=""
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Three pillars ───────────────────────────────────────────── */}
      <section style={{ backgroundColor: "#2C2B27" }}>
        <div className="max-w-6xl mx-auto px-6 sm:px-16">
          <div className="grid grid-cols-1 sm:grid-cols-3">
            <Pillar
              label="We find it"
              body="Curated picks across natural and low-tox materials"
              border={false}
            />
            <Pillar
              label="We score it"
              body="Breathability, clean score, fair price range"
              border={true}
            />
            <Pillar
              label="You choose"
              body="With the full picture, not just the marketing"
              border={true}
            />
          </div>
        </div>
      </section>

      {/* ── Email capture ───────────────────────────────────────────── */}
      <section style={{ backgroundColor: "#EDE8DC" }}>
        <div className="max-w-6xl mx-auto px-6 sm:px-16 py-16 sm:py-20">
          <div className="flex flex-col sm:flex-row sm:items-center gap-10 sm:gap-16">
            <div className="flex-1">
              <h2
                className="font-display italic text-charcoal mb-3"
                style={{
                  fontSize: "clamp(1.5rem, 3vw, 2.1rem)",
                  fontWeight: 300,
                  fontFamily: "var(--font-cormorant)",
                }}
              >
                Stay in the loop.
              </h2>
              <p className="text-[14px] font-light text-charcoal/60 leading-relaxed max-w-sm">
                We&rsquo;ll let you know when the shop and calculator go live.
                No noise, just signal.
              </p>
            </div>
            <div className="flex-1">
              <EmailCapture hideHeading />
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer
        className="max-w-6xl mx-auto px-6 sm:px-16 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        style={{ borderTop: "1px solid #EDE8DC" }}
      >
        <span
          className="font-display italic text-charcoal text-lg"
          style={{ fontWeight: 300, fontFamily: "var(--font-cormorant)" }}
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

function Pillar({
  label,
  body,
  border,
}: {
  label: string;
  body: string;
  border: boolean;
}) {
  return (
    <div
      className="py-10 sm:py-14 px-0 sm:px-10"
      style={
        border
          ? { borderLeft: "1px solid rgba(247,244,238,0.12)" }
          : undefined
      }
    >
      <p
        className="text-[10px] tracking-[0.3em] uppercase mb-3"
        style={{ color: "#E8C8BE" }}
      >
        {label}
      </p>
      <p className="text-[13px] font-light leading-relaxed" style={{ color: "rgba(247,244,238,0.65)" }}>
        {body}
      </p>
    </div>
  );
}
