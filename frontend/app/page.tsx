import Hero from "@/components/home/Hero";
import TrustFeatures from "@/components/home/TrustFeatures";
import CategoryShowcase from "@/components/home/CategoryShowcase";
import HomeSection from "@/components/home/HomeSection";
import FeatureBanner from "@/components/home/FeatureBanner";
import HorizontalProductRail from "@/components/home/HorizontalProductRail";
import ProductGrid from "@/components/products/ProductGrid";
import { productService } from "@/lib/services/product.service";
import { categoryService } from "@/lib/services/category.service";
import type { Product, Category } from "@/types";

export const revalidate = 60;

async function getHomeData() {
  const cache = { revalidate: 60 as const };
  try {
    const [{ data: newArrivals }, { data: bestSellers }, categories] = await Promise.all([
      productService.list({ sort: "newest", page_size: 8 }, cache),
      productService.list({ sort: "popularity", page_size: 6 }, cache),
      categoryService.list(cache),
    ]);
    return { newArrivals, bestSellers, categories };
  } catch {
    return {
      newArrivals: [] as Product[],
      bestSellers: [] as Product[],
      categories: [] as Category[],
    };
  }
}

export default async function HomePage() {
  const { newArrivals, bestSellers, categories } = await getHomeData();

  return (
    <div>
      <Hero />
      <TrustFeatures />
      <CategoryShowcase categories={categories} />

      <HomeSection
        title="Best sellers"
        subtitle="Scroll to explore customer favorites — most popular picks right now."
        href="/products"
        linkLabel="Shop all"
        className="!pb-8"
      >
        <HorizontalProductRail products={bestSellers} />
      </HomeSection>

      <FeatureBanner />

      <HomeSection
        title="New arrivals"
        subtitle="The latest additions to our lineup."
        href="/products"
        linkLabel="View all"
        className="pt-0"
      >
        <ProductGrid
          products={newArrivals}
          emptyTitle="Catalog coming soon"
          emptyMessage="Products will appear here once the backend is seeded and running."
          emptyActionLabel="Refresh later"
          emptyActionHref="/"
        />
      </HomeSection>
    </div>
  );
}
