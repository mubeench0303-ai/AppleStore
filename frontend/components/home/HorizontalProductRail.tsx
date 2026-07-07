"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import type { Product } from "@/types";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";
import EmptyState from "@/components/ui/EmptyState";
import { Star } from "lucide-react";

function RailCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.slug}`} className="block w-[260px] sm:w-[300px] shrink-0 snap-center">
      <div className="relative aspect-square rounded-3xl bg-surface overflow-hidden mb-4 shadow-card">
        {product.image_url && (
          <Image src={product.image_url} alt={product.name} fill className="object-cover" sizes="300px" />
        )}
      </div>
      <p className="text-[13px] text-muted">{product.category_name}</p>
      <h3 className="text-[15px] font-medium mt-0.5">{product.name}</h3>
      {((product.review_count ?? 0) > 0 || (product.total_sold ?? 0) > 0) && (
        <p className="flex items-center gap-1.5 text-[12px] text-muted mt-1">
          {(product.review_count ?? 0) > 0 && (
            <>
              <Star size={12} className="fill-accent text-accent" />
              {(product.avg_rating ?? 0).toFixed(1)} ({String(product.review_count).padStart(2, "0")})
            </>
          )}
          {(product.total_sold ?? 0) > 0 && <span>{product.total_sold} sold</span>}
        </p>
      )}
      <p className="text-[14px] text-ink/80 mt-1">${product.price.toLocaleString()}</p>
    </Link>
  );
}

export default function HorizontalProductRail({ products }: { products: Product[] }) {
  const targetRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });

  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-62%"]);

  if (products.length === 0) {
    return (
      <EmptyState
        title="No best sellers yet"
        message="Once orders start coming in, top products will show up here."
        actionLabel="Browse products"
        actionHref="/products"
      />
    );
  }

  if (reduced || products.length <= 2) {
    return (
      <div className="flex gap-5 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2 -mx-1 px-1">
        {products.map((p) => (
          <RailCard key={p.id} product={p} />
        ))}
      </div>
    );
  }

  return (
    <>
      {/* Desktop: scroll-driven pinned rail */}
      <div ref={targetRef} className="hidden md:block relative h-[220vh] -mx-5 sm:-mx-8">
        <div className="sticky top-0 h-screen flex items-center overflow-hidden">
          <motion.div style={{ x }} className="flex gap-6 pl-5 sm:pl-8 pr-[40vw]">
            {products.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, rotateY: -18, scale: 0.92 }}
                whileInView={{ opacity: 1, rotateY: 0, scale: 1 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ type: "spring", stiffness: 200, damping: 22, delay: i * 0.05 }}
                className="[perspective:1000px]"
              >
                <RailCard product={p} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Mobile: snap scroll rail */}
      <div className="md:hidden flex gap-5 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2 -mx-1 px-1">
        {products.map((p) => (
          <RailCard key={p.id} product={p} />
        ))}
      </div>
    </>
  );
}
