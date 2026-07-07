"use client";

import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useState } from "react";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";

export default function PaymentForm({ orderId, total }: { orderId: number; total: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setError(null);

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/account/orders/${orderId}?confirmed=1`,
      },
    });

    if (stripeError) {
      setError(stripeError.message || "Payment failed");
      setIsProcessing(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h2 className="font-heading text-lg font-semibold mb-1">Payment</h2>
        <p className="flex items-center gap-1.5 text-[13px] text-muted">
          <Lock size={13} />
          Secure payment powered by Stripe
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
        <PaymentElement />
      </div>

      <p className="text-[12px] text-muted">
        Test card: <code className="bg-surface px-1.5 py-0.5 rounded">4242 4242 4242 4242</code> — any future expiry, any CVC.
      </p>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-error text-[13px] bg-red-50 border border-red-100 rounded-xl px-4 py-3"
        >
          {error}
        </motion.p>
      )}

      <motion.button
        whileTap={{ scale: 0.98 }}
        disabled={isProcessing || !stripe}
        type="submit"
        className="w-full sm:w-auto bg-accent hover:bg-accent-hover disabled:opacity-50 text-white rounded-full px-8 py-3.5 text-[15px] font-medium transition-colors shadow-card"
      >
        {isProcessing ? "Processing…" : `Pay now · $${total.toFixed(2)}`}
      </motion.button>
    </form>
  );
}
