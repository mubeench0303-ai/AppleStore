"use client";

import { create } from "zustand";
import Cookies from "js-cookie";
import type { Cart } from "@/types";
import { cartService } from "@/lib/services/cart.service";

interface CartState {
  cart: Cart | null;
  isOpen: boolean;
  isLoading: boolean;
  itemCount: number;
  subtotal: number;
  fetchCart: () => Promise<void>;
  addItem: (productId: number, quantity?: number) => Promise<void>;
  updateItem: (productId: number, quantity: number) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
  openDrawer: () => void;
  closeDrawer: () => void;
  reset: () => void;
  applyCart: (cart: Cart) => void;
}

function computeTotals(cart: Cart | null) {
  const items = cart?.items || [];
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.quantity * i.unit_price_snapshot, 0);
  return { itemCount, subtotal };
}

function syncCartCookie(cart: Cart | null) {
  const { itemCount } = computeTotals(cart);
  Cookies.set("cart_count", String(itemCount), { expires: 1, sameSite: "lax" });
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  isOpen: false,
  isLoading: false,
  itemCount: 0,
  subtotal: 0,

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const cart = await cartService.get();
      syncCartCookie(cart);
      set({ cart, ...computeTotals(cart) });
    } catch {
      // not logged in — leave cart empty
    } finally {
      set({ isLoading: false });
    }
  },

  addItem: async (productId, quantity = 1) => {
    const cart = await cartService.addItem(productId, quantity);
    syncCartCookie(cart);
    set({ cart, ...computeTotals(cart) });
  },

  updateItem: async (productId, quantity) => {
    const cart = await cartService.updateItem(productId, quantity);
    syncCartCookie(cart);
    set({ cart, ...computeTotals(cart) });
  },

  removeItem: async (productId) => {
    const cart = await cartService.removeItem(productId);
    syncCartCookie(cart);
    set({ cart, ...computeTotals(cart) });
  },

  openDrawer: () => set({ isOpen: true }),
  closeDrawer: () => set({ isOpen: false }),
  reset: () => {
    Cookies.remove("cart_count");
    set({ cart: null, itemCount: 0, subtotal: 0 });
  },
  applyCart: (cart) => {
    syncCartCookie(cart);
    set({ cart, ...computeTotals(cart) });
  },
}));
