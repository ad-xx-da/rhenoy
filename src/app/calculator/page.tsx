import EmailCapture from "@/components/EmailCapture";

export const metadata = {
  title: "Calculator — rhenoy collective",
};

export default function CalculatorPage() {
  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-6xl mx-auto px-6 sm:px-10 pt-28 pb-24">
        <p className="text-[10px] tracking-[0.35em] uppercase text-charcoal/50 mb-3">Tool</p>
        <h1
          className="font-display italic text-charcoal mb-4"
          style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 300 }}
        >
          The calculator is almost ready.
        </h1>
        <p className="text-[14px] font-light text-charcoal/60 leading-relaxed mb-16 max-w-md">
          Enter a fibre composition and retail price to see a breathability score,
          clean score, and whether the price is fair. Launching soon.
        </p>
        <div style={{ borderTop: "1px solid #EDE8DC", paddingTop: "3rem" }}>
          <EmailCapture
            heading="Get notified when we launch."
            subtext="We'll let you know when the shop and calculator go live. No noise, just signal."
          />
        </div>
      </div>
    </div>
  );
}
