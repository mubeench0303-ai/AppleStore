"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, Package, ShoppingBag } from "lucide-react";
import type { Order } from "@/types";
import { orderService } from "@/lib/services/order.service";
import OrderStatusBadge from "@/components/account/OrderStatusBadge";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    orderService
      .myOrders()
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch(() => setOrders([]));
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-heading text-lg font-semibold">Order history</h2>
        <p className="text-[13px] text-muted mt-1">Track past purchases, delivery status, and order details.</p>
      </div>

      {orders === null ? (
        <p className="text-[14px] text-muted py-8">Loading your orders…</p>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 sm:py-16 rounded-3xl border border-dashed border-border bg-surface/40">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-surface text-muted mb-4">
            <Package size={22} strokeWidth={1.5} />
          </div>
          <p className="text-[15px] font-medium text-ink">You haven&apos;t placed any orders yet</p>
          <p className="text-[13px] text-muted mt-1 max-w-sm mx-auto leading-relaxed">
            When you complete a purchase, your orders will appear here with status updates and receipts.
          </p>
          <Link
            href="/products"
            className="mt-5 inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white rounded-full px-6 py-2.5 text-[14px] font-medium transition-colors"
          >
            <ShoppingBag size={16} />
            Browse products
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {orders.map((order, i) => (
            <motion.li
              key={order.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, type: "spring", stiffness: 300, damping: 28 }}
            >
              <Link
                href={`/account/orders/${order.id}`}
                className="group flex items-center justify-between gap-4 p-5 rounded-2xl border border-border bg-card hover:shadow-card hover:border-border/80 transition-all"
              >
                <div className="flex items-start gap-4 min-w-0">
                  <div className="hidden sm:flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface text-muted">
                    <Package size={20} strokeWidth={1.5} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[14px] font-semibold">Order #{order.user_order_number}</p>
                    <p className="text-[13px] text-muted mt-0.5">
                      {new Date(order.created_at).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                      {order.items?.length ? ` · ${order.items.length} item${order.items.length !== 1 ? "s" : ""}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[14px] font-semibold">${order.total_amount.toFixed(2)}</span>
                  <OrderStatusBadge status={order.status} />
                  <ChevronRight
                    size={16}
                    className="text-muted group-hover:text-ink group-hover:translate-x-0.5 transition-all hidden sm:block"
                  />
                </div>
              </Link>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}
