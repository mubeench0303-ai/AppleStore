import Link from "next/link";
import { ShieldCheck, Truck, RotateCcw } from "lucide-react";

const COLUMNS = [
  {
    title: "Shop",
    links: [
      { label: "All products", href: "/products" },
      { label: "iPhone", href: "/products?category=iphone" },
      { label: "MacBook", href: "/products?category=macbook" },
      { label: "iPad", href: "/products?category=ipad" },
      { label: "Apple Watch", href: "/products?category=apple-watch" },
      { label: "AirPods", href: "/products?category=airpods" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Sign in", href: "/login" },
      { label: "Create account", href: "/register" },
      { label: "Order history", href: "/account/orders" },
      { label: "Saved addresses", href: "/account/addresses" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Shipping info", href: "/products" },
      { label: "Returns policy", href: "/products" },
      { label: "Contact us", href: "/products" },
    ],
  },
];

const TRUST_ITEMS = [
  { icon: ShieldCheck, label: "Secure checkout" },
  { icon: Truck, label: "Free shipping $50+" },
  { icon: RotateCcw, label: "30-day returns" },
];

export default function Footer() {
  return (
    <footer className="dark-section text-white/90 mt-20 sm:mt-24">
      <div className="container-page py-14 sm:py-16">
        <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-8 sm:px-8 mb-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <p className="font-heading text-lg font-semibold text-white">Ready to upgrade?</p>
            <p className="text-[13px] text-white/50 mt-1">Browse the latest devices and accessories.</p>
          </div>
          <Link
            href="/products"
            className="inline-flex justify-center bg-accent hover:bg-accent-hover text-white rounded-full px-7 py-3 text-[14px] font-medium transition-colors shrink-0"
          >
            Shop all products
          </Link>
        </div>

        <ul className="flex flex-wrap gap-x-8 gap-y-3 mb-12 pb-10 border-b border-white/10">
          {TRUST_ITEMS.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-2 text-[12px] text-white/60">
              <Icon size={15} className="text-accent shrink-0" aria-hidden />
              {label}
            </li>
          ))}
        </ul>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2 md:col-span-1">
            <div className="font-heading text-lg font-semibold text-white">Apple Store</div>
            <p className="mt-3 text-[13px] text-white/50 leading-relaxed max-w-[240px]">
              A demo storefront built for portfolio purposes. Not affiliated with Apple Inc.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <div className="text-[12px] font-semibold uppercase tracking-wider text-white/40 mb-4">{col.title}</div>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-[13px] text-white/75 hover:text-white transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 text-[12px] text-white/40 flex flex-col sm:flex-row gap-2 sm:justify-between">
          <span>© {new Date().getFullYear()} Apple Store demo. All rights reserved.</span>
          <span>Built with Next.js, Go, and Stripe (test mode).</span>
        </div>
      </div>
    </footer>
  );
}
