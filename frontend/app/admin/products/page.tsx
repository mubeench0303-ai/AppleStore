"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import type { Product, Category } from "@/types";
import { productService } from "@/lib/services/product.service";
import { categoryService } from "@/lib/services/category.service";

const EMPTY_FORM = {
  name: "",
  description: "",
  price: 0,
  stock_quantity: 0,
  category_id: 0,
  image_url: "",
  model_variant: "",
  is_active: true,
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function load() {
    productService
      .adminList()
      .then(({ data }) => setProducts(data))
      .catch(() => setProducts([]));
  }

  useEffect(() => {
    load();
    categoryService.list().then(setCategories).catch(() => setCategories([]));
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEdit(p: Product) {
    setEditing(p);
    setForm({
      name: p.name,
      description: p.description,
      price: p.price,
      stock_quantity: p.stock_quantity,
      category_id: p.category_id,
      image_url: p.image_url,
      model_variant: p.model_variant,
      is_active: p.is_active,
    });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.category_id || form.price <= 0) {
      toast.error("Name, category, and price are required");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = { ...form, is_active: form.is_active ?? true };
      if (editing) {
        await productService.update(editing.id, payload);
        toast.success("Product updated");
      } else {
        await productService.create(payload);
        toast.success("Product created");
      }
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save product");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this product?")) return;
    try {
      await productService.remove(id);
      toast.success("Product deleted");
      load();
    } catch {
      toast.error("Couldn't delete product");
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-heading text-lg font-semibold">Products</h2>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 bg-accent hover:bg-accent-hover text-white rounded-full px-5 py-2.5 text-[13px] font-medium"
        >
          <Plus size={14} /> New product
        </button>
      </div>

      {products === null ? (
        <div className="h-64 bg-surface rounded-2xl animate-pulse" />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-muted border-b border-border">
                <th className="py-3 pr-4">Name</th>
                <th className="py-3 pr-4">Category</th>
                <th className="py-3 pr-4">Price</th>
                <th className="py-3 pr-4">Stock</th>
                <th className="py-3 pr-4"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-border/60">
                  <td className="py-3 pr-4 font-medium">{p.name}</td>
                  <td className="py-3 pr-4 text-muted">{p.category_name}</td>
                  <td className="py-3 pr-4">${p.price.toFixed(2)}</td>
                  <td className="py-3 pr-4">{p.stock_quantity}</td>
                  <td className="py-3 pr-4">
                    <div className="flex gap-3">
                      <button onClick={() => openEdit(p)} className="text-muted hover:text-ink">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="text-muted hover:text-error">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)}
              className="fixed inset-0 bg-black/40 z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <form
                onSubmit={handleSubmit}
                className="bg-card rounded-3xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-heading text-lg font-semibold">{editing ? "Edit product" : "New product"}</h3>
                  <button type="button" onClick={() => setShowForm(false)}>
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-4">
                  <FormField label="Name">
                    <input
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      className="field"
                      required
                    />
                  </FormField>
                  <FormField label="Description">
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                      className="field"
                      rows={3}
                    />
                  </FormField>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Price ($)">
                      <input
                        type="number"
                        step="0.01"
                        value={form.price}
                        onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
                        className="field"
                        required
                      />
                    </FormField>
                    <FormField label="Stock">
                      <input
                        type="number"
                        value={form.stock_quantity}
                        onChange={(e) => setForm((f) => ({ ...f, stock_quantity: Number(e.target.value) }))}
                        className="field"
                      />
                    </FormField>
                  </div>
                  <FormField label="Category">
                    <select
                      value={form.category_id}
                      onChange={(e) => setForm((f) => ({ ...f, category_id: Number(e.target.value) }))}
                      className="field"
                      required
                    >
                      <option value={0}>Select…</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </FormField>
                  <FormField label="Model / variant">
                    <input
                      value={form.model_variant}
                      onChange={(e) => setForm((f) => ({ ...f, model_variant: e.target.value }))}
                      className="field"
                    />
                  </FormField>
                  <FormField label="Image URL">
                    <input
                      value={form.image_url}
                      onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
                      className="field"
                    />
                  </FormField>
                  <label className="flex items-center gap-2 text-[14px]">
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                      className="h-4 w-4 rounded border-border"
                    />
                    Visible in store
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-accent hover:bg-accent-hover disabled:opacity-60 text-white rounded-full py-3 text-[14px] font-medium mt-6"
                >
                  {isSubmitting ? "Saving…" : editing ? "Save changes" : "Create product"}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .field {
          width: 100%;
          border: 1px solid #d2d2d7;
          border-radius: 0.75rem;
          padding: 0.65rem 1rem;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[13px] text-ink/70 mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}
