"use client";

import { useState } from "react";
import type { Product } from "@/data/products";
import LatestPickCard from "./LatestPickCard";
import ProductModal from "./ProductModal";

export default function FeaturedProducts({ products }: { products: Product[] }) {
  const [selected, setSelected] = useState<Product | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        {products.map((p) => (
          <LatestPickCard key={p.id} product={p} onClick={setSelected} />
        ))}
      </div>
      <ProductModal product={selected} onClose={() => setSelected(null)} />
    </>
  );
}
