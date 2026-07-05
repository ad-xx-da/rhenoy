import EmailCapture from "@/components/EmailCapture";

export const metadata = {
  title: "Shop — rhenoy collective",
};

export default function ShopPage() {
  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-6xl mx-auto px-6 sm:px-10 pt-28 pb-24">
        <p className="text-[10px] tracking-[0.35em] uppercase text-charcoal/50 mb-3">Shop</p>
        <h1
          className="font-display italic text-charcoal mb-4"
          style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 300 }}
        >
          The collection is coming.
        </h1>
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
      </div>
    </div>
  );
}
