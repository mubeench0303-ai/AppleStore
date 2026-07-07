"use client";

import type { Category } from "@/types";
import { motion } from "framer-motion";
import { X } from "lucide-react";

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
  resultCount,
}: {
  categories: Category[];
  filters: FiltersState;
  onChange: (next: FiltersState) => void;
  resultCount?: number;
}) {
  const activeCategory = categories.find((c) => c.id === filters.categoryId);
  const hasPriceFilter = filters.minPrice !== undefined || filters.maxPrice !== undefined;
  const hasActiveFilters = filters.categoryId || hasPriceFilter || filters.sort !== "newest";

  function clearAll() {
    onChange({ sort: "newest" });
  }

  return (
    <div className="space-y-2">
      {/* Row 1: categories + sort/price controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar flex-1 min-w-0 pb-0.5">
          <Chip active={!filters.categoryId} onClick={() => onChange({ ...filters, categoryId: undefined })}>
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

        <div className="hidden lg:flex items-center gap-2 shrink-0">
          <select
            value={filters.sort}
            onChange={(e) => onChange({ ...filters, sort: e.target.value as FiltersState["sort"] })}
            className="text-[12px] border border-border rounded-full px-3 py-1.5 bg-card focus-ring"
          >
            <option value="newest">Newest</option>
            <option value="popularity">Best selling</option>
            <option value="price_asc">Price ↑</option>
            <option value="price_desc">Price ↓</option>
          </select>
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice ?? ""}
            onChange={(e) => onChange({ ...filters, minPrice: e.target.value ? Number(e.target.value) : undefined })}
            className="w-[4.5rem] border border-border rounded-full px-2.5 py-1.5 text-[12px] bg-card focus-ring"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice ?? ""}
            onChange={(e) => onChange({ ...filters, maxPrice: e.target.value ? Number(e.target.value) : undefined })}
            className="w-[4.5rem] border border-border rounded-full px-2.5 py-1.5 text-[12px] bg-card focus-ring"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0 text-[11px] sm:text-[12px] text-muted">
          {resultCount !== undefined && (
            <span className="hidden sm:inline whitespace-nowrap">
              <span className="font-medium text-ink">{resultCount}</span>
            </span>
          )}
          {hasActiveFilters && (
            <button type="button" onClick={clearAll} className="text-accent hover:underline font-medium whitespace-nowrap">
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Row 2 on smaller screens: sort + price */}
      <div className="flex lg:hidden flex-wrap items-center gap-2">
        <select
          value={filters.sort}
          onChange={(e) => onChange({ ...filters, sort: e.target.value as FiltersState["sort"] })}
          className="text-[12px] border border-border rounded-full px-3 py-1.5 bg-card focus-ring"
        >
          <option value="newest">Newest</option>
          <option value="popularity">Best selling</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
        <input
          type="number"
          placeholder="Min $"
          value={filters.minPrice ?? ""}
          onChange={(e) => onChange({ ...filters, minPrice: e.target.value ? Number(e.target.value) : undefined })}
          className="w-20 border border-border rounded-full px-2.5 py-1.5 text-[12px] bg-card focus-ring"
        />
        <input
          type="number"
          placeholder="Max $"
          value={filters.maxPrice ?? ""}
          onChange={(e) => onChange({ ...filters, maxPrice: e.target.value ? Number(e.target.value) : undefined })}
          className="w-20 border border-border rounded-full px-2.5 py-1.5 text-[12px] bg-card focus-ring"
        />
        {resultCount !== undefined && (
          <span className="text-[12px] sm:hidden">
            <span className="font-medium text-ink">{resultCount}</span> items
          </span>
        )}
      </div>

      {/* Active pills — only when filters applied, single compact row */}
      {(activeCategory || hasPriceFilter) && (
        <div className="flex flex-wrap gap-1.5">
          {activeCategory && (
            <ActivePill label={activeCategory.name} onRemove={() => onChange({ ...filters, categoryId: undefined })} />
          )}
          {hasPriceFilter && (
            <ActivePill
              label={`$${filters.minPrice ?? 0}–${filters.maxPrice ?? "∞"}`}
              onRemove={() => onChange({ ...filters, minPrice: undefined, maxPrice: undefined })}
            />
          )}
        </div>
      )}
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
      className={`whitespace-nowrap text-[12px] px-3 py-1.5 rounded-full border transition-colors ${
        active ? "bg-accent text-white border-accent" : "border-border text-ink/80 hover:bg-surface bg-card"
      }`}
    >
      {children}
    </motion.button>
  );
}

function ActivePill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] bg-surface border border-border rounded-full pl-2.5 pr-1.5 py-1">
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${label} filter`}
        className="h-4 w-4 rounded-full hover:bg-border/40 flex items-center justify-center"
      >
        <X size={10} />
      </button>
    </span>
  );
}
