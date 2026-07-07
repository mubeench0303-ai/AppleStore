"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { motion, useScroll, useTransform } from "framer-motion";
import { Search } from "lucide-react";
import type { Product, Category } from "@/types";
import { productService } from "@/lib/services/product.service";
import ProductGrid from "@/components/products/ProductGrid";
import ProductFilters, { FiltersState } from "@/components/products/ProductFilters";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";

export default function ProductsPageClient({
  initialCategories = [],
  initialProducts = [],
  initialPages = 1,
}: {
  initialCategories?: Category[];
  initialProducts?: Product[];
  initialPages?: number;
  initialSearchQuery?: string;
  initialCategorySlug?: string;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const reduced = usePrefersReducedMotion();

  const searchQuery = searchParams.get("search") || searchParams.get("q") || "";
  const categorySlug = searchParams.get("category") || "";

  const hasInitialData = initialProducts.length > 0 || initialCategories.length > 0;
  const skipInitialLoad = useRef(hasInitialData);
  const pageRef = useRef<HTMLDivElement>(null);

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [isLoading, setIsLoading] = useState(!hasInitialData);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(initialPages);
  const [filters, setFilters] = useState<FiltersState>({ sort: "newest" });
  const [searchInput, setSearchInput] = useState(searchQuery);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { scrollYProgress } = useScroll({
    target: pageRef,
    offset: ["start start", "start end"],
  });

  const headerScale = useTransform(scrollYProgress, [0, 0.15], reduced ? [1, 1] : [1, 0.88]);
  const headerY = useTransform(scrollYProgress, [0, 0.15], reduced ? [0, 0] : [0, -12]);
  const headerOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.72]);

  useEffect(() => {
    if (categories.length > 0) return;
    productService.categories().then(setCategories).catch(() => setCategories([]));
  }, [categories.length]);

  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    if (categories.length === 0) return;
    if (!categorySlug) {
      setFilters((f) => (f.categoryId ? { ...f, categoryId: undefined } : f));
      return;
    }
    const match = categories.find((c) => c.slug === categorySlug);
    if (match) setFilters((f) => ({ ...f, categoryId: match.id }));
  }, [categorySlug, categories]);

  const updateUrl = useCallback(
    (updates: { search?: string; category?: string | null }) => {
      const params = new URLSearchParams(searchParams.toString());

      if (updates.search !== undefined) {
        const trimmed = updates.search.trim();
        if (trimmed) params.set("search", trimmed);
        else {
          params.delete("search");
          params.delete("q");
        }
      }

      if (updates.category !== undefined) {
        if (updates.category) params.set("category", updates.category);
        else params.delete("category");
      }

      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      if (searchInput.trim() === searchQuery.trim()) return;
      updateUrl({ search: searchInput });
      setPage(1);
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchInput, searchQuery, updateUrl]);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, meta } = await productService.list({
        search: searchQuery || undefined,
        category_id: filters.categoryId,
        min_price: filters.minPrice,
        max_price: filters.maxPrice,
        sort: filters.sort,
        page,
        page_size: 12,
      });
      setProducts(data);
      setPages(meta?.pages || 1);
    } catch {
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, filters, page]);

  useEffect(() => {
    if (skipInitialLoad.current) {
      skipInitialLoad.current = false;
      return;
    }
    load();
  }, [load]);

  function handleFiltersChange(next: FiltersState) {
    setFilters(next);
    setPage(1);

    if (next.categoryId) {
      const cat = categories.find((c) => c.id === next.categoryId);
      updateUrl({ category: cat?.slug ?? null });
    } else {
      updateUrl({ category: null });
    }
  }

  const activeCategory = categories.find((c) => c.id === filters.categoryId);
  const pageTitle = searchQuery
    ? `Results for "${searchQuery}"`
    : activeCategory
      ? activeCategory.name
      : "Shop all products";

  const emptyMessage = searchQuery
    ? `No products found for "${searchQuery}".`
    : "No products match your filters.";

  return (
    <div ref={pageRef} className="container-page py-8 sm:py-10 pb-16">
      <motion.div style={{ scale: headerScale, y: headerY, opacity: headerOpacity, originX: 0, originY: 0 }}>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 24 }}
          className="font-heading text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold tracking-tight"
        >
          {pageTitle}
        </motion.h1>
        <p className="text-[14px] text-muted mt-2 max-w-lg">
          {activeCategory
            ? `Browse our ${activeCategory.name} collection.`
            : "Discover iPhone, Mac, iPad, Watch, AirPods and more."}
        </p>
      </motion.div>

      <div className="relative mt-8 mb-6">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
        <input
          type="search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search products…"
          aria-label="Search products"
          className="w-full max-w-xl border border-border rounded-full pl-11 pr-4 py-3 text-[14px] bg-card focus-ring shadow-card"
        />
        {isLoading && searchInput && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] text-muted">Searching…</span>
        )}
      </div>

      <div className="sticky top-14 z-30 -mx-5 sm:-mx-8 px-5 sm:px-8 py-2 mb-4 glass-nav border-y border-border/50">
        <ProductFilters
          categories={categories}
          filters={filters}
          onChange={handleFiltersChange}
          resultCount={isLoading ? undefined : products.length}
        />
      </div>

      <ProductGrid products={products} isLoading={isLoading} emptyMessage={emptyMessage} layoutMorph />

      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-12">
          {Array.from({ length: pages }).map((_, i) => (
            <motion.button
              key={i}
              whileTap={{ scale: 0.92 }}
              onClick={() => setPage(i + 1)}
              className={`h-9 w-9 rounded-full text-[13px] font-medium transition-colors ${
                page === i + 1
                  ? "bg-accent text-white shadow-card"
                  : "text-ink/80 hover:bg-surface border border-border"
              }`}
            >
              {i + 1}
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}
