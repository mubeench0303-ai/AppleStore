"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import type { Order, OrderStatus } from "@/types";
import { orderService } from "@/lib/services/order.service";

const STATUSES: OrderStatus[] = ["pending", "paid", "shipped", "delivered", "cancelled"];

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[] | null>(null);

  function load() {
    orderService.adminList().then(setOrders).catch(() => setOrders([]));
  }

  useEffect(load, []);

  async function handleStatusChange(id: number, status: string) {
    try {
      await orderService.updateStatus(id, status);
      toast.success("Order status updated");
      load();
    } catch {
      toast.error("Couldn't update order status");
    }
  }

  if (orders === null) {
    return <div className="h-64 bg-surface rounded-2xl animate-pulse" />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="text-left text-muted border-b border-border">
            <th className="py-3 pr-4">Order</th>
            <th className="py-3 pr-4">Customer</th>
            <th className="py-3 pr-4">Total</th>
            <th className="py-3 pr-4">Payment</th>
            <th className="py-3 pr-4">Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o, i) => (
            <motion.tr
              key={o.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.02 }}
              onClick={() => router.push(`/admin/orders/${o.id}`)}
              className="border-b border-border/60 cursor-pointer hover:bg-surface/60 transition-colors"
            >
              <td className="py-3 pr-4 font-medium">#{o.id}</td>
              <td className="py-3 pr-4">
                <p className="text-ink">{o.customer_name || "Unknown"}</p>
                <p className="text-muted text-[12px]">User #{o.user_id}{o.customer_email ? ` · ${o.customer_email}` : ""}</p>
              </td>
              <td className="py-3 pr-4">${o.total_amount.toFixed(2)}</td>
              <td className="py-3 pr-4 capitalize">{o.payment_status}</td>
              <td className="py-3 pr-4" onClick={(e) => e.stopPropagation()}>
                <select
                  value={o.status}
                  onChange={(e) => handleStatusChange(o.id, e.target.value)}
                  className="border border-border rounded-full px-3 py-1.5 text-[12px] capitalize focus-ring"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
