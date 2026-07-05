"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2 } from "lucide-react";
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

  return (
    <div className="max-w-2xl">
      {addresses === null ? (
        <div className="h-24 bg-surface rounded-2xl animate-pulse" />
      ) : (
        <ul className="space-y-3 mb-6">
          <AnimatePresence>
            {addresses.map((a) => (
              <motion.li
                key={a.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-start justify-between p-5 rounded-2xl border border-border"
              >
                <div>
                  <p className="text-[14px] font-medium">{a.full_name}</p>
                  <p className="text-[13px] text-muted mt-1">
                    {a.street}, {a.city}, {a.state} {a.postal_code}, {a.country}
                  </p>
                  <p className="text-[13px] text-muted">{a.phone}</p>
                </div>
                <button onClick={() => handleDelete(a.id)} className="text-muted hover:text-error">
                  <Trash2 size={16} />
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
          {addresses.length === 0 && <p className="text-muted text-[14px]">No saved addresses yet.</p>}
        </ul>
      )}

      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 text-accent text-[14px] font-medium hover:underline"
        >
          <Plus size={16} /> Add a new address
        </button>
      ) : (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          onSubmit={handleAdd}
          className="grid sm:grid-cols-2 gap-4 bg-surface rounded-3xl p-6"
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
                value={(form as any)[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                className="w-full border border-border rounded-xl px-4 py-3 text-[14px] bg-white focus-ring"
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
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-muted text-[14px] hover:text-ink"
            >
              Cancel
            </button>
          </div>
        </motion.form>
      )}
    </div>
  );
}
