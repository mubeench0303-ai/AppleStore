import { apiFetch } from "@/lib/api-client";
import type { Category } from "@/types";

export const categoryService = {
  list() {
    return apiFetch<Category[]>("/categories");
  },
  create(name: string) {
    return apiFetch<Category>("/admin/categories", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
  },
  update(id: number, name: string) {
    return apiFetch<{ message: string }>(`/admin/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify({ name }),
    });
  },
  remove(id: number) {
    return apiFetch<{ message: string }>(`/admin/categories/${id}`, { method: "DELETE" });
  },
};
