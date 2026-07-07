"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import SplitReveal from "@/components/motion/SplitReveal";
import MagneticLink from "@/components/motion/MagneticLink";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";

export default function Hero() {
  const containerRef = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const imageScale = useTransform(scrollYProgress, [0, 1], reduced ? [1, 1] : [1, 1.4]);
  const imageY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const imageOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0.25]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const glowOpacity = useTransform(scrollYProgress, [0, 0.5], [0.6, 0]);

  if (reduced) {
    return (
      <section className="dark-section text-white overflow-hidden">
        <div className="container-page py-20 sm:py-28 grid md:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div>
            <p className="text-accent text-[13px] font-medium tracking-wide uppercase mb-4">iPhone 16 Pro</p>
            <SplitReveal
              as="h1"
              lines={["Titanium.", "So strong.", "So light."]}
              className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.02]"
            />
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
          </div>
          <div className="relative aspect-square">
            <Image
              src="https://images.unsplash.com/photo-1592286927505-1def25115558?w=1000"
              alt="iPhone 16 Pro"
              fill
              priority
              className="object-contain drop-shadow-2xl"
            />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={containerRef} className="relative h-[190vh] md:h-[240vh]">
      <div className="sticky top-0 h-screen dark-section text-white overflow-hidden">
        <motion.div
          className="pointer-events-none absolute left-1/2 top-1/3 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-accent/30 blur-[120px]"
          style={{ opacity: glowOpacity }}
        />

        <div className="container-page h-full grid md:grid-cols-2 gap-10 lg:gap-16 items-center">
          <motion.div style={{ y: textY, opacity: textOpacity }}>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.05 }}
              className="text-accent text-[13px] font-medium tracking-wide uppercase mb-4"
            >
              iPhone 16 Pro
            </motion.p>
            <SplitReveal
              as="h1"
              lines={["Titanium.", "So strong.", "So light."]}
              className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.02]"
            />
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 180, damping: 22, delay: 0.55 }}
              className="text-white/60 text-lg mt-6 max-w-md"
            >
              The most advanced iPhone yet. A18 Pro chip, pro camera system, and a beautiful titanium design.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 180, damping: 22, delay: 0.7 }}
              className="flex items-center gap-4 mt-8"
            >
              <MagneticLink
                href="/products/iphone-16-pro"
                className="bg-accent hover:bg-accent-hover text-white rounded-full px-7 py-3.5 text-[15px] font-medium transition-colors"
              >
                Buy from $999
              </MagneticLink>
              <MagneticLink
                href="/products/iphone-16-pro"
                strength={0.25}
                className="text-white/90 hover:text-white text-[15px] font-medium underline underline-offset-4"
              >
                Learn more
              </MagneticLink>
            </motion.div>
          </motion.div>

          <motion.div
            style={{ scale: imageScale, y: imageY, opacity: imageOpacity }}
            className="relative aspect-square [perspective:1200px]"
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
      </div>
    </section>
  );
}
