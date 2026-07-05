"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { authService } from "@/lib/services/auth.service";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address");
      return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      const res = await authService.forgotPassword(email);
      toast.success(res.message);
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-sm px-5 py-20 sm:py-28"
    >
      <h1 className="font-heading text-2xl font-semibold text-center mb-1">Forgot password</h1>
      <p className="text-center text-muted text-[14px] mb-8">
        Enter your email and we&apos;ll send you a 6-digit reset code.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <label className="block">
          <span className="text-[13px] text-ink/70 mb-1.5 block">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-border rounded-xl px-4 py-3 text-[14px] focus-ring"
            placeholder="you@example.com"
          />
          {error && <span className="text-error text-[12px] mt-1 block">{error}</span>}
        </label>

        <motion.button
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-accent hover:bg-accent-hover disabled:opacity-60 text-white rounded-full py-3.5 text-[15px] font-medium transition-colors"
        >
          {isSubmitting ? "Sending…" : "Send reset code"}
        </motion.button>
      </form>

      <p className="text-center text-[13px] text-muted mt-6">
        Remember your password?{" "}
        <Link href="/login" className="text-accent font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </motion.div>
  );
}
