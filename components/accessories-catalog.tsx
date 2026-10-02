"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { accessoryCategoryGroups, getAccessoryCategoryGroupLabel, getAccessoryCategoryLabel, type Accessory } from "@/lib/catalog";

export function AccessoriesCatalog({ accessories, initialSearch, initialCategory }: { accessories: Accessory[]; initialSearch: string; initialCategory: string }) {
  const [search] = useState(initialSearch.trim().toLowerCase());
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || "all");
  const filteredAccessories = useMemo(() => {
    return accessories.filter((item) => {
      const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
      const matchesSearch = !search || [item.name, item.category, item.shortDescription, item.description]
        .some((value) => value.toLowerCase().includes(search));
      return matchesCategory && matchesSearch;
    });
  }, [accessories, search, selectedCategory]);

  return (
    <>
      <div className="mb-6 flex flex-wrap gap-2" aria-label="Accessory categories">
        <button type="button" onClick={() => setSelectedCategory("all")} aria-pressed={selectedCategory === "all"} className={`rounded-full border px-4 py-2 text-sm font-medium ${selectedCategory === "all" ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-700"}`}>All</button>
        {accessoryCategoryGroups.flatMap((group) => group.categories).map((category) => (
          <button key={category.value} type="button" onClick={() => setSelectedCategory(category.value)} aria-pressed={selectedCategory === category.value} className={`rounded-full border px-4 py-2 text-sm font-medium ${selectedCategory === category.value ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-700"}`}>
            {category.label}
          </button>
        ))}
      </div>
      {filteredAccessories.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredAccessories.map((item) => (
            <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm">
              <img src={item.image} alt={item.name} className="h-36 w-full rounded-2xl object-cover" />
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{getAccessoryCategoryGroupLabel(item.category)} · {getAccessoryCategoryLabel(item.category)}</p>
              <h2 className="mt-1 text-lg font-semibold text-slate-900">{item.name}</h2>
              <p className="mt-1 text-sm text-slate-600">{item.shortDescription}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-lg font-semibold text-slate-900">₹{item.price.toLocaleString("en-IN")}</span>
                <Link href={`/accessories/${encodeURIComponent(item.slug)}`} className="text-sm font-medium text-sky-700">View details</Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-[30px] border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <p className="text-lg font-medium text-slate-700">No items in this category right now.</p>
          <p className="mt-2 text-sm text-slate-500">Items saved from the admin portal will appear here.</p>
        </div>
      )}
    </>
  );
}