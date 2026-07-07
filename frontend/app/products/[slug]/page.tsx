import ProductDetailClient from "./ProductDetailClient";
import { productService } from "@/lib/services/product.service";

export const revalidate = 60;

const CACHE = { revalidate: 60 as const };

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  try {
    const { product, related } = await productService.getBySlug(slug, CACHE);
    const reviews = await productService.reviews(product.id, CACHE);

    return (
      <ProductDetailClient
        slug={slug}
        initialProduct={product}
        initialRelated={related || []}
        initialReviews={reviews}
      />
    );
  } catch {
    return <ProductDetailClient slug={slug} />;
  }
}
