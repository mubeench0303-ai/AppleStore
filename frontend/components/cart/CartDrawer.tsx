"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { X, Minus, Plus, Trash2, Truck } from "lucide-react";
import { useCartStore } from "@/store/cart.store";
import toast from "react-hot-toast";
import EmptyState from "@/components/ui/EmptyState";

const listVariants = {
  animate: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

const itemVariants = {
  initial: { opacity: 0, x: 36, scale: 0.94, rotateY: -12 },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    rotateY: 0,
    transition: { type: "spring", stiffness: 420, damping: 28 },
  },
  exit: { opacity: 0, x: 48, scale: 0.9, transition: { duration: 0.2 } },
};

export default function CartDrawer() {
  const isOpen = useCartStore((s) => s.isOpen);
  const closeDrawer = useCartStore((s) => s.closeDrawer);
  const cart = useCartStore((s) => s.cart);
  const subtotal = useCartStore((s) => s.subtotal);
  const itemCount = useCartStore((s) => s.itemCount);
  const updateItem = useCartStore((s) => s.updateItem);
  const removeItem = useCartStore((s) => s.removeItem);

  const items = cart?.items || [];
  const freeShipping = subtotal >= 50;

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
            className="fixed inset-0 bg-black/40 z-50 backdrop-blur-[2px]"
          />
          <motion.aside
            initial={{ x: "100%", opacity: 0.8 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0.8 }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-background z-50 shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between px-6 h-16 border-b border-border">
              <div>
                <h2 className="font-heading font-semibold text-lg">Your Bag</h2>
                {itemCount > 0 && (
                  <p className="text-[12px] text-muted">{itemCount} item{itemCount !== 1 ? "s" : ""}</p>
                )}
              </div>
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
                <EmptyState
                  title="Your bag is empty"
                  message="Looks like you haven't added anything yet. Explore our latest products."
                  actionLabel="Continue shopping"
                  actionHref="/products"
                />
              ) : (
                <motion.ul variants={listVariants} initial="initial" animate="animate" className="space-y-4">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.li
                        key={item.product_id}
                        layout
                        variants={itemVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="flex gap-4 p-3 rounded-2xl bg-surface/60"
                      >
                        <div className="h-[72px] w-[72px] rounded-xl bg-surface flex-shrink-0 relative overflow-hidden shadow-card">
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
                          <p className="text-[14px] font-medium leading-tight line-clamp-2">{item.product_name}</p>
                          <motion.p
                            key={item.unit_price_snapshot * item.quantity}
                            initial={{ opacity: 0.4, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-[13px] text-muted mt-1"
                          >
                            ${item.unit_price_snapshot.toFixed(2)} × {item.quantity}
                          </motion.p>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center border border-border rounded-full bg-card">
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
                              className="text-muted hover:text-error transition-colors p-1"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </motion.ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="px-6 py-5 border-t border-border bg-surface/30">
                {!freeShipping && (
                  <p className="flex items-center gap-2 text-[12px] text-muted mb-3">
                    <Truck size={14} />
                    Add ${(50 - subtotal).toFixed(2)} more for free shipping
                  </p>
                )}
                {freeShipping && (
                  <p className="flex items-center gap-2 text-[12px] text-success mb-3 font-medium">
                    <Truck size={14} />
                    You qualify for free shipping
                  </p>
                )}
                <div className="flex justify-between text-[15px] mb-4">
                  <span className="text-muted">Subtotal</span>
                  <motion.span
                    key={subtotal}
                    initial={{ scale: 1.05 }}
                    animate={{ scale: 1 }}
                    className="font-semibold"
                  >
                    ${subtotal.toFixed(2)}
                  </motion.span>
                </div>
                <Link
                  href="/checkout"
                  onClick={closeDrawer}
                  className="block text-center w-full bg-accent hover:bg-accent-hover text-white rounded-full py-3.5 text-[15px] font-medium transition-colors shadow-card"
                >
                  Check out
                </Link>
                <Link
                  href="/products"
                  onClick={closeDrawer}
                  className="block text-center text-[13px] text-muted hover:text-ink mt-3"
                >
                  Continue shopping
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
