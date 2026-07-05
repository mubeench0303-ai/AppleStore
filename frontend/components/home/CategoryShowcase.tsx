"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import type { Category } from "@/types";

const IMAGES: Record<string, string> = {
  iphone: "https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=600",
  macbook: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600",
  ipad: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600",
  "apple-watch": "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600",
  airpods: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600",
  accessories: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600",
};

export default function CategoryShowcase({ categories }: { categories: Category[] }) {
  return (
    <section className="mx-auto max-w-7xl px-5 sm:px-8 py-16 sm:py-24">
      <h2 className="font-heading text-2xl sm:text-3xl font-semibold tracking-tight mb-8">Shop by category</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            whileHover={{ y: -4 }}
          >
            <Link
              href={`/products?category=${cat.slug}`}
              className="relative block aspect-[4/3] rounded-3xl bg-surface overflow-hidden group"
            >
              {IMAGES[cat.slug] && (
                <Image
                  src={IMAGES[cat.slug]}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-transparent" />
              <span className="absolute bottom-4 left-5 text-white font-heading text-lg font-semibold">
                {cat.name}
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
