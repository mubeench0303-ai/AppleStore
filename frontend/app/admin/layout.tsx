"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const TABS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/orders", label: "Orders" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="mx-auto max-w-6xl px-5 sm:px-8 py-14">
      <h1 className="font-heading text-3xl font-semibold tracking-tight mb-2">Admin</h1>
      <p className="text-muted text-[14px] mb-10">Manage products, categories, and orders.</p>

      <div className="flex gap-2 border-b border-border mb-10 overflow-x-auto no-scrollbar">
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link key={tab.href} href={tab.href} className="relative px-4 py-3 text-[14px] whitespace-nowrap">
              <span className={active ? "text-ink font-medium" : "text-muted"}>{tab.label}</span>
              {active && <motion.div layoutId="admin-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-ink" />}
            </Link>
          );
        })}
      </div>

      {children}
    </div>
  );
}
