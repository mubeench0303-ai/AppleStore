"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import MagneticLink from "@/components/motion/MagneticLink";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";

const MACBOOK_IMAGE = "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200";

export default function FeatureBanner() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], reduced ? ["0%", "0%"] : ["-10%", "10%"]);
  const textX = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [-24, 24]);

  return (
    <section className="section-padding pt-0">
      <div className="container-page">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ type: "spring", stiffness: 200, damping: 26 }}
          className="relative overflow-hidden rounded-3xl dark-section text-white min-h-[320px] sm:min-h-[380px] flex items-center"
        >
          <motion.div className="absolute inset-0" style={{ y: imageY }}>
            <Image
              src={MACBOOK_IMAGE}
              alt=""
              fill
              className="object-cover object-center opacity-40 scale-110"
              sizes="(max-width: 1280px) 100vw, 1280px"
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
          <motion.div style={{ x: textX }} className="relative z-10 p-8 sm:p-12 max-w-lg">
            <p className="text-accent text-[12px] font-semibold tracking-widest uppercase mb-3">MacBook Air</p>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
              Power. Portability.
              <br />
              Built for every day.
            </h2>
            <p className="text-white/60 text-[15px] mt-4 leading-relaxed">
              Thin, light, and ready for work or play. Explore the full MacBook lineup.
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-7">
              <MagneticLink
                href="/products?category=macbook"
                className="bg-accent hover:bg-accent-hover text-white rounded-full px-6 py-3 text-[14px] font-medium transition-colors"
              >
                Shop MacBook
              </MagneticLink>
              <MagneticLink
                href="/products"
                strength={0.25}
                className="text-white/90 hover:text-white text-[14px] font-medium underline underline-offset-4"
              >
                Browse all
              </MagneticLink>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
