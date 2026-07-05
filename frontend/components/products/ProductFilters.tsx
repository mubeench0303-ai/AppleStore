"use client";

import type { Category } from "@/types";
import { motion } from "framer-motion";

export interface FiltersState {
  categoryId?: number;
  sort: "newest" | "price_asc" | "price_desc" | "popularity";
  minPrice?: number;
  maxPrice?: number;
}

export default function ProductFilters({
  categories,
  filters,
  onChange,
}: {
  categories: Category[];
  filters: FiltersState;
  onChange: (next: FiltersState) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        <Chip
          active={!filters.categoryId}
          onClick={() => onChange({ ...filters, categoryId: undefined })}
        >
          All
        </Chip>
        {categories.map((c) => (
          <Chip
            key={c.id}
            active={filters.categoryId === c.id}
            onClick={() => onChange({ ...filters, categoryId: c.id })}
          >
            {c.name}
          </Chip>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <select
          value={filters.sort}
          onChange={(e) => onChange({ ...filters, sort: e.target.value as FiltersState["sort"] })}
          className="text-[13px] border border-border rounded-full px-4 py-2 bg-white focus-ring"
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>

        <div className="flex items-center gap-2 text-[13px]">
          <input
            type="number"
            placeholder="Min $"
            value={filters.minPrice ?? ""}
            onChange={(e) => onChange({ ...filters, minPrice: e.target.value ? Number(e.target.value) : undefined })}
            className="w-24 border border-border rounded-full px-3 py-2 focus-ring"
          />
          <span className="text-muted">–</span>
          <input
            type="number"
            placeholder="Max $"
            value={filters.maxPrice ?? ""}
            onChange={(e) => onChange({ ...filters, maxPrice: e.target.value ? Number(e.target.value) : undefined })}
            className="w-24 border border-border rounded-full px-3 py-2 focus-ring"
          />
        </div>
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      className={`whitespace-nowrap text-[13px] px-4 py-2 rounded-full border transition-colors ${
        active ? "bg-ink text-white border-ink" : "border-border text-ink/80 hover:bg-surface"
      }`}
    >
      {children}
    </motion.button>
  );
}
