import type { Product } from "@/types";

export type ProductBadge = {
  label: string;
  className: string;
};

export function getProductBadges(product: Product): ProductBadge[] {
  const badges: ProductBadge[] = [];

  if ((product.total_sold ?? 0) >= 3) {
    badges.push({ label: "Best seller", className: "bg-accent/90 text-white" });
  }

  const ageDays = (Date.now() - new Date(product.created_at).getTime()) / (1000 * 60 * 60 * 24);
  if (ageDays <= 45) {
    badges.push({ label: "New", className: "bg-success/90 text-white" });
  }

  if (product.stock_quantity > 0 && product.stock_quantity <= 5) {
    badges.push({ label: "Low stock", className: "bg-amber-500/90 text-white" });
  }

  if (product.stock_quantity === 0) {
    badges.push({ label: "Sold out", className: "bg-darksoft/80 text-white" });
  }

  return badges.slice(0, 2);
}

export function categorySlugFromName(name?: string) {
  if (!name) return "";
  return name.toLowerCase().replace(/\s+/g, "-");
}
