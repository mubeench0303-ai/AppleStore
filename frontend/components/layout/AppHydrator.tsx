"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useCartStore } from "@/store/cart.store";

/**
 * Hydrates auth/cart state on first client render. Rendered once in the root layout.
 */
export default function AppHydrator() {
  const hydrate = useAuthStore((s) => s.hydrate);
  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const resetCart = useCartStore((s) => s.reset);

  useEffect(() => {
    hydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    if (user) {
      fetchCart();
    } else {
      resetCart();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, isHydrated]);

  return null;
}
