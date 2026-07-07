"use client";

import Link from "next/link";
import { motion, useMotionValue, useSpring } from "framer-motion";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof Link> & {
  strength?: number;
  className?: string;
};

export default function MagneticLink({ children, strength = 0.35, className = "", ...props }: Props) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 20 });
  const springY = useSpring(y, { stiffness: 300, damping: 20 });

  function onMove(e: React.MouseEvent<HTMLAnchorElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * strength);
    y.set((e.clientY - rect.top - rect.height / 2) * strength);
  }

  function onLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div style={{ x: springX, y: springY }} className="inline-flex">
      <Link {...props} className={className} onMouseMove={onMove} onMouseLeave={onLeave}>
        {children}
      </Link>
    </motion.div>
  );
}
