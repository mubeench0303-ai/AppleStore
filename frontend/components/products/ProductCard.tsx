"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Plus, Star } from "lucide-react";
import type { Product } from "@/types";
import { useCartStore } from "@/store/cart.store";
import { useAuthStore } from "@/store/auth.store";
import { useFlyToCart } from "@/components/motion/FlyToCartProvider";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";
import { getProductBadges } from "@/lib/product-badges";

export default function ProductCard({
  product,
  layoutMorph = false,
}: {
  product: Product;
  index?: number;
  layoutMorph?: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const addItem = useCartStore((s) => s.addItem);
  const openDrawer = useCartStore((s) => s.openDrawer);
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const { flyToCart } = useFlyToCart();
  const reduced = usePrefersReducedMotion();

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [9, -9]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-9, 9]), { stiffness: 300, damping: 30 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reduced || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handleMouseLeave() {
    mx.set(0);
    my.set(0);
  }

  async function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      router.push(`/login?redirect=/products`);
      return;
    }
    try {
      await addItem(product.id, 1);
      if (imageRef.current && product.image_url && !reduced) {
        await flyToCart(product.image_url, imageRef.current);
      }
      openDrawer();
      toast.success(`Added ${product.name}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't add to bag");
    }
  }

  const badges = getProductBadges(product);

  return (
    <motion.div
      ref={cardRef}
      layout={layoutMorph}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={
        reduced
          ? undefined
          : {
              rotateX,
              rotateY,
              transformPerspective: 1000,
            }
      }
      className="group"
    >
      <Link href={`/products/${product.slug}`} className="block">
        <motion.div
          ref={imageRef}
          layoutId={`product-image-${product.id}`}
          className="relative aspect-square rounded-3xl bg-surface overflow-hidden mb-4 shadow-card"
        >
          {product.image_url && (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover"
            />
          )}
          {badges.length > 0 && (
            <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
              {badges.map((badge) => (
                <span
                  key={badge.label}
                  className={`text-[10px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm ${badge.className}`}
                >
                  {badge.label}
                </span>
              ))}
            </div>
          )}
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={handleAdd}
            disabled={product.stock_quantity === 0}
            aria-label={`Add ${product.name} to bag`}
            className="absolute bottom-3 right-3 h-10 w-10 rounded-full bg-white shadow-soft flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 z-10"
          >
            <Plus size={18} className="text-ink" />
          </motion.button>
        </motion.div>
        <div className="px-1">
          <p className="text-[13px] text-muted">{product.category_name}</p>
          <h3 className="text-[15px] font-medium mt-0.5 leading-snug">{product.name}</h3>
          {((product.review_count ?? 0) > 0 || (product.total_sold ?? 0) > 0) && (
            <p className="flex items-center gap-1.5 text-[12px] text-muted mt-1">
              {(product.review_count ?? 0) > 0 && (
                <>
                  <Star size={12} className="fill-accent text-accent shrink-0" aria-hidden />
                  <span>{(product.avg_rating ?? 0).toFixed(1)}</span>
                  <span>({String(product.review_count).padStart(2, "0")})</span>
                </>
              )}
              {(product.total_sold ?? 0) > 0 && <span>{product.total_sold} sold</span>}
            </p>
          )}
          <p className="text-[14px] text-ink/80 mt-1">${product.price.toLocaleString()}</p>
        </div>
      </Link>
    </motion.div>
  );
}
