import type { Product } from "@/data/products";

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
  return (
    <button
      onClick={() => onClick(product)}
      className="group text-left w-full cursor-pointer"
    >
      {/* Image swatch */}
      <div
        className="w-full aspect-[3/4] rounded-sm overflow-hidden mb-4 relative"
        style={{
          background: `linear-gradient(135deg, ${product.swatchFrom} 0%, ${product.swatchTo} 100%)`,
        }}
      >
        {/* Material label */}
        <span className="absolute bottom-3 left-3 text-[10px] tracking-widest uppercase bg-cream/80 text-charcoal px-2 py-1 rounded-full">
          {product.material}
        </span>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/10 transition-colors duration-300 flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-xs tracking-widest uppercase text-charcoal bg-cream/90 px-4 py-2 rounded-full">
            View Details
          </span>
        </div>
      </div>

      {/* Info */}
      <div>
        <p className="text-[10px] tracking-widest uppercase text-charcoal-muted mb-1">
          {product.category}
        </p>
        <h3 className="text-sm font-medium text-charcoal group-hover:text-sage transition-colors">
          {product.name}
        </h3>
        <p className="text-sm text-charcoal-muted mt-0.5">${product.price}</p>
      </div>
    </button>
  );
}
