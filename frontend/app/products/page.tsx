import { Suspense } from "react";
import ProductsPageClient from "./ProductsPageClient";
import { productService } from "@/lib/services/product.service";
import { categoryService } from "@/lib/services/category.service";

export const metadata = {
  title: "Shop All Products — Apple Store",
};

export const revalidate = 60;

const CACHE = { revalidate: 60 as const };

async function getProductsPageData(searchParams: {
  search?: string;
  q?: string;
  category?: string;
}) {
  const search = searchParams.search || searchParams.q || "";
  const categories = await categoryService.list(CACHE);
  const categoryId = searchParams.category
    ? categories.find((c) => c.slug === searchParams.category)?.id
    : undefined;

  const { data: products, meta } = await productService.list(
    {
      search: search || undefined,
      category_id: categoryId,
      sort: "newest",
      page: 1,
      page_size: 12,
    },
    CACHE
  );

  return {
    categories,
    products,
    pages: meta?.pages || 1,
    searchQuery: search,
    categorySlug: searchParams.category || "",
  };
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; q?: string; category?: string }>;
}) {
  const sp = await searchParams;
  const initial = await getProductsPageData(sp);

  return (
    <Suspense fallback={null}>
      <ProductsPageClient
        initialCategories={initial.categories}
        initialProducts={initial.products}
        initialPages={initial.pages}
        initialSearchQuery={initial.searchQuery}
        initialCategorySlug={initial.categorySlug}
      />
    </Suspense>
  );
}
