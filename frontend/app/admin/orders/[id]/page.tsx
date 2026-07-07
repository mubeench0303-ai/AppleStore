"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import type { Order, OrderStatus } from "@/types";
import { orderService } from "@/lib/services/order.service";

const STATUSES: OrderStatus[] = ["pending", "paid", "shipped", "delivered", "cancelled"];

function parseShippingAddress(raw: string) {
  const parts = raw.split(" — ");
  if (parts.length < 2) return { address: raw, phone: "" };
  return { address: parts[0].trim(), phone: parts.slice(1).join(" — ").trim() };
}

export default function AdminOrderDetailPage() {
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const id = Number(params.id);

  useEffect(() => {
    if (!id) {
      setNotFound(true);
      return;
    }

    orderService
      .adminGetOne(id)
      .then(setOrder)
      .catch(() => {
        setOrder(null);
        setNotFound(true);
      });
  }, [id]);

  async function handleStatusChange(status: string) {
    if (!order) return;
    setIsUpdating(true);
    try {
      await orderService.updateStatus(order.id, status);
      setOrder((o) => (o ? { ...o, status: status as OrderStatus } : o));
      toast.success("Order status updated");
    } catch {
      toast.error("Couldn't update order status");
    } finally {
      setIsUpdating(false);
    }
  }

  if (notFound) {
    return (
      <div className="text-center py-16">
        <p className="text-muted text-[15px] mb-4">Order not found.</p>
        <Link href="/admin/orders" className="text-accent text-sm font-medium hover:underline">
          Back to orders
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-4 max-w-3xl">
        <div className="h-8 w-48 bg-surface rounded-xl animate-pulse" />
        <div className="h-32 bg-surface rounded-3xl animate-pulse" />
        <div className="h-48 bg-surface rounded-3xl animate-pulse" />
      </div>
    );
  }

  const shipping = parseShippingAddress(order.shipping_address);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
      <Link href="/admin/orders" className="text-[13px] text-muted hover:text-ink mb-6 inline-block">
        ← Back to orders
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h2 className="font-heading text-xl font-semibold">Order #{order.id}</h2>
          <p className="text-[13px] text-muted mt-1">
            Placed{" "}
            {new Date(order.created_at).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[12px] px-3 py-1 rounded-full bg-surface capitalize">{order.payment_status}</span>
          <select
            value={order.status}
            disabled={isUpdating}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="border border-border rounded-full px-3 py-1.5 text-[12px] capitalize focus-ring disabled:opacity-60"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <section className="bg-surface rounded-3xl p-6 mb-6">
        <h3 className="font-heading text-[15px] font-semibold mb-4">Customer info</h3>
        <dl className="grid sm:grid-cols-2 gap-4 text-[14px]">
          <div>
            <dt className="text-[12px] text-muted mb-1">Name</dt>
            <dd>{order.customer_name || "—"}</dd>
          </div>
          <div>
            <dt className="text-[12px] text-muted mb-1">Email</dt>
            <dd>{order.customer_email || "—"}</dd>
          </div>
          <div>
            <dt className="text-[12px] text-muted mb-1">User ID</dt>
            <dd>#{order.user_id}</dd>
          </div>
          {shipping.phone && (
            <div>
              <dt className="text-[12px] text-muted mb-1">Phone</dt>
              <dd>{shipping.phone}</dd>
            </div>
          )}
        </dl>
      </section>

      <section className="bg-surface rounded-3xl p-6 mb-6">
        <h3 className="font-heading text-[15px] font-semibold mb-2">Shipping address</h3>
        <p className="text-[14px]">{shipping.address}</p>
      </section>

      <section className="mb-6">
        <h3 className="font-heading text-[15px] font-semibold mb-4">Order items</h3>
        <ul className="divide-y divide-border border border-border rounded-3xl overflow-hidden">
          {order.items?.map((item) => (
            <li key={item.id} className="flex items-center gap-4 p-4 bg-card">
              <div className="relative h-14 w-14 rounded-xl bg-surface overflow-hidden shrink-0">
                {item.product_image ? (
                  <Image src={item.product_image} alt={item.product_name_snapshot} fill className="object-cover" sizes="56px" />
                ) : (
                  <div className="h-full w-full bg-surface" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium truncate">{item.product_name_snapshot}</p>
                <p className="text-[12px] text-muted">
                  Qty {item.quantity} · ${item.unit_price_snapshot.toFixed(2)} each
                </p>
              </div>
              <p className="text-[14px] font-medium">${item.subtotal.toFixed(2)}</p>
            </li>
          ))}
        </ul>
      </section>

      <div className="flex justify-between pt-4 border-t border-border font-semibold text-[15px]">
        <span>Total</span>
        <span>${order.total_amount.toFixed(2)}</span>
      </div>
    </motion.div>
  );
}
