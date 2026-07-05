"use client";

import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useState } from "react";
import { motion } from "framer-motion";

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
    <motion.form
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <h2 className="font-heading text-lg font-semibold mb-2">Payment</h2>
      <p className="text-[13px] text-muted mb-4">
        Test card: <code>4242 4242 4242 4242</code>, any future expiry, any CVC.
      </p>
      <PaymentElement />
      {error && <p className="text-error text-[13px] mt-2">{error}</p>}
      <motion.button
        whileTap={{ scale: 0.98 }}
        disabled={isProcessing || !stripe}
        type="submit"
        className="w-full sm:w-auto bg-accent hover:bg-accent-hover disabled:opacity-50 text-white rounded-full px-8 py-3.5 text-[15px] font-medium transition-colors mt-4"
      >
        {isProcessing ? "Processing…" : `Pay now · $${total.toFixed(2)}`}
      </motion.button>
    </motion.form>
  );
}
