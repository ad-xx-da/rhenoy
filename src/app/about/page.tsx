import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-2xl mx-auto px-6 py-24">
        <p className="text-xs tracking-[0.35em] uppercase text-sage mb-8">Our Story</p>
        <h1 className="font-display text-4xl sm:text-5xl text-charcoal leading-snug mb-12">
          Fashion is a design problem.
          <br />
          <em>We are the design answer.</em>
        </h1>

        <div className="space-y-6 text-sm text-charcoal-muted leading-relaxed">
          <p>
            Rhenoy was founded on a simple premise: most fashion is dishonest. Dishonest about
            what it's made of, dishonest about who made it, dishonest about why it costs what
            it costs, and dishonest about how long it will actually last.
          </p>
          <p>
            We make clothing from materials with a provable record of breathability and low
            environmental impact — linen, hemp, peace silk, organic cotton, and TENCEL Lyocell.
            Every garment page on this site tells you exactly what the material is rated for,
            where it was produced, and what a fair price for that work looks like.
          </p>
          <p>
            We do not run seasonal campaigns. We do not create artificial scarcity. We do not
            use trend cycles to drive purchasing decisions. We make things we believe in,
            and we tell you why.
          </p>
        </div>

        <div className="mt-16 pt-12 border-t border-charcoal/10">
          <Link
            href="/shop"
            className="inline-block bg-charcoal text-cream text-sm tracking-widest uppercase px-10 py-4 hover:bg-charcoal/80 transition-colors"
          >
            See the Collection
          </Link>
        </div>
      </div>
    </div>
  );
}
