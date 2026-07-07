"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";

type FlyItem = {
  id: string;
  src: string;
  from: DOMRect;
  to: DOMRect;
  onComplete?: () => void;
};

type FlyContextValue = {
  registerCartTarget: (el: HTMLElement | null) => void;
  flyToCart: (src: string, fromEl: HTMLElement) => Promise<void>;
  cartBump: number;
};

const FlyContext = createContext<FlyContextValue | null>(null);

export function useFlyToCart() {
  const ctx = useContext(FlyContext);
  if (!ctx) throw new Error("useFlyToCart must be used within FlyToCartProvider");
  return ctx;
}

export default function FlyToCartProvider({ children }: { children: ReactNode }) {
  const cartRef = useRef<HTMLElement | null>(null);
  const [flies, setFlies] = useState<FlyItem[]>([]);
  const [cartBump, setCartBump] = useState(0);

  const registerCartTarget = useCallback((el: HTMLElement | null) => {
    cartRef.current = el;
  }, []);

  const flyToCart = useCallback((src: string, fromEl: HTMLElement): Promise<void> => {
    const to = cartRef.current?.getBoundingClientRect();
    if (!to) return Promise.resolve();

    return new Promise((resolve) => {
      const id = crypto.randomUUID();
      const onComplete = () => {
        setFlies((prev) => prev.filter((f) => f.id !== id));
        setCartBump((b) => b + 1);
        resolve();
      };

      setFlies((prev) => [
        ...prev,
        { id, src, from: fromEl.getBoundingClientRect(), to, onComplete },
      ]);
    });
  }, []);

  return (
    <FlyContext.Provider value={{ registerCartTarget, flyToCart, cartBump }}>
      {children}
      <AnimatePresence>
        {flies.map((fly) => (
          <motion.div
            key={fly.id}
            className="fixed z-[100] pointer-events-none overflow-hidden shadow-2xl"
            initial={{
              left: fly.from.left,
              top: fly.from.top,
              width: fly.from.width,
              height: fly.from.height,
              borderRadius: 24,
            }}
            animate={{
              left: fly.to.left + fly.to.width / 2 - 22,
              top: fly.to.top + fly.to.height / 2 - 22,
              width: 44,
              height: 44,
              borderRadius: 9999,
            }}
            exit={{ opacity: 0, scale: 0.4 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
            onAnimationComplete={fly.onComplete}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={fly.src} alt="" className="h-full w-full object-cover" />
          </motion.div>
        ))}
      </AnimatePresence>
    </FlyContext.Provider>
  );
}
