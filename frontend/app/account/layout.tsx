"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const TABS = [
  { href: "/account", label: "Profile" },
  { href: "/account/orders", label: "Orders" },
  { href: "/account/addresses", label: "Addresses" },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  async function handleLogout() {
    await logout();
    toast.success("Signed out");
    router.push("/");
  }

  return (
    <div className="mx-auto max-w-5xl px-5 sm:px-8 py-14">
      <div className="flex items-center justify-between mb-10">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">My Account</h1>
        <button onClick={handleLogout} className="text-[13px] text-muted hover:text-error transition-colors">
          Sign out
        </button>
      </div>

      {user?.role === "admin" && (
        <Link
          href="/admin"
          className="flex items-center justify-between gap-3 bg-ink text-white rounded-2xl px-5 py-4 mb-8 hover:bg-ink/90 transition-colors"
        >
          <span className="text-[14px] font-medium">You have admin access</span>
          <span className="text-[13px] text-white/70">Go to Admin Panel →</span>
        </Link>
      )}

      <div className="flex gap-2 border-b border-border mb-10">
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link key={tab.href} href={tab.href} className="relative px-4 py-3 text-[14px]">
              <span className={active ? "text-ink font-medium" : "text-muted"}>{tab.label}</span>
              {active && (
                <motion.div layoutId="account-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-ink" />
              )}
            </Link>
          );
        })}
      </div>

      {children}
    </div>
  );
}
