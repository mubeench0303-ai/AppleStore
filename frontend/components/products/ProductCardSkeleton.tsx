export default function ProductCardSkeleton() {
  return (
    <div>
      <div className="aspect-square rounded-3xl bg-surface animate-pulse mb-4" />
      <div className="h-3 w-16 bg-surface rounded-full animate-pulse mb-2" />
      <div className="h-4 w-32 bg-surface rounded-full animate-pulse mb-2" />
      <div className="h-4 w-12 bg-surface rounded-full animate-pulse" />
    </div>
  );
}
