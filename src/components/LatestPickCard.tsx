import type { Product } from "@/data/products";

interface LatestPickCardProps {
  product: Product;
  onClick: (product: Product) => void;
}

export default function LatestPickCard({ product, onClick }: LatestPickCardProps) {
  return (
    <button
      onClick={() => onClick(product)}
      className="group text-left w-full cursor-pointer"
    >
      {/* Swatch */}
      <div
        className="w-full aspect-[3/4] mb-4"
        style={{
          background: `linear-gradient(150deg, ${product.swatchFrom} 0%, ${product.swatchTo} 100%)`,
        }}
      />

      {/* Material badge */}
      <span
        className="inline-block text-[10px] tracking-wide text-charcoal/50 mb-2"
        style={{ borderBottom: "1px solid currentColor", paddingBottom: "1px" }}
      >
        {product.materialLabel}
      </span>

      {/* Brand + name */}
      <p className="text-[10px] tracking-widest uppercase text-charcoal/40 mb-0.5">
        {product.brand}
      </p>
      <p className="text-sm text-charcoal mb-3 group-hover:text-charcoal/70 transition-colors">
        {product.name}
      </p>

      {/* Score pills */}
      <div className="flex items-center gap-1.5 mb-3 flex-wrap">
        <span
          className="text-[10px] px-2 py-0.5 rounded-full text-cream"
          style={{ backgroundColor: "#8FA68A" }}
        >
          Breathability {product.breathabilityScore}
        </span>
        <span
          className="text-[10px] px-2 py-0.5 rounded-full text-charcoal"
          style={{ backgroundColor: "#B8D4B3" }}
        >
          Clean {product.cleanScore}
        </span>
      </div>

      {/* Fair range + price */}
      <p className="text-[11px] text-charcoal/50 mb-0.5">
        Fair range: {product.fairPriceRange}
      </p>
      <p className="text-sm text-charcoal">${product.price}</p>
    </button>
  );
}
