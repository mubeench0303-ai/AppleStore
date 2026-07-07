"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { User, Package, MapPin, LogOut, Shield } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const NAV = [
  { href: "/account", label: "Profile", icon: User, exact: true },
  { href: "/account/orders", label: "Orders", icon: Package, exact: false },
  { href: "/account/addresses", label: "Addresses", icon: MapPin, exact: false },
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

  function isActive(href: string, exact: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <div className="container-page py-10 lg:py-14">
      <div className="mb-8 lg:mb-10">
        <p className="text-[13px] text-muted mb-1">Account</p>
        <h1 className="font-heading text-2xl sm:text-3xl font-semibold tracking-tight">
          Hello, {user?.name?.split(" ")[0] || "there"}
        </h1>
      </div>

      {user?.role === "admin" && (
        <Link
          href="/admin"
          className="flex items-center justify-between gap-3 bg-darksoft text-white rounded-2xl px-5 py-4 mb-8 hover:bg-darksoft/90 transition-colors"
        >
          <span className="flex items-center gap-2 text-[14px] font-medium">
            <Shield size={16} />
            Admin panel
          </span>
          <span className="text-[13px] text-white/70">Open →</span>
        </Link>
      )}

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Sidebar — desktop */}
        <aside className="hidden lg:block w-52 shrink-0">
          <nav className="space-y-1">
            {NAV.map(({ href, label, icon: Icon, exact }) => {
              const active = isActive(href, exact);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] transition-colors ${
                    active ? "bg-surface text-ink font-medium" : "text-muted hover:text-ink hover:bg-surface/60"
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="account-nav-active"
                      className="absolute inset-0 bg-surface rounded-xl -z-10"
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}
                  <Icon size={17} strokeWidth={1.75} />
                  {label}
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] text-muted hover:text-error hover:bg-red-50 transition-colors mt-4"
            >
              <LogOut size={17} strokeWidth={1.75} />
              Sign out
            </button>
          </nav>
        </aside>

        {/* Mobile tabs */}
        <div className="lg:hidden flex gap-1 overflow-x-auto no-scrollbar border-b border-border pb-px -mx-1 px-1">
          {NAV.map(({ href, label, exact }) => {
            const active = isActive(href, exact);
            return (
              <Link
                key={href}
                href={href}
                className={`relative shrink-0 px-4 py-3 text-[14px] ${
                  active ? "text-ink font-medium" : "text-muted"
                }`}
              >
                {label}
                {active && (
                  <motion.div layoutId="account-tab-mobile" className="absolute bottom-0 inset-x-2 h-0.5 bg-ink" />
                )}
              </Link>
            );
          })}
        </div>

        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
