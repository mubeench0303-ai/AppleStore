"use client";

import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import type { Product } from "@/types";
import ProductCard from "./ProductCard";
import ProductCardSkeleton from "./ProductCardSkeleton";
import EmptyState from "@/components/ui/EmptyState";

export default function ProductGrid({
  products,
  isLoading,
  emptyMessage = "No products match your filters.",
  emptyTitle = "Nothing here yet",
  emptyActionLabel,
  emptyActionHref,
  layoutMorph = false,
}: {
  products: Product[];
  isLoading?: boolean;
  emptyMessage?: string;
  emptyTitle?: string;
  emptyActionLabel?: string;
  emptyActionHref?: string;
  layoutMorph?: boolean;
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
      <EmptyState
        title={emptyTitle}
        message={emptyMessage}
        actionLabel={emptyActionLabel}
        actionHref={emptyActionHref}
      />
    );
  }

  const grid = (
    <motion.div layout={layoutMorph} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
      <AnimatePresence mode="popLayout">
        {products.map((p) => (
          <motion.div
            key={p.id}
            layout={layoutMorph}
            initial={layoutMorph ? { opacity: 0, scale: 0.94, filter: "blur(4px)" } : false}
            animate={layoutMorph ? { opacity: 1, scale: 1, filter: "blur(0px)" } : undefined}
            exit={layoutMorph ? { opacity: 0, scale: 0.94, filter: "blur(4px)" } : undefined}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
          >
            <ProductCard product={p} layoutMorph={layoutMorph} />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );

  if (!layoutMorph) return grid;

  return <LayoutGroup id="product-grid">{grid}</LayoutGroup>;
}
