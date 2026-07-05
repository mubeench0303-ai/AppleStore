"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, ShoppingCart, Package } from "lucide-react";
import { orderService } from "@/lib/services/order.service";

export default function AdminDashboard() {
  const [stats, setStats] = useState<{ total_orders: number; total_revenue: number; total_products: number } | null>(
    null
  );

  useEffect(() => {
    orderService.stats().then(setStats).catch(() => setStats({ total_orders: 0, total_revenue: 0, total_products: 0 }));
  }, []);

  const cards = [
    { label: "Total revenue", value: stats ? `$${stats.total_revenue.toFixed(2)}` : "—", icon: DollarSign },
    { label: "Total orders", value: stats ? stats.total_orders : "—", icon: ShoppingCart },
    { label: "Products", value: stats ? stats.total_products : "—", icon: Package },
  ];

  return (
    <div className="grid sm:grid-cols-3 gap-5">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          className="rounded-3xl border border-border p-6"
        >
          <card.icon size={20} className="text-accent mb-4" strokeWidth={1.75} />
          <p className="text-2xl font-semibold">{card.value}</p>
          <p className="text-[13px] text-muted mt-1">{card.label}</p>
        </motion.div>
      ))}
    </div>
  );
}
