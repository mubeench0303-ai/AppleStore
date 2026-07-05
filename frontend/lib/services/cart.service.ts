import { apiFetch } from "@/lib/api-client";
import type { Cart } from "@/types";

export const cartService = {
  get() {
    return apiFetch<Cart>("/cart");
  },
  addItem(productId: number, quantity = 1) {
    return apiFetch<Cart>("/cart/items", {
      method: "POST",
      body: JSON.stringify({ product_id: productId, quantity }),
    });
  },
  updateItem(productId: number, quantity: number) {
    return apiFetch<Cart>("/cart/items", {
      method: "PUT",
      body: JSON.stringify({ product_id: productId, quantity }),
    });
  },
  removeItem(productId: number) {
    return apiFetch<Cart>("/cart/items", {
      method: "DELETE",
      body: JSON.stringify({ product_id: productId }),
    });
  },
};
