"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Elements } from "@stripe/react-stripe-js";
import toast from "react-hot-toast";
import { useCartStore } from "@/store/cart.store";
import { orderService } from "@/lib/services/order.service";
import { addressService } from "@/lib/services/address.service";
import { stripePromise } from "@/lib/stripe";
import PaymentForm from "@/components/checkout/PaymentForm";
import CheckoutStepper from "@/components/checkout/CheckoutStepper";
import Breadcrumb from "@/components/ui/Breadcrumb";
import type { Address, Order } from "@/types";

const EMPTY_FORM = {
  fullName: "",
  street: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
  phone: "",
};

function addressToForm(a: Address) {
  return {
    fullName: a.full_name,
    street: a.street,
    city: a.city,
    state: a.state,
    postalCode: a.postal_code,
    country: a.country,
    phone: a.phone,
  };
}

function pickDefaultAddress(addresses: Address[]): Address | null {
  if (addresses.length === 0) return null;
  return addresses.find((a) => a.is_default) ?? addresses[0];
}

export default function CheckoutPage() {
  const cart = useCartStore((s) => s.cart);
  const subtotal = useCartStore((s) => s.subtotal);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const items = cart?.items || [];

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);

  const currentStep = clientSecret && order ? 2 : 1;

  useEffect(() => {
    addressService
      .list()
      .then((list) => {
        setSavedAddresses(list);
        const defaultAddr = pickDefaultAddress(list);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
          setForm(addressToForm(defaultAddr));
        }
      })
      .catch(() => setSavedAddresses([]))
      .finally(() => setIsLoadingAddresses(false));
  }, []);

  function update(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleAddressSelect(id: number) {
    setSelectedAddressId(id);
    const addr = savedAddresses.find((a) => a.id === id);
    if (addr) setForm(addressToForm(addr));
  }

  function validate() {
    const next: Record<string, string> = {};
    Object.entries(form).forEach(([k, v]) => {
      if (!v.trim()) next[k] = "Required";
    });
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Your bag is empty");
      return;
    }
    if (!validate()) return;

    const shippingAddress = `${form.fullName}, ${form.street}, ${form.city}, ${form.state} ${form.postalCode}, ${form.country} — ${form.phone}`;

    setIsSubmitting(true);
    try {
      const res = await orderService.checkout(shippingAddress);
      if (!res.client_secret) {
        toast.error(res.payment_error || "Payment setup failed");
        return;
      }
      await fetchCart();
      setClientSecret(res.client_secret);
      setOrder(res.order);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  const summaryItems = order?.items?.length
    ? order.items.map((item) => ({
        key: item.id,
        label: `${item.product_name_snapshot} × ${item.quantity}`,
        amount: item.subtotal,
      }))
    : items.map((item) => ({
        key: item.product_id,
        label: `${item.product_name} × ${item.quantity}`,
        amount: item.unit_price_snapshot * item.quantity,
      }));

  const summaryTotal = order?.total_amount ?? subtotal;

  return (
    <div className="container-page py-10 sm:py-14 pb-20">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Bag", href: "/products" }, { label: "Checkout" }]} />

      <h1 className="font-heading text-2xl sm:text-3xl font-semibold tracking-tight mt-2 mb-8">Checkout</h1>

      <CheckoutStepper currentStep={currentStep as 1 | 2} />

      <div className="grid lg:grid-cols-[1fr_340px] gap-10 lg:gap-12">
        <AnimatePresence mode="wait">
          {currentStep === 2 && clientSecret && order ? (
            <motion.div
              key="payment"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <PaymentForm orderId={order.id} total={order.total_amount} />
              </Elements>
            </motion.div>
          ) : (
            <motion.form
              key="shipping"
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onSubmit={handlePlaceOrder}
              className="space-y-4"
              noValidate
            >
              <h2 className="font-heading text-lg font-semibold mb-1">Shipping address</h2>
              <p className="text-[13px] text-muted mb-4">Where should we deliver your order?</p>

              {isLoadingAddresses ? (
                <div className="space-y-4 mb-2">
                  <div className="h-10 bg-surface rounded-xl animate-pulse" />
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="h-10 bg-surface rounded-xl animate-pulse" />
                    <div className="h-10 bg-surface rounded-xl animate-pulse" />
                  </div>
                  <div className="h-10 bg-surface rounded-xl animate-pulse" />
                </div>
              ) : (
                <>
                  {savedAddresses.length === 0 && (
                    <p className="text-[13px] text-muted mb-2">
                      No saved address — add one in{" "}
                      <a href="/account/addresses" className="text-accent hover:underline">
                        your account
                      </a>
                      .
                    </p>
                  )}

                  {savedAddresses.length > 1 && (
                    <label className="block mb-2">
                      <span className="text-[13px] text-ink/70 mb-1.5 block">Saved address</span>
                      <select
                        value={selectedAddressId ?? ""}
                        onChange={(e) => handleAddressSelect(Number(e.target.value))}
                        className="checkout-input"
                      >
                        {savedAddresses.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.full_name} — {a.street}, {a.city}
                            {a.is_default ? " (Default)" : ""}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}

                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Full name" error={errors.fullName}>
                      <input
                        value={form.fullName}
                        onChange={(e) => update("fullName", e.target.value)}
                        className="checkout-input"
                      />
                    </Field>
                    <Field label="Phone" error={errors.phone}>
                      <input value={form.phone} onChange={(e) => update("phone", e.target.value)} className="checkout-input" />
                    </Field>
                  </div>
                  <Field label="Street address" error={errors.street}>
                    <input value={form.street} onChange={(e) => update("street", e.target.value)} className="checkout-input" />
                  </Field>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <Field label="City" error={errors.city}>
                      <input value={form.city} onChange={(e) => update("city", e.target.value)} className="checkout-input" />
                    </Field>
                    <Field label="State" error={errors.state}>
                      <input value={form.state} onChange={(e) => update("state", e.target.value)} className="checkout-input" />
                    </Field>
                    <Field label="Postal code" error={errors.postalCode}>
                      <input
                        value={form.postalCode}
                        onChange={(e) => update("postalCode", e.target.value)}
                        className="checkout-input"
                      />
                    </Field>
                  </div>
                  <Field label="Country" error={errors.country}>
                    <input value={form.country} onChange={(e) => update("country", e.target.value)} className="checkout-input" />
                  </Field>
                </>
              )}

              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting || isLoadingAddresses || items.length === 0}
                className="w-full sm:w-auto bg-accent hover:bg-accent-hover disabled:opacity-50 text-white rounded-full px-8 py-3.5 text-[15px] font-medium transition-colors mt-4 shadow-card"
              >
                {isSubmitting ? "Creating order…" : `Continue to payment · $${subtotal.toFixed(2)}`}
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>

        <motion.aside
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="bg-surface rounded-3xl p-6 h-fit lg:sticky lg:top-24 shadow-card"
        >
          <h2 className="font-heading text-lg font-semibold mb-4">Order summary</h2>
          {summaryItems.length === 0 ? (
            <p className="text-[14px] text-muted">Your bag is empty.</p>
          ) : (
            <ul className="space-y-3 max-h-64 overflow-y-auto">
              {summaryItems.map((item) => (
                <li key={item.key} className="flex justify-between gap-3 text-[14px]">
                  <span className="text-ink/80 line-clamp-2">{item.label}</span>
                  <span className="shrink-0 font-medium">${item.amount.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="border-t border-border mt-4 pt-4 space-y-2">
            <div className="flex justify-between text-[13px] text-muted">
              <span>Subtotal</span>
              <span>${summaryTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[13px] text-muted">
              <span>Shipping</span>
              <span>{summaryTotal >= 50 ? "Free" : "Calculated at delivery"}</span>
            </div>
            <div className="flex justify-between font-semibold text-[15px] pt-2">
              <span>Total</span>
              <span>${summaryTotal.toFixed(2)}</span>
            </div>
          </div>
        </motion.aside>
      </div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[13px] text-ink/70 mb-1.5 block">{label}</span>
      {children}
      {error && <span className="text-error text-[12px] mt-1 block">{error}</span>}
    </label>
  );
}
