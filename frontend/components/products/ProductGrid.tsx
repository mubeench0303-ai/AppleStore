"use client";

import type { Product } from "@/types";
import ProductCard from "./ProductCard";
import ProductCardSkeleton from "./ProductCardSkeleton";

export default function ProductGrid({
  products,
  isLoading,
  emptyMessage = "No products match your filters.",
}: {
  products: Product[];
  isLoading?: boolean;
  emptyMessage?: string;
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="py-24 text-center text-muted">
        <p className="text-[15px]">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} index={i} />
      ))}
    </div>
  );
}
