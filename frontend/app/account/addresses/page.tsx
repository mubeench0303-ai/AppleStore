"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, MapPin } from "lucide-react";
import toast from "react-hot-toast";
import type { Address } from "@/types";
import { addressService } from "@/lib/services/address.service";

const EMPTY = {
  full_name: "",
  phone: "",
  street: "",
  city: "",
  state: "",
  postal_code: "",
  country: "",
  is_default: false,
};

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function load() {
    addressService.list().then(setAddresses).catch(() => setAddresses([]));
  }

  useEffect(load, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addressService.create(form);
      toast.success("Address saved");
      setForm(EMPTY);
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save address");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      await addressService.remove(id);
      toast.success("Address removed");
      load();
    } catch {
      toast.error("Couldn't remove address");
    }
  }

  if (addresses === null) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-24 bg-surface rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-heading text-lg font-semibold">Saved addresses</h2>
        <p className="text-[13px] text-muted mt-1">Manage delivery addresses for faster checkout.</p>
      </div>

      {addresses.length === 0 && !showForm ? (
        <div className="text-center py-12 rounded-3xl border border-dashed border-border">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-surface text-muted mb-4">
            <MapPin size={22} />
          </div>
          <p className="text-[15px] font-medium text-ink">No addresses saved</p>
          <p className="text-[13px] text-muted mt-1 max-w-xs mx-auto">
            Add a shipping address to speed up checkout next time.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-5 inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white rounded-full px-6 py-2.5 text-[14px] font-medium"
          >
            <Plus size={16} /> Add address
          </button>
        </div>
      ) : (
        <ul className="space-y-3 mb-6">
          <AnimatePresence>
            {addresses.map((a, i) => (
              <motion.li
                key={a.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-start justify-between gap-4 p-5 rounded-2xl border border-border bg-card hover:shadow-card transition-shadow"
              >
                <div className="flex gap-3 min-w-0">
                  <div className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface text-muted">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[14px] font-semibold">{a.full_name}</p>
                      {a.is_default && (
                        <span className="text-[10px] font-semibold uppercase tracking-wide bg-accent/10 text-accent px-2 py-0.5 rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-[13px] text-muted mt-1 leading-relaxed">
                      {a.street}, {a.city}, {a.state} {a.postal_code}
                      <br />
                      {a.country} · {a.phone}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(a.id)}
                  aria-label="Delete address"
                  className="text-muted hover:text-error p-1 shrink-0"
                >
                  <Trash2 size={16} />
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      {!showForm && addresses.length > 0 && (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 text-accent text-[14px] font-medium hover:underline"
        >
          <Plus size={16} /> Add a new address
        </button>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAdd}
            className="grid sm:grid-cols-2 gap-4 bg-surface rounded-3xl p-6 mt-4 overflow-hidden"
          >
            {(
              [
                ["full_name", "Full name"],
                ["phone", "Phone"],
                ["street", "Street address"],
                ["city", "City"],
                ["state", "State"],
                ["postal_code", "Postal code"],
                ["country", "Country"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className={key === "street" ? "sm:col-span-2" : ""}>
                <span className="text-[13px] text-ink/70 mb-1.5 block">{label}</span>
                <input
                  required
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="w-full border border-border rounded-xl px-4 py-3 text-[14px] bg-card focus-ring"
                />
              </label>
            ))}
            <div className="sm:col-span-2 flex gap-3 mt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-accent hover:bg-accent-hover disabled:opacity-60 text-white rounded-full px-6 py-2.5 text-[14px] font-medium"
              >
                {isSubmitting ? "Saving…" : "Save address"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="text-muted text-[14px] hover:text-ink">
                Cancel
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
