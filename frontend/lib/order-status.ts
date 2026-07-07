import type { OrderStatus } from "@/types";

export const ORDER_STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  paid: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export const ORDER_TIMELINE_STEPS = [
  { key: "pending", label: "Placed" },
  { key: "paid", label: "Paid" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
] as const;

export function orderTimelineIndex(status: OrderStatus) {
  if (status === "cancelled") return -1;
  return ORDER_TIMELINE_STEPS.findIndex((s) => s.key === status);
}
