"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/auth.store";

const RESEND_COOLDOWN_SEC = 60;

function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "";
  const verifyEmail = useAuthStore((s) => s.verifyEmail);
  const resendCode = useAuthStore((s) => s.resendCode);
  const isLoading = useAuthStore((s) => s.isLoading);

  const [code, setCode] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      toast.error("Missing email — please sign up again");
      return;
    }
    if (!/^\d{6}$/.test(code.trim())) {
      toast.error("Enter the 6-digit code from your email");
      return;
    }

    try {
      await verifyEmail(email, code.trim());
      toast.success("Email verified — welcome!");
      router.push("/");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Verification failed";
      toast.error(message);
    }
  }

  async function handleResend() {
    if (!email || cooldown > 0) return;
    setIsResending(true);
    try {
      await resendCode(email);
      toast.success("New code sent — check your inbox");
      setCooldown(RESEND_COOLDOWN_SEC);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't resend code");
    } finally {
      setIsResending(false);
    }
  }

  if (!email) {
    return (
      <div className="text-center py-20">
        <p className="text-muted text-[15px] mb-4">No email address provided.</p>
        <Link href="/register" className="text-accent text-sm font-medium hover:underline">
          Create an account
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-sm px-5 py-20 sm:py-28"
    >
      <h1 className="font-heading text-2xl font-semibold text-center mb-1">Verify your email</h1>
      <p className="text-center text-muted text-[14px] mb-8">
        We sent a 6-digit code to <span className="text-ink font-medium">{email}</span>
      </p>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <label className="block">
          <span className="text-[13px] text-ink/70 mb-1.5 block">Verification code</span>
          <input
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            className="w-full border border-border rounded-xl px-4 py-3 text-[20px] tracking-[0.4em] text-center focus-ring"
            placeholder="000000"
          />
        </label>

        <motion.button
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isLoading}
          className="w-full bg-accent hover:bg-accent-hover disabled:opacity-60 text-white rounded-full py-3.5 text-[15px] font-medium transition-colors"
        >
          {isLoading ? "Verifying…" : "Verify email"}
        </motion.button>
      </form>

      <div className="text-center mt-6">
        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0 || isResending}
          className="text-[13px] text-accent font-medium hover:underline disabled:text-muted disabled:no-underline disabled:cursor-not-allowed"
        >
          {cooldown > 0 ? `Resend code in ${cooldown}s` : isResending ? "Sending…" : "Resend code"}
        </button>
      </div>

      <p className="text-center text-[13px] text-muted mt-6">
        Wrong email?{" "}
        <Link href="/register" className="text-accent font-medium hover:underline">
          Sign up again
        </Link>
      </p>
    </motion.div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailForm />
    </Suspense>
  );
}
