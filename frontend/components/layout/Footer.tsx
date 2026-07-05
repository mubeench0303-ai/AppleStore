import Link from "next/link";

const COLUMNS = [
  {
    title: "Shop",
    links: [
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
      { label: "Order history", href: "/account/orders" },
      { label: "Saved addresses", href: "/account/addresses" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Shipping", href: "/products" },
      { label: "Returns", href: "/products" },
      { label: "Contact us", href: "/products" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="dark-section text-white/90 mt-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2 md:col-span-1">
            <div className="font-heading text-lg font-semibold text-white">Apple Store</div>
            <p className="mt-3 text-[13px] text-white/50 leading-relaxed max-w-[220px]">
              A demo storefront built for portfolio purposes. Not affiliated with Apple Inc.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <div className="text-[13px] font-medium text-white/50 mb-3">{col.title}</div>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-[13px] text-white/80 hover:text-white transition-colors">
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
