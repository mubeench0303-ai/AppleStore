"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, ShoppingBag } from "lucide-react";
import type { Order } from "@/types";
import { orderService } from "@/lib/services/order.service";
import OrderItemReviewForm from "@/components/reviews/OrderItemReviewForm";
import Breadcrumb from "@/components/ui/Breadcrumb";
import OrderStatusTimeline from "@/components/account/OrderStatusTimeline";
import OrderStatusBadge from "@/components/account/OrderStatusBadge";

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
    return <div className="h-48 bg-surface rounded-2xl animate-pulse" />;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
      <Breadcrumb
        items={[
          { label: "Account", href: "/account" },
          { label: "Orders", href: "/account/orders" },
          { label: `#${order.user_order_number}` },
        ]}
      />

      {confirmed && (
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 22 }}
          className="rounded-3xl border border-success/20 bg-success/10 p-6 sm:p-8 mb-8 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 18, delay: 0.1 }}
            className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-success/15 text-success mb-4"
          >
            <CheckCircle2 size={28} strokeWidth={1.75} />
          </motion.div>
          <h2 className="font-heading text-xl font-semibold text-ink">Order placed successfully!</h2>
          <p className="text-[14px] text-muted mt-2 max-w-sm mx-auto">
            Thank you for your purchase. We&apos;ll send updates as your order progresses.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white rounded-full px-6 py-2.5 text-[14px] font-medium"
            >
              <ShoppingBag size={15} />
              Continue shopping
            </Link>
            <Link
              href="/account/orders"
              className="inline-flex items-center text-[14px] text-accent hover:underline font-medium px-4 py-2.5"
            >
              View all orders
            </Link>
          </div>
        </motion.div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h2 className="font-heading text-xl font-semibold">Order #{order.user_order_number}</h2>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="bg-surface rounded-3xl p-5 sm:p-6 mb-6 shadow-card">
        <p className="text-[12px] font-medium text-muted uppercase tracking-wide mb-4">Order progress</p>
        <OrderStatusTimeline status={order.status} />
      </div>

      <div className="bg-surface rounded-3xl p-5 sm:p-6 mb-6">
        <p className="text-[13px] text-muted mb-1">Shipping to</p>
        <p className="text-[14px] leading-relaxed">{order.shipping_address}</p>
        <p className="text-[12px] text-muted mt-3">
          Placed on{" "}
          {new Date(order.created_at).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <div className="rounded-3xl border border-border overflow-hidden">
        <div className="px-5 py-3 bg-surface/80 border-b border-border">
          <p className="text-[13px] font-medium">Items</p>
        </div>
        <ul className="divide-y divide-border px-5">
          {order.items?.map((item) => (
            <li key={item.id} className="py-4">
              <div className="flex justify-between gap-4 text-[14px]">
                <span className="font-medium">
                  {item.product_name_snapshot} × {item.quantity}
                </span>
                <span className="font-semibold shrink-0">${item.subtotal.toFixed(2)}</span>
              </div>

              {item.has_reviewed && <p className="text-[12px] text-muted mt-2">You reviewed this product</p>}

              {item.can_review && (
                <OrderItemReviewForm
                  orderId={order.id}
                  productId={item.product_id}
                  productName={item.product_name_snapshot}
                  onSubmitted={loadOrder}
                />
              )}

              {order.status !== "delivered" && !item.has_reviewed && !item.can_review && (
                <p className="text-[12px] text-muted mt-2">Reviews unlock after delivery</p>
              )}
            </li>
          ))}
        </ul>
        <div className="flex justify-between px-5 py-4 bg-surface/50 border-t border-border font-semibold text-[15px]">
          <span>Total</span>
          <span>${order.total_amount.toFixed(2)}</span>
        </div>
      </div>

      <Link href="/account/orders" className="inline-block text-accent text-sm font-medium hover:underline mt-8">
        ← Back to orders
      </Link>
    </motion.div>
  );
}
