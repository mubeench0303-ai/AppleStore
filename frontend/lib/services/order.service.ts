import { apiFetch } from "@/lib/api-client";
import type { Order } from "@/types";

export const orderService = {
  checkout(shippingAddress: string) {
    return apiFetch<{ order: Order; client_secret?: string; payment_error?: string }>("/checkout", {
      method: "POST",
      body: JSON.stringify({ shipping_address: shippingAddress }),
    });
  },
  myOrders() {
    return apiFetch<Order[]>("/orders");
  },
  getOne(id: number) {
    return apiFetch<Order>(`/orders/${id}`);
  },

  confirmPayment(id: number) {
    return apiFetch<Order>(`/orders/${id}/confirm-payment`, { method: "POST" });
  },

  // --- Admin ---
  adminList() {
    return apiFetch<Order[]>("/admin/orders");
  },
  adminGetOne(id: number) {
    return apiFetch<Order>(`/admin/orders/${id}`);
  },
  updateStatus(id: number, status: string) {
    return apiFetch<{ message: string }>(`/admin/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },
  stats() {
    return apiFetch<{ total_orders: number; total_revenue: number; total_products: number }>("/admin/stats");
  },
};
