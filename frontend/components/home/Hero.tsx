"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="dark-section text-white overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-20 sm:py-28 grid md:grid-cols-2 gap-10 items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-accent text-[13px] font-medium tracking-wide uppercase mb-4">iPhone 16 Pro</p>
          <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.02]">
            Titanium.
            <br />
            So strong.
            <br />
            So light.
          </h1>
          <p className="text-white/60 text-lg mt-6 max-w-md">
            The most advanced iPhone yet. A18 Pro chip, pro camera system, and a beautiful titanium design.
          </p>
          <div className="flex items-center gap-4 mt-8">
            <Link
              href="/products/iphone-16-pro"
              className="bg-accent hover:bg-accent-hover text-white rounded-full px-7 py-3.5 text-[15px] font-medium transition-colors"
            >
              Buy from $999
            </Link>
            <Link
              href="/products/iphone-16-pro"
              className="text-white/90 hover:text-white text-[15px] font-medium underline underline-offset-4"
            >
              Learn more
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1, y: [0, -12, 0] }}
          transition={{
            opacity: { duration: 0.8 },
            scale: { duration: 0.8 },
            y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
          }}
          className="relative aspect-square"
        >
          <Image
            src="https://images.unsplash.com/photo-1592286927505-1def25115558?w=1000"
            alt="iPhone 16 Pro"
            fill
            priority
            className="object-contain drop-shadow-2xl"
          />
        </motion.div>
      </div>
    </section>
  );
}
