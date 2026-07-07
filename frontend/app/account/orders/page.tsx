"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, Package } from "lucide-react";
import type { Order } from "@/types";
import { orderService } from "@/lib/services/order.service";
import OrderStatusBadge from "@/components/account/OrderStatusBadge";
import EmptyState from "@/components/ui/EmptyState";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    orderService
      .myOrders()
      .then(setOrders)
      .catch(() => setOrders([]));
  }, []);

  if (orders === null) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 bg-surface rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        title="No orders yet"
        message="When you place an order, it will show up here with tracking and delivery updates."
        actionLabel="Start shopping"
        actionHref="/products"
      />
    );
  }

  return (
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
  );
}
