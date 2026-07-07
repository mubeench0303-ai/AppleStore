"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useCartStore } from "@/store/cart.store";
import { authService } from "@/lib/services/auth.service";
import { cartService } from "@/lib/services/cart.service";
import { APIError } from "@/lib/api-client";
import { clearAccessToken, hasAccessToken } from "@/lib/auth-token";
import Cookies from "js-cookie";

/**
 * Hydrates auth/cart state on first client render. Rendered once in the root layout.
 */
export default function AppHydrator() {
  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const applyCart = useCartStore((s) => s.applyCart);
  const resetCart = useCartStore((s) => s.reset);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      if (!hasAccessToken()) {
        if (!cancelled) {
          useAuthStore.setState({ user: null, isHydrated: true });
        }
        return;
      }

      const cartPromise = cartService.get().catch(() => null);

      try {
        const me = await authService.me();
        if (cancelled) return;

        Cookies.set("auth_state", JSON.stringify({ role: me.role }), { expires: 1, sameSite: "lax" });
        useAuthStore.setState({ user: me });

        const cart = await cartPromise;
        if (cancelled) return;
        if (cart) applyCart(cart);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof APIError && err.status === 401) {
          clearAccessToken();
          Cookies.remove("auth_state");
          useAuthStore.setState({ user: null });
        }
      } finally {
        if (!cancelled) {
          useAuthStore.setState({ isHydrated: true });
        }
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    if (!user) resetCart();
  }, [user?.id, isHydrated, resetCart, user]);

  return null;
}
