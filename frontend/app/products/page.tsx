import { Suspense } from "react";
import ProductsPageClient from "./ProductsPageClient";

export const metadata = {
  title: "Shop All Products — Apple Store",
};

export default function ProductsPage() {
  return (
    <Suspense fallback={null}>
      <ProductsPageClient />
    </Suspense>
  );
}
