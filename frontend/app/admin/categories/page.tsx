"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import type { Category } from "@/types";
import { categoryService } from "@/lib/services/category.service";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function load() {
    categoryService.list().then(setCategories).catch(() => setCategories([]));
  }

  useEffect(load, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      await categoryService.create(name);
      toast.success("Category created");
      setName("");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't create category");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this category? Products in it must be reassigned first.")) return;
    try {
      await categoryService.remove(id);
      toast.success("Category deleted");
      load();
    } catch {
      toast.error("Couldn't delete — products may still reference this category");
    }
  }

  return (
    <div className="max-w-lg">
      <form onSubmit={handleAdd} className="flex gap-3 mb-8">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New category name"
          className="flex-1 border border-border rounded-full px-4 py-2.5 text-[14px] focus-ring"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-1.5 bg-accent hover:bg-accent-hover disabled:opacity-60 text-white rounded-full px-5 py-2.5 text-[13px] font-medium"
        >
          <Plus size={14} /> Add
        </button>
      </form>

      {categories === null ? (
        <div className="h-32 bg-surface rounded-2xl animate-pulse" />
      ) : (
        <ul className="space-y-2">
          <AnimatePresence>
            {categories.map((c) => (
              <motion.li
                key={c.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center justify-between px-5 py-3.5 rounded-2xl border border-border"
              >
                <span className="text-[14px] font-medium">{c.name}</span>
                <button onClick={() => handleDelete(c.id)} className="text-muted hover:text-error">
                  <Trash2 size={15} />
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}
