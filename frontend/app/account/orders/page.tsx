"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Order } from "@/types";
import { orderService } from "@/lib/services/order.service";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

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
          <div key={i} className="h-20 bg-surface rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted text-[15px]">You haven&apos;t placed any orders yet.</p>
        <Link href="/products" className="text-accent text-sm font-medium hover:underline mt-2 inline-block">
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {orders.map((order, i) => (
        <motion.li
          key={order.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <Link
            href={`/account/orders/${order.id}`}
            className="flex items-center justify-between p-5 rounded-2xl border border-border hover:shadow-card transition-shadow"
          >
            <div>
              <p className="text-[14px] font-medium">Order #{order.user_order_number}</p>
              <p className="text-[13px] text-muted mt-0.5">
                {new Date(order.created_at).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[14px] font-medium">${order.total_amount.toFixed(2)}</span>
              <span
                className={`text-[12px] px-3 py-1 rounded-full capitalize ${STATUS_STYLES[order.status] || "bg-surface"}`}
              >
                {order.status}
              </span>
            </div>
          </Link>
        </motion.li>
      ))}
    </ul>
  );
}
