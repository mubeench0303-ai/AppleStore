"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import type { Product } from "@/types";
import { useCartStore } from "@/store/cart.store";
import { useAuthStore } from "@/store/auth.store";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const addItem = useCartStore((s) => s.addItem);
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  async function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      router.push(`/login?redirect=/products`);
      return;
    }
    try {
      await addItem(product.id, 1);
      toast.success(`Added ${product.name}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't add to bag");
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
      whileHover={{ y: -4 }}
      className="group"
    >
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-square rounded-3xl bg-surface overflow-hidden mb-4">
          {product.image_url && (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )}
          {product.stock_quantity === 0 && (
            <div className="absolute top-3 left-3 bg-ink/80 text-white text-[11px] px-2.5 py-1 rounded-full">
              Out of stock
            </div>
          )}
          <motion.button
            whileTap={{ scale: 0.85 }}
            whileHover={{ scale: 1.08 }}
            onClick={handleAdd}
            disabled={product.stock_quantity === 0}
            aria-label={`Add ${product.name} to bag`}
            className="absolute bottom-3 right-3 h-10 w-10 rounded-full bg-white shadow-soft flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
          >
            <Plus size={18} className="text-ink" />
          </motion.button>
        </div>
        <div className="px-1">
          <p className="text-[13px] text-muted">{product.category_name}</p>
          <h3 className="text-[15px] font-medium mt-0.5 leading-snug">{product.name}</h3>
          <p className="text-[14px] text-ink/80 mt-1">${product.price.toLocaleString()}</p>
        </div>
      </Link>
    </motion.div>
  );
}
