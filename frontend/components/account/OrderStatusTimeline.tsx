"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { OrderStatus } from "@/types";
import { ORDER_TIMELINE_STEPS, orderTimelineIndex } from "@/lib/order-status";

export default function OrderStatusTimeline({ status }: { status: OrderStatus }) {
  if (status === "cancelled") {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
        This order was cancelled.
      </div>
    );
  }

  const current = orderTimelineIndex(status);

  return (
    <ol className="flex items-center justify-between gap-1 sm:gap-2">
      {ORDER_TIMELINE_STEPS.map((step, i) => {
        const done = i <= current;
        const active = i === current;

        return (
          <li key={step.key} className="flex-1 flex flex-col items-center min-w-0">
            <div className="flex items-center w-full">
              {i > 0 && (
                <div
                  className={`h-0.5 flex-1 transition-colors ${i <= current ? "bg-accent" : "bg-border"}`}
                />
              )}
              <motion.div
                initial={false}
                animate={{ scale: active ? 1.08 : 1 }}
                className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${
                  done ? "border-accent bg-accent text-white" : "border-border bg-surface text-muted"
                }`}
              >
                {done && i < current ? (
                  <Check size={14} strokeWidth={2.5} />
                ) : (
                  <span className="text-[11px] font-semibold">{i + 1}</span>
                )}
              </motion.div>
              {i < ORDER_TIMELINE_STEPS.length - 1 && (
                <div
                  className={`h-0.5 flex-1 transition-colors ${i < current ? "bg-accent" : "bg-border"}`}
                />
              )}
            </div>
            <span
              className={`mt-2 text-[10px] sm:text-[11px] font-medium text-center truncate w-full ${
                active ? "text-accent" : done ? "text-ink" : "text-muted"
              }`}
            >
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
