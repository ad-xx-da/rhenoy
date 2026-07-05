"use client";

import { useEffect } from "react";
import type { Product } from "@/data/products";
import ScoreBar from "./ScoreBar";

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

export default function ProductModal({ product, onClose }: ProductModalProps) {
  useEffect(() => {
    if (!product) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [product, onClose]);

  if (!product) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex modal-overlay"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-charcoal/30 backdrop-blur-sm" />

      {/* Panel — slides in from right */}
      <div
        className="modal-panel relative ml-auto w-full max-w-lg h-full bg-cream flex flex-col shadow-2xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-5 right-5 z-10 w-8 h-8 flex items-center justify-center text-charcoal hover:text-charcoal-muted transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 2L14 14M14 2L2 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        {/* Product swatch */}
        <div
          className="w-full aspect-square flex-shrink-0"
          style={{
            background: `linear-gradient(135deg, ${product.swatchFrom} 0%, ${product.swatchTo} 100%)`,
          }}
        />

        {/* Content */}
        <div className="p-8 flex flex-col gap-8">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] tracking-widest uppercase bg-sage/20 text-sage px-2.5 py-1 rounded-full">
                {product.category}
              </span>
              <span className="text-[10px] tracking-widest uppercase bg-blush/40 text-charcoal px-2.5 py-1 rounded-full">
                {product.material}
              </span>
            </div>
            <h2 className="font-display text-2xl text-charcoal mb-1">
              {product.name}
            </h2>
            <p className="text-charcoal-muted text-sm">
              ${product.price} · Fair range {product.fairPriceRange}
            </p>
          </div>

          {/* Scores */}
          <div className="flex flex-col gap-4">
            <h3 className="text-[10px] tracking-widest uppercase text-charcoal-muted">
              Fabric Scores
            </h3>
            <ScoreBar
              label="Breathability"
              score={product.breathabilityScore}
              color="#8FA68A"
            />
            <ScoreBar
              label="Clean Score"
              score={product.cleanScore}
              color="#E8C8BE"
            />
          </div>

          {/* Fair price note */}
          <div className="border-t border-charcoal/10 pt-6">
            <h3 className="text-[10px] tracking-widest uppercase text-charcoal-muted mb-3">
              Fair Price Range
            </h3>
            <p className="text-sm text-charcoal">
              <span className="font-medium">{product.fairPriceRange}</span>{" "}
              reflects living wages, sustainable materials, and ethical production. You are not paying for margin inflation.
            </p>
          </div>

          {/* Design honesty note */}
          <div className="border-t border-charcoal/10 pt-6">
            <h3 className="text-[10px] tracking-widest uppercase text-charcoal-muted mb-3">
              Design Honesty
            </h3>
            <p className="text-sm text-charcoal leading-relaxed">
              {product.designHonestyNote}
            </p>
          </div>

          {/* CTA */}
          <div className="border-t border-charcoal/10 pt-6 mt-auto">
            <a
              href={product.buyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center bg-charcoal text-cream text-sm tracking-widest uppercase py-4 hover:bg-charcoal/80 transition-colors"
            >
              Buy at Rhenoy.com
            </a>
            <p className="text-center text-[10px] text-charcoal-muted mt-3 tracking-wide">
              Opens brand website in a new tab
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
