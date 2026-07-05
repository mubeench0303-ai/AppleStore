"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import type { Order } from "@/types";
import { orderService } from "@/lib/services/order.service";

export default function OrderDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const confirmed = searchParams.get("confirmed");
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    const id = Number(params.id);
    if (!id) return;

    async function load() {
      try {
        if (confirmed === "1") {
          const synced = await orderService.confirmPayment(id);
          setOrder(synced);
          return;
        }
        const data = await orderService.getOne(id);
        setOrder(data);
      } catch {
        setOrder(null);
      }
    }

    load();
  }, [params.id, confirmed]);

  if (!order) {
    return <div className="h-40 bg-surface rounded-2xl animate-pulse" />;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
      {confirmed && (
        <div className="flex items-center gap-2 bg-success/10 text-success rounded-2xl px-5 py-4 mb-8">
          <CheckCircle2 size={18} />
          <span className="text-[14px] font-medium">Your order was placed successfully.</span>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-xl font-semibold">Order #{order.user_order_number}</h2>
        <span className="text-[12px] px-3 py-1 rounded-full bg-surface capitalize">{order.status}</span>
      </div>

      <div className="bg-surface rounded-3xl p-6 mb-6">
        <p className="text-[13px] text-muted mb-1">Shipping to</p>
        <p className="text-[14px]">{order.shipping_address}</p>
      </div>

      <ul className="divide-y divide-border">
        {order.items?.map((item) => (
          <li key={item.id} className="flex justify-between py-4 text-[14px]">
            <span>
              {item.product_name_snapshot} × {item.quantity}
            </span>
            <span className="font-medium">${item.subtotal.toFixed(2)}</span>
          </li>
        ))}
      </ul>

      <div className="flex justify-between pt-4 mt-2 border-t border-border font-semibold text-[15px]">
        <span>Total</span>
        <span>${order.total_amount.toFixed(2)}</span>
      </div>
    </motion.div>
  );
}
