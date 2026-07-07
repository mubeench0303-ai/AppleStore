"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, LayoutGroup, useScroll, useTransform } from "framer-motion";
import { Minus, Plus, Star } from "lucide-react";
import toast from "react-hot-toast";
import type { Product, Review } from "@/types";
import { productService } from "@/lib/services/product.service";
import { useCartStore } from "@/store/cart.store";
import { useAuthStore } from "@/store/auth.store";
import { useFlyToCart } from "@/components/motion/FlyToCartProvider";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";
import ProductGrid from "@/components/products/ProductGrid";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { categorySlugFromName, getProductBadges } from "@/lib/product-badges";

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
  const pageRef = useRef<HTMLDivElement>(null);
  const addSectionRef = useRef<HTMLDivElement>(null);

  const [product, setProduct] = useState<Product | null>(initialProduct);
  const [related, setRelated] = useState<Product[]>(initialRelated);
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [isLoading, setIsLoading] = useState(!hasInitialData);
  const [showStickyBar, setShowStickyBar] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const openDrawer = useCartStore((s) => s.openDrawer);
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const { flyToCart } = useFlyToCart();
  const mainImageRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  const { scrollYProgress } = useScroll({
    target: pageRef,
    offset: ["start start", "end end"],
  });
  const infoX = useTransform(scrollYProgress, [0, 0.25], reduced ? [0, 0] : [0, -8]);

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

  useEffect(() => {
    const node = addSectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { threshold: 0, rootMargin: "0px 0px -80px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [product]);

  async function handleAdd() {
    if (!product) return;
    if (!user) {
      router.push(`/login?redirect=/products/${slug}`);
      return;
    }
    try {
      await addItem(product.id, quantity);
      if (mainImageRef.current && product.image_url && !reduced) {
        await flyToCart(product.image_url, mainImageRef.current);
      }
      openDrawer();
      toast.success(`Added ${quantity} × ${product.name}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't add to bag");
    }
  }

  if (isLoading) {
    return (
      <div className="container-page py-16 grid md:grid-cols-2 gap-12">
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
      <div className="container-page py-24 text-center">
        <p className="text-lg text-muted">Product not found.</p>
      </div>
    );
  }

  const images =
    product.images && product.images.length > 0 ? product.images.map((i) => i.image_url) : [product.image_url];

  const reviewCount = product.review_count ?? reviews.length;
  const avgRating =
    product.avg_rating && product.avg_rating > 0
      ? product.avg_rating
      : reviews.length
        ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
        : 0;

  const catSlug = categorySlugFromName(product.category_name);
  const badges = getProductBadges(product);

  return (
    <LayoutGroup id="product-grid">
      <div ref={pageRef} className="container-page py-8 sm:py-12 pb-28 md:pb-16">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Shop", href: "/products" },
            ...(product.category_name
              ? [{ label: product.category_name, href: catSlug ? `/products?category=${catSlug}` : "/products" }]
              : []),
            { label: product.name },
          ]}
        />

        <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
          <div className="md:sticky md:top-24 md:self-start">
            <motion.div
              ref={mainImageRef}
              layoutId={activeImage === 0 ? `product-image-${product.id}` : undefined}
              className="aspect-square rounded-3xl bg-surface relative overflow-hidden shadow-card"
            >
              <motion.div
                key={activeImage}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 28 }}
                className="absolute inset-0"
              >
                <Image src={images[activeImage]} alt={product.name} fill className="object-cover" priority />
              </motion.div>
              {badges.length > 0 && (
                <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
                  {badges.map((b) => (
                    <span key={b.label} className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${b.className}`}>
                      {b.label}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
            {images.length > 1 && (
              <div className="flex gap-3 mt-4 overflow-x-auto no-scrollbar">
                {images.map((img, i) => (
                  <motion.button
                    key={i}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => setActiveImage(i)}
                    className={`h-16 w-16 shrink-0 rounded-xl overflow-hidden relative border-2 transition-colors ${
                      activeImage === i ? "border-accent shadow-card" : "border-transparent"
                    }`}
                  >
                    <Image src={img} alt="" fill className="object-cover" />
                  </motion.button>
                ))}
              </div>
            )}
          </div>

          <motion.div style={{ x: infoX }}>
            <p className="text-[13px] text-muted mb-1">{product.category_name}</p>
            <h1 className="font-heading text-3xl sm:text-4xl font-semibold tracking-tight">{product.name}</h1>
            <p className="text-[15px] text-muted mt-2">{product.model_variant}</p>

            {(reviewCount > 0 || (product.total_sold ?? 0) > 0) && (
              <p className="flex items-center flex-wrap gap-x-3 gap-y-1 text-[13px] text-muted mt-3">
                {reviewCount > 0 && (
                  <span className="inline-flex items-center gap-1.5">
                    <Star size={14} className="fill-accent text-accent shrink-0" />
                    <span className="font-medium text-ink">{avgRating.toFixed(1)}</span>
                    <span>({String(reviewCount).padStart(2, "0")})</span>
                  </span>
                )}
                {(product.total_sold ?? 0) > 0 && <span>{product.total_sold} sold</span>}
              </p>
            )}

            <p className="text-2xl sm:text-3xl font-semibold mt-2">${product.price.toLocaleString()}</p>
            <p className="text-[14px] text-ink/70 mt-4 leading-relaxed max-w-md">{product.description}</p>

            <p className="text-[13px] mt-4 text-muted">
              {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : "Currently out of stock"}
            </p>

            <div ref={addSectionRef} className="flex items-center gap-4 mt-6">
              <div className="flex items-center border border-border rounded-full bg-card shadow-card">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="h-11 w-11 flex items-center justify-center hover:bg-surface rounded-full"
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </button>
                <span className="w-8 text-center text-[14px]">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="h-11 w-11 flex items-center justify-center hover:bg-surface rounded-full"
                  aria-label="Increase quantity"
                >
                  <Plus size={14} />
                </button>
              </div>

              <motion.button
                whileTap={{ scale: 0.96 }}
                whileHover={{ scale: 1.01 }}
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
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ type: "spring", stiffness: 200, damping: 26 }}
            className="mt-20 max-w-2xl"
          >
            <h2 className="font-heading text-xl font-semibold mb-6">Customer reviews</h2>
            <ul className="space-y-6">
              {reviews.map((r, i) => (
                <motion.li
                  key={r.id}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06, type: "spring", stiffness: 300, damping: 28 }}
                  className="border-b border-border pb-6"
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} size={13} className={j < r.rating ? "fill-accent text-accent" : "text-border"} />
                    ))}
                  </div>
                  <p className="text-[14px] text-ink/80">{r.comment}</p>
                  <p className="text-[12px] text-muted mt-1.5">{r.user_name}</p>
                </motion.li>
              ))}
            </ul>
          </motion.section>
        )}

        {related.length > 0 && (
          <section className="mt-20">
            <h2 className="font-heading text-xl font-semibold mb-6">You might also like</h2>
            <ProductGrid products={related} />
          </section>
        )}
      </div>

      {/* Mobile sticky add-to-bag bar */}
      <motion.div
        initial={false}
        animate={{ y: showStickyBar ? 0 : 120 }}
        transition={{ type: "spring", stiffness: 380, damping: 32 }}
        className="md:hidden fixed bottom-0 inset-x-0 z-40 glass-nav border-t border-border/60 px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      >
        <div className="flex items-center gap-4">
          <div className="min-w-0">
            <p className="text-[12px] text-muted truncate">{product.name}</p>
            <p className="text-[16px] font-semibold">${product.price.toLocaleString()}</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleAdd}
            disabled={product.stock_quantity === 0}
            className="flex-1 bg-accent hover:bg-accent-hover disabled:opacity-40 text-white rounded-full py-3.5 text-[14px] font-medium"
          >
            Add to Bag
          </motion.button>
        </div>
      </motion.div>
    </LayoutGroup>
  );
}
