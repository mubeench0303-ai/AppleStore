"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/auth.store";
import { APIError } from "@/lib/api-client";

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  function validate() {
    const next: Record<string, string> = {};
    if (mode === "register" && name.trim().length < 2) next.name = "Enter your full name";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Enter a valid email address";
    if (password.length < 8) next.password = "Password must be at least 8 characters";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      if (mode === "login") {
        await login(email, password);
        toast.success("Welcome back");
        router.push(redirect);
      } else {
        const res = await register(name, email, password);
        toast.success(res.message);
        router.push(`/verify-email?email=${encodeURIComponent(res.email)}`);
      }
    } catch (err) {
      if (mode === "login" && err instanceof APIError && err.status === 403) {
        toast.error("Please verify your email first");
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
        return;
      }
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
      <h1 className="font-heading text-2xl font-semibold text-center mb-1">
        {mode === "login" ? "Sign in" : "Create your account"}
      </h1>
      <p className="text-center text-muted text-[14px] mb-8">
        {mode === "login" ? "Access your orders and saved addresses." : "Shop faster with a saved cart and address book."}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {mode === "register" && (
          <Field label="Full name" error={errors.name}>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-border rounded-xl px-4 py-3 text-[14px] focus-ring"
              placeholder="Jane Appleseed"
            />
          </Field>
        )}
        <Field label="Email" error={errors.email}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-border rounded-xl px-4 py-3 text-[14px] focus-ring"
            placeholder="you@example.com"
          />
        </Field>
        <Field label="Password" error={errors.password}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-border rounded-xl px-4 py-3 text-[14px] focus-ring"
            placeholder="••••••••"
          />
        </Field>

        {mode === "login" && (
          <div className="text-right -mt-1">
            <Link
              href="/forgot-password"
              className="text-[13px] text-accent font-medium hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        )}

        <motion.button
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-accent hover:bg-accent-hover disabled:opacity-60 text-white rounded-full py-3.5 text-[15px] font-medium transition-colors"
        >
          {isSubmitting ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
        </motion.button>
      </form>

      <p className="text-center text-[13px] text-muted mt-6">
        {mode === "login" ? (
          <>
            Don&apos;t have an account?{" "}
            <Link href={`/register?redirect=${redirect}`} className="text-accent font-medium hover:underline">
              Sign up
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href={`/login?redirect=${redirect}`} className="text-accent font-medium hover:underline">
              Sign in
            </Link>
          </>
        )}
      </p>
    </motion.div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[13px] text-ink/70 mb-1.5 block">{label}</span>
      {children}
      {error && <span className="text-error text-[12px] mt-1 block">{error}</span>}
    </label>
  );
}
