"use client";

import { motion } from "framer-motion";

const motionTags = {
  h1: motion.h1,
  h2: motion.h2,
  p: motion.p,
};

export default function SplitReveal({
  lines,
  className = "",
  as = "h1",
}: {
  lines: string[];
  className?: string;
  as?: "h1" | "h2" | "p";
}) {
  const MotionTag = motionTags[as];

  return (
    <MotionTag className={className} aria-label={lines.join(" ")}>
      {lines.map((line) => (
        <span key={line} className="block overflow-hidden">
          <motion.span
            className="block"
            initial={{ y: "110%", rotateX: 40, opacity: 0 }}
            animate={{ y: 0, rotateX: 0, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 120,
              damping: 18,
              delay: 0.12 + lines.indexOf(line) * 0.14,
            }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </MotionTag>
  );
}
