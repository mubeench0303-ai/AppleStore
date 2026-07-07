"use client";

import { ShieldCheck, Truck, RotateCcw, Headphones } from "lucide-react";
import { motion } from "framer-motion";

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Secure payments",
    description: "Stripe-powered checkout with encrypted transactions.",
  },
  {
    icon: Truck,
    title: "Fast delivery",
    description: "Free shipping on qualifying orders over $50.",
  },
  {
    icon: RotateCcw,
    title: "Easy returns",
    description: "Hassle-free 30-day return policy on all orders.",
  },
  {
    icon: Headphones,
    title: "Dedicated support",
    description: "We're here to help before and after your purchase.",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const item = {
  hidden: { opacity: 0, scale: 0.6, rotate: -8, y: 24 },
  show: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    y: 0,
    transition: { type: "spring", stiffness: 260, damping: 20 },
  },
};

export default function TrustFeatures() {
  return (
    <section className="border-y border-border/60 bg-surface/80">
      <div className="container-page py-10 sm:py-12">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {FEATURES.map((feature) => (
            <motion.div key={feature.title} variants={item} className="flex gap-4">
              <motion.div
                whileHover={{ rotate: [0, -8, 8, 0], scale: 1.08 }}
                transition={{ duration: 0.45 }}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-surface text-accent"
              >
                <feature.icon size={20} strokeWidth={1.75} aria-hidden />
              </motion.div>
              <div>
                <h3 className="text-[14px] font-semibold text-ink">{feature.title}</h3>
                <p className="text-[13px] text-muted mt-1 leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
