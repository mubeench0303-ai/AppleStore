import { apiFetch, apiFetchWithMeta } from "@/lib/api-client";
import type { Product, Category, Review } from "@/types";

export interface ProductQuery {
  search?: string;
  category_id?: number;
  min_price?: number;
  max_price?: number;
  sort?: "price_asc" | "price_desc" | "newest" | "popularity";
  page?: number;
  page_size?: number;
}

function toQueryString(q: ProductQuery) {
  const params = new URLSearchParams();
  Object.entries(q).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") params.set(k, String(v));
  });
  const s = params.toString();
  return s ? `?${s}` : "";
}

export const productService = {
  list(query: ProductQuery = {}) {
    return apiFetchWithMeta<Product[]>(`/products${toQueryString(query)}`);
  },

  getBySlug(slug: string) {
    return apiFetch<{ product: Product; related: Product[] }>(`/products/${slug}`);
  },

  categories() {
    return apiFetch<Category[]>("/categories");
  },

  reviews(productId: number) {
    return apiFetch<Review[]>(`/products/${productId}/reviews`);
  },

  addReview(productId: number, rating: number, comment: string) {
    return apiFetch<Review>("/reviews", {
      method: "POST",
      body: JSON.stringify({ product_id: productId, rating, comment }),
    });
  },

  // --- Admin ---
  adminList(page = 1, pageSize = 50) {
    return apiFetchWithMeta<Product[]>(`/admin/products?page=${page}&page_size=${pageSize}`);
  },

  create(payload: Partial<Product>) {
    return apiFetch<Product>("/admin/products", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  update(id: number, payload: Partial<Product>) {
    return apiFetch<Product>(`/admin/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  remove(id: number) {
    return apiFetch<{ message: string }>(`/admin/products/${id}`, { method: "DELETE" });
  },
};
