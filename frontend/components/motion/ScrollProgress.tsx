"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";

export default function ScrollProgress() {
  const reduced = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  if (reduced) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[3px] bg-accent origin-left z-[60] pointer-events-none"
      style={{ scaleX }}
    />
  );
}
