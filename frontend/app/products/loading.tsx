import ProductCardSkeleton from "@/components/products/ProductCardSkeleton";

export default function ProductsLoading() {
  return (
    <div className="container-page py-8 sm:py-10 pb-16 animate-pulse">
      <div className="h-10 w-72 max-w-full rounded-lg bg-surface mb-3" />
      <div className="h-4 w-96 max-w-full rounded bg-surface mb-8" />
      <div className="h-12 w-full max-w-xl rounded-full bg-surface mb-6" />
      <div className="h-10 w-full rounded-xl bg-surface mb-6" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
