"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { authService } from "@/lib/services/auth.service";

const RESEND_COOLDOWN_SEC = 60;

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "";

  const [step, setStep] = useState<1 | 2>(1);
  const [code, setCode] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [cooldown, setCooldown] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{6}$/.test(code.trim())) {
      toast.error("Enter the 6-digit code from your email");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await authService.verifyResetCode(email, code.trim());
      setResetToken(res.reset_token);
      setStep(2);
      toast.success(res.message);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid or expired code");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (password.length < 8) next.password = "Password must be at least 8 characters";
    if (password !== confirmPassword) next.confirmPassword = "Passwords do not match";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setIsSubmitting(true);
    try {
      const res = await authService.resetPassword(email, resetToken, password);
      toast.success("Password reset successful — please sign in");
      router.push("/login");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't reset password");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResend() {
    if (!email || cooldown > 0) return;
    setIsResending(true);
    try {
      const res = await authService.forgotPassword(email);
      toast.success(res.message);
      setCooldown(RESEND_COOLDOWN_SEC);
      setCode("");
      setStep(1);
      setResetToken("");
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
        <Link href="/forgot-password" className="text-accent text-sm font-medium hover:underline">
          Request a reset code
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
      <h1 className="font-heading text-2xl font-semibold text-center mb-1">Reset password</h1>
      <p className="text-center text-muted text-[14px] mb-8">
        {step === 1 ? (
          <>
            Enter the 6-digit code sent to{" "}
            <span className="text-ink font-medium">{email}</span>
          </>
        ) : (
          "Choose a new password for your account"
        )}
      </p>

      {step === 1 ? (
        <form onSubmit={handleVerifyCode} className="space-y-4" noValidate>
          <label className="block">
            <span className="text-[13px] text-ink/70 mb-1.5 block">Reset code</span>
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
            disabled={isSubmitting}
            className="w-full bg-accent hover:bg-accent-hover disabled:opacity-60 text-white rounded-full py-3.5 text-[15px] font-medium transition-colors"
          >
            {isSubmitting ? "Verifying…" : "Verify code"}
          </motion.button>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-4" noValidate>
          <label className="block">
            <span className="text-[13px] text-ink/70 mb-1.5 block">New password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-border rounded-xl px-4 py-3 text-[14px] focus-ring"
              placeholder="••••••••"
            />
            {errors.password && (
              <span className="text-error text-[12px] mt-1 block">{errors.password}</span>
            )}
          </label>

          <label className="block">
            <span className="text-[13px] text-ink/70 mb-1.5 block">Confirm password</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-border rounded-xl px-4 py-3 text-[14px] focus-ring"
              placeholder="••••••••"
            />
            {errors.confirmPassword && (
              <span className="text-error text-[12px] mt-1 block">{errors.confirmPassword}</span>
            )}
          </label>

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-accent hover:bg-accent-hover disabled:opacity-60 text-white rounded-full py-3.5 text-[15px] font-medium transition-colors"
          >
            {isSubmitting ? "Saving…" : "Reset password"}
          </motion.button>
        </form>
      )}

      {step === 1 && (
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
      )}

      <p className="text-center text-[13px] text-muted mt-6">
        <Link href="/login" className="text-accent font-medium hover:underline">
          Back to sign in
        </Link>
      </p>
    </motion.div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
