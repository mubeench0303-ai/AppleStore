"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Search, User, Menu, X } from "lucide-react";
import { useCartStore } from "@/store/cart.store";
import { useAuthStore } from "@/store/auth.store";

const NAV_LINKS = [
  { href: "/products", label: "Shop All" },
  { href: "/products?category=iphone", label: "iPhone" },
  { href: "/products?category=macbook", label: "MacBook" },
  { href: "/products?category=ipad", label: "iPad" },
  { href: "/products?category=apple-watch", label: "Watch" },
  { href: "/products?category=airpods", label: "AirPods" },
];

export default function Navbar() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const itemCount = useCartStore((s) => s.itemCount);
  const openDrawer = useCartStore((s) => s.openDrawer);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  function submitSearch(e?: React.FormEvent) {
    e?.preventDefault();
    const q = searchQuery.trim();
    setSearchOpen(false);
    setMobileOpen(false);
    setSearchQuery("");
    if (q) router.push(`/products?search=${encodeURIComponent(q)}`);
    else router.push("/products");
  }

  return (
    <header
      className={`sticky top-0 z-40 glass-nav transition-shadow ${
        scrolled ? "shadow-soft border-b border-border/60" : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="font-heading text-[19px] font-semibold tracking-tight">
              Apple Store
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[13px] text-ink/80 hover:text-ink transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-1">
            {user?.role === "admin" && (
              <Link
                href="/admin"
                className="hidden sm:flex items-center h-9 px-3 rounded-full text-[13px] font-medium text-ink/80 hover:bg-surface hover:text-ink transition-colors focus-ring"
              >
                Admin
              </Link>
            )}

            <div className="hidden sm:flex items-center">
              <AnimatePresence>
                {searchOpen && (
                  <motion.form
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 220, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onSubmit={submitSearch}
                    className="overflow-hidden mr-1"
                  >
                    <input
                      ref={searchInputRef}
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search…"
                      aria-label="Search products"
                      className="w-full border border-border rounded-full px-4 py-2 text-[13px] bg-white focus-ring"
                    />
                  </motion.form>
                )}
              </AnimatePresence>
              <button
                type="button"
                onClick={() => {
                  if (searchOpen && searchQuery.trim()) submitSearch();
                  else setSearchOpen((v) => !v);
                }}
                aria-label={searchOpen ? "Submit search" : "Open search"}
                className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-surface transition-colors focus-ring"
              >
                {searchOpen ? <X size={17} strokeWidth={1.75} /> : <Search size={17} strokeWidth={1.75} />}
              </button>
            </div>

            <Link
              href={user ? "/account" : "/login"}
              aria-label="Account"
              className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full hover:bg-surface transition-colors focus-ring"
            >
              <User size={17} strokeWidth={1.75} />
            </Link>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={openDrawer}
              aria-label="Open cart"
              className="relative h-9 w-9 flex items-center justify-center rounded-full hover:bg-surface transition-colors focus-ring"
            >
              <ShoppingBag size={17} strokeWidth={1.75} />
              {itemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 bg-accent text-white text-[10px] font-semibold rounded-full h-4 w-4 flex items-center justify-center"
                >
                  {itemCount > 9 ? "9+" : itemCount}
                </motion.span>
              )}
            </motion.button>
            <button
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
              className="md:hidden h-9 w-9 flex items-center justify-center rounded-full hover:bg-surface transition-colors focus-ring"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <motion.nav
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="md:hidden border-t border-border/60 bg-background/95 px-5 py-3 flex flex-col gap-3"
        >
          <form onSubmit={submitSearch} className="flex gap-2">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products…"
              aria-label="Search products"
              className="flex-1 border border-border rounded-full px-4 py-2.5 text-[14px] focus-ring"
            />
            <button
              type="submit"
              className="h-10 w-10 flex items-center justify-center rounded-full bg-surface hover:bg-border/40 transition-colors"
              aria-label="Search"
            >
              <Search size={16} />
            </button>
          </form>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="text-[15px] text-ink/85"
            >
              {link.label}
            </Link>
          ))}
          <Link href={user ? "/account" : "/login"} onClick={() => setMobileOpen(false)} className="text-[15px] text-ink/85">
            {user ? "Account" : "Sign in"}
          </Link>
          {user?.role === "admin" && (
            <Link href="/admin" onClick={() => setMobileOpen(false)} className="text-[15px] text-ink/85">
              Admin Panel
            </Link>
          )}
        </motion.nav>
      )}
    </header>
  );
}
