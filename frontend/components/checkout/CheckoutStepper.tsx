"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

const STEPS = [
  { id: 1, label: "Shipping" },
  { id: 2, label: "Payment" },
];

export default function CheckoutStepper({ currentStep }: { currentStep: 1 | 2 }) {
  return (
    <ol className="flex items-center gap-3 mb-10">
      {STEPS.map((step, i) => {
        const done = step.id < currentStep;
        const active = step.id === currentStep;

        return (
          <li key={step.id} className="flex items-center gap-3 flex-1 last:flex-none">
            <div className="flex items-center gap-2 min-w-0">
              <motion.div
                animate={{ scale: active ? 1.05 : 1 }}
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold border-2 ${
                  done || active
                    ? "border-accent bg-accent text-white"
                    : "border-border bg-surface text-muted"
                }`}
              >
                {done ? <Check size={14} strokeWidth={2.5} /> : step.id}
              </motion.div>
              <span
                className={`text-[13px] font-medium whitespace-nowrap ${
                  active ? "text-ink" : done ? "text-ink/80" : "text-muted"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-px flex-1 min-w-[1.5rem] ${done ? "bg-accent" : "bg-border"}`} />
            )}
          </li>
        );
      })}
    </ol>
  );
}
