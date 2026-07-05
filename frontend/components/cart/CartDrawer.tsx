"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cart.store";
import toast from "react-hot-toast";

export default function CartDrawer() {
  const isOpen = useCartStore((s) => s.isOpen);
  const closeDrawer = useCartStore((s) => s.closeDrawer);
  const cart = useCartStore((s) => s.cart);
  const subtotal = useCartStore((s) => s.subtotal);
  const updateItem = useCartStore((s) => s.updateItem);
  const removeItem = useCartStore((s) => s.removeItem);

  const items = cart?.items || [];

  async function handleQty(productId: number, next: number) {
    try {
      await updateItem(productId, next);
    } catch {
      toast.error("Couldn't update quantity");
    }
  }

  async function handleRemove(productId: number) {
    try {
      await removeItem(productId);
      toast.success("Removed from bag");
    } catch {
      toast.error("Couldn't remove item");
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
            className="fixed inset-0 bg-black/40 z-50"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-background z-50 shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between px-6 h-16 border-b border-border">
              <h2 className="font-heading font-semibold text-lg">Bag</h2>
              <button
                onClick={closeDrawer}
                aria-label="Close bag"
                className="h-9 w-9 rounded-full hover:bg-surface flex items-center justify-center focus-ring"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center gap-3 text-muted">
                  <ShoppingBag size={40} strokeWidth={1.25} />
                  <p className="text-[15px]">Your bag is empty.</p>
                  <Link
                    href="/products"
                    onClick={closeDrawer}
                    className="text-accent text-sm font-medium hover:underline"
                  >
                    Continue shopping
                  </Link>
                </div>
              ) : (
                <ul className="space-y-5">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.li
                        key={item.product_id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 40 }}
                        className="flex gap-4"
                      >
                        <div className="h-20 w-20 rounded-2xl bg-surface flex-shrink-0 relative overflow-hidden">
                          {item.product_image && (
                            <Image
                              src={item.product_image}
                              alt={item.product_name || "Product"}
                              fill
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-medium leading-tight truncate">{item.product_name}</p>
                          <motion.p
                            key={item.unit_price_snapshot * item.quantity}
                            initial={{ opacity: 0.4 }}
                            animate={{ opacity: 1 }}
                            className="text-[13px] text-muted mt-1"
                          >
                            ${(item.unit_price_snapshot * item.quantity).toFixed(2)}
                          </motion.p>
                          <div className="flex items-center gap-3 mt-2">
                            <div className="flex items-center border border-border rounded-full">
                              <button
                                onClick={() => handleQty(item.product_id, item.quantity - 1)}
                                className="h-7 w-7 flex items-center justify-center hover:bg-surface rounded-full"
                                aria-label="Decrease quantity"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="w-6 text-center text-[13px]">{item.quantity}</span>
                              <button
                                onClick={() => handleQty(item.product_id, item.quantity + 1)}
                                className="h-7 w-7 flex items-center justify-center hover:bg-surface rounded-full"
                                aria-label="Increase quantity"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                            <button
                              onClick={() => handleRemove(item.product_id)}
                              aria-label="Remove item"
                              className="text-muted hover:text-error transition-colors"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="px-6 py-5 border-t border-border">
                <div className="flex justify-between text-[15px] mb-4">
                  <span className="text-muted">Subtotal</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                <Link
                  href="/checkout"
                  onClick={closeDrawer}
                  className="block text-center w-full bg-accent hover:bg-accent-hover text-white rounded-full py-3 text-[15px] font-medium transition-colors"
                >
                  Check out
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
