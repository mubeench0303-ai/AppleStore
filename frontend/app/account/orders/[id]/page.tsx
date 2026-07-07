"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import type { Order } from "@/types";
import { orderService } from "@/lib/services/order.service";
import OrderItemReviewForm from "@/components/reviews/OrderItemReviewForm";

export default function OrderDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const confirmed = searchParams.get("confirmed");
  const [order, setOrder] = useState<Order | null>(null);

  const id = Number(params.id);

  async function loadOrder() {
    if (!id) return;
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

  useEffect(() => {
    loadOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          <li key={item.id} className="py-4">
            <div className="flex justify-between text-[14px]">
              <span>
                {item.product_name_snapshot} × {item.quantity}
              </span>
              <span className="font-medium">${item.subtotal.toFixed(2)}</span>
            </div>

            {item.has_reviewed && (
              <p className="text-[12px] text-muted mt-2">You reviewed this product</p>
            )}

            {item.can_review && (
              <OrderItemReviewForm
                orderId={order.id}
                productId={item.product_id}
                productName={item.product_name_snapshot}
                onSubmitted={loadOrder}
              />
            )}

            {order.status !== "delivered" && !item.has_reviewed && (
              <p className="text-[12px] text-muted mt-2">
                Reviews unlock after delivery
              </p>
            )}
          </li>
        ))}
      </ul>

      <div className="flex justify-between pt-4 mt-2 border-t border-border font-semibold text-[15px]">
        <span>Total</span>
        <span>${order.total_amount.toFixed(2)}</span>
      </div>

      <Link href="/account/orders" className="inline-block text-accent text-sm font-medium hover:underline mt-8">
        ← Back to orders
      </Link>
    </motion.div>
  );
}
