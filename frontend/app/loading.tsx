export default function Loading() {
  return (
    <div className="container-page py-10 animate-pulse space-y-8">
      <div className="h-10 w-64 rounded-lg bg-surface" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="aspect-square rounded-3xl bg-surface" />
            <div className="h-4 w-3/4 rounded bg-surface" />
            <div className="h-4 w-1/2 rounded bg-surface" />
          </div>
        ))}
      </div>
    </div>
  );
}
