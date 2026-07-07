"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { Minus, Plus, Star } from "lucide-react";
import toast from "react-hot-toast";
import type { Product, Review } from "@/types";
import { productService } from "@/lib/services/product.service";
import { useCartStore } from "@/store/cart.store";
import { useAuthStore } from "@/store/auth.store";
import ProductGrid from "@/components/products/ProductGrid";

export default function ProductDetailClient({
  slug,
  initialProduct = null,
  initialRelated = [],
  initialReviews = [],
}: {
  slug: string;
  initialProduct?: Product | null;
  initialRelated?: Product[];
  initialReviews?: Review[];
}) {
  const hasInitialData = !!initialProduct;
  const skipInitialLoad = useRef(hasInitialData);

  const [product, setProduct] = useState<Product | null>(initialProduct);
  const [related, setRelated] = useState<Product[]>(initialRelated);
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [isLoading, setIsLoading] = useState(!hasInitialData);
  const addItem = useCartStore((s) => s.addItem);
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  useEffect(() => {
    if (skipInitialLoad.current) {
      skipInitialLoad.current = false;
      return;
    }

    setIsLoading(true);
    productService
      .getBySlug(slug)
      .then(({ product, related }) => {
        setProduct(product);
        setRelated(related || []);
        return productService.reviews(product.id);
      })
      .then(setReviews)
      .catch(() => setProduct(null))
      .finally(() => setIsLoading(false));
  }, [slug]);

  async function handleAdd() {
    if (!product) return;
    if (!user) {
      router.push(`/login?redirect=/products/${slug}`);
      return;
    }
    try {
      await addItem(product.id, quantity);
      toast.success(`Added ${quantity} × ${product.name}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't add to bag");
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-16 grid md:grid-cols-2 gap-12">
        <div className="aspect-square rounded-3xl bg-surface animate-pulse" />
        <div className="space-y-4 pt-4">
          <div className="h-8 w-2/3 bg-surface rounded-full animate-pulse" />
          <div className="h-5 w-1/3 bg-surface rounded-full animate-pulse" />
          <div className="h-24 bg-surface rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-24 text-center">
        <p className="text-lg text-muted">Product not found.</p>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images.map((i) => i.image_url) : [product.image_url];
  const avgRating = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  return (
    <div className="mx-auto max-w-7xl px-5 sm:px-8 py-10 sm:py-16">
      <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
        <div>
          <motion.div
            key={activeImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="aspect-square rounded-3xl bg-surface relative overflow-hidden"
          >
            <Image src={images[activeImage]} alt={product.name} fill className="object-cover" priority />
          </motion.div>
          {images.length > 1 && (
            <div className="flex gap-3 mt-4">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`h-16 w-16 rounded-xl overflow-hidden relative border-2 ${
                    activeImage === i ? "border-accent" : "border-transparent"
                  }`}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <p className="text-[13px] text-muted mb-1">{product.category_name}</p>
          <h1 className="font-heading text-3xl sm:text-4xl font-semibold tracking-tight">{product.name}</h1>
          <p className="text-[15px] text-muted mt-2">{product.model_variant}</p>

          {reviews.length > 0 && (
            <div className="flex items-center gap-1.5 mt-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={i < Math.round(avgRating) ? "fill-accent text-accent" : "text-border"}
                />
              ))}
              <span className="text-[13px] text-muted ml-1">({reviews.length})</span>
            </div>
          )}

          <p className="text-2xl font-semibold mt-6">${product.price.toLocaleString()}</p>
          <p className="text-[14px] text-ink/70 mt-4 leading-relaxed max-w-md">{product.description}</p>

          <p className="text-[13px] mt-4 text-muted">
            {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : "Currently out of stock"}
          </p>

          <div className="flex items-center gap-4 mt-6">
            <div className="flex items-center border border-border rounded-full">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="h-11 w-11 flex items-center justify-center hover:bg-surface rounded-full"
              >
                <Minus size={14} />
              </button>
              <span className="w-8 text-center text-[14px]">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="h-11 w-11 flex items-center justify-center hover:bg-surface rounded-full"
              >
                <Plus size={14} />
              </button>
            </div>

            <motion.button
              whileTap={{ scale: 0.96 }}
              whileHover={{ scale: 1.02 }}
              onClick={handleAdd}
              disabled={product.stock_quantity === 0}
              className="flex-1 bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:hover:bg-accent text-white rounded-full py-3.5 text-[15px] font-medium transition-colors"
            >
              Add to Bag
            </motion.button>
          </div>
        </motion.div>
      </div>

      {reviews.length > 0 && (
        <section className="mt-20 max-w-2xl">
          <h2 className="font-heading text-xl font-semibold mb-6">Customer reviews</h2>
          <ul className="space-y-6">
            {reviews.map((r) => (
              <li key={r.id} className="border-b border-border pb-6">
                <div className="flex items-center gap-1.5 mb-1.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={13} className={i < r.rating ? "fill-accent text-accent" : "text-border"} />
                  ))}
                </div>
                <p className="text-[14px] text-ink/80">{r.comment}</p>
                <p className="text-[12px] text-muted mt-1.5">{r.user_name}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="font-heading text-xl font-semibold mb-6">You might also like</h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
