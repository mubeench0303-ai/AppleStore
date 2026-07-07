import Hero from "@/components/home/Hero";
import CategoryShowcase from "@/components/home/CategoryShowcase";
import ProductGrid from "@/components/products/ProductGrid";
import { productService } from "@/lib/services/product.service";
import { categoryService } from "@/lib/services/category.service";
import type { Product, Category } from "@/types";

export const revalidate = 60;

async function getHomeData() {
  const cache = { revalidate: 60 as const };
  try {
    const [{ data: products }, categories] = await Promise.all([
      productService.list({ sort: "newest", page_size: 8 }, cache),
      categoryService.list(cache),
    ]);
    return { products, categories };
  } catch {
    return { products: [] as Product[], categories: [] as Category[] };
  }
}

export default async function HomePage() {
  const { products, categories } = await getHomeData();

  return (
    <div>
      <Hero />
      <CategoryShowcase categories={categories} />
      <section className="mx-auto max-w-7xl px-5 sm:px-8 py-16 sm:py-24">
        <div className="flex items-end justify-between mb-8">
          <h2 className="font-heading text-2xl sm:text-3xl font-semibold tracking-tight">New arrivals</h2>
          <a href="/products" className="text-accent text-sm font-medium hover:underline">
            Shop all
          </a>
        </div>
        <ProductGrid products={products} emptyMessage="Products will appear here once the backend is seeded and running." />
      </section>
    </div>
  );
}
