"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getAccessoryCategoryLabel } from "@/lib/catalog";

type InventoryItem = {
  id: string;
  kind: "product" | "accessory" | "model";
  name: string;
  category: string;
  brand: string;
  model: string;
  sku: string;
  price: number;
  stock: number;
  image: string;
  active: boolean;
};

export default function AdminInventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [activeSection, setActiveSection] = useState<"models" | "accessories">("models");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [stockDrafts, setStockDrafts] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState("");
  const loadInProgress = useRef(false);

  useEffect(() => {
    let active = true;

    async function loadInventory() {
      if (document.visibilityState !== "visible") return;
      if (loadInProgress.current) return;
      loadInProgress.current = true;
      try {
        await performLoadInventory();
      } finally {
        loadInProgress.current = false;
      }
    }

    async function performLoadInventory() {
      if (!supabase) {
        if (active) {
          setError("Supabase is not configured.");
          setIsLoading(false);
        }
        return;
      }

      const { data, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !data.session) {
        if (active) {
          setError("Admin session expired. Sign in again to load inventory.");
          setIsLoading(false);
        }
        return;
      }

      try {
        const response = await fetch("/api/admin/inventory", {
          credentials: "include",
          cache: "no-store",
          headers: { Authorization: `Bearer ${data.session.access_token}` },
        });
        const result = await response.json() as { items?: InventoryItem[]; error?: string };
        if (!response.ok) throw new Error(result.error || "Could not load inventory from Supabase.");
        if (active) {
          setItems(result.items || []);
          setError("");
          setUpdatedAt(new Date().toLocaleTimeString());
        }
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : "Could not load inventory from Supabase.");
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void loadInventory();
    let interval: number | null = null;
    const startPolling = () => {
      if (document.visibilityState === "visible" && interval === null) {
        interval = window.setInterval(() => void loadInventory(), 30000);
      }
    };
    const stopPolling = () => {
      if (interval !== null) {
        window.clearInterval(interval);
        interval = null;
      }
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        stopPolling();
        return;
      }
      void loadInventory();
      startPolling();
    };
    const handleFocus = () => {
      if (document.visibilityState === "visible") void loadInventory();
    };
    startPolling();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    return () => {
      active = false;
      stopPolling();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const modelItems = items.filter((item) => item.kind === "model" || (item.kind === "product" && item.category.toLowerCase() === "ro"));
  const accessoryItems = items.filter((item) => !modelItems.includes(item));
  const accessoryCategoryValue = (item: InventoryItem) => item.kind === "accessory"
    ? item.category
    : item.category.toLowerCase() === "accessories" ? "general" : item.category.toLowerCase();
  const accessoryCategoryLabel = (item: InventoryItem) => {
    const value = accessoryCategoryValue(item);
    const label = getAccessoryCategoryLabel(value);
    return label === value ? value.replace(/[-_]/g, " ").replace(/\b\w/g, (character) => character.toUpperCase()) : label;
  };
  const accessoryCategories = [...new Set(accessoryItems.map(accessoryCategoryValue))].sort((a, b) => a.localeCompare(b));
  const sectionItems = activeSection === "models" ? modelItems : accessoryItems;
  const filteredItems = sectionItems
    .filter((item) => activeSection === "models" || categoryFilter === "all" || accessoryCategoryValue(item) === categoryFilter)
    .sort((a, b) => activeSection === "accessories"
      ? accessoryCategoryLabel(a).localeCompare(accessoryCategoryLabel(b)) || a.name.localeCompare(b.name)
      : a.name.localeCompare(b.name));
  const totalInventory = filteredItems.reduce((sum, item) => sum + item.stock, 0);
  const lowStockCount = filteredItems.filter((item) => item.stock > 0 && item.stock <= 10).length;
  const outOfStockCount = filteredItems.filter((item) => item.stock === 0).length;

  async function saveStock(item: InventoryItem, nextStock: number) {
    const stock = Math.max(0, Math.min(1000000, Math.floor(Number.isFinite(nextStock) ? nextStock : 0)));
    const previousStock = item.stock;
    setItems((current) => current.map((entry) => entry.id === item.id && entry.kind === item.kind ? { ...entry, stock } : entry));
    setSavingId(item.id);
    setError("");

    try {
      if (!supabase) throw new Error("Supabase is not configured.");
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !data.session) throw new Error("Admin session expired. Sign in again to update stock.");

      const response = await fetch("/api/admin/inventory", {
        method: "PATCH",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${data.session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: item.id, kind: item.kind, stock }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "Could not save stock to Supabase.");
      setStockDrafts((current) => {
        const next = { ...current };
        delete next[`${item.kind}:${item.id}`];
        return next;
      });
      setUpdatedAt(new Date().toLocaleTimeString());
    } catch (saveError) {
      setItems((current) => current.map((entry) => entry.id === item.id && entry.kind === item.kind ? { ...entry, stock: previousStock } : entry));
      setError(saveError instanceof Error ? saveError.message : "Could not save stock to Supabase.");
    } finally {
      setSavingId("");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Inventory</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Stock overview</h1>
      </div>

      <div role="tablist" aria-label="Inventory sections" className="inline-flex rounded-xl border border-slate-200 bg-white p-1">
        <button type="button" role="tab" aria-selected={activeSection === "models"} onClick={() => setActiveSection("models")} className={`rounded-lg px-4 py-2 text-sm font-medium ${activeSection === "models" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"}`}>
          RO Models <span className="ml-1 opacity-75">{modelItems.length}</span>
        </button>
        <button type="button" role="tab" aria-selected={activeSection === "accessories"} onClick={() => setActiveSection("accessories")} className={`rounded-lg px-4 py-2 text-sm font-medium ${activeSection === "accessories" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"}`}>
          Accessories <span className="ml-1 opacity-75">{accessoryItems.length}</span>
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Total stock</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{totalInventory}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Low stock</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{lowStockCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Out of stock</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{outOfStockCount}</p>
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{activeSection === "models" ? "RO model stock" : "Accessory stock"}</h2>
            <p className="mt-1 text-xs text-slate-500">Supabase · refreshed every 30 seconds{updatedAt ? ` · updated ${updatedAt}` : ""}</p>
          </div>
          <div className="flex items-center gap-3">
            {activeSection === "accessories" ? <label className="sr-only" htmlFor="inventory-accessory-category">Filter accessories by category</label> : null}
            {activeSection === "accessories" ? <select id="inventory-accessory-category" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="max-w-44 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
              <option value="all">All categories</option>
              {accessoryCategories.map((category) => {
                const sample = accessoryItems.find((item) => accessoryCategoryValue(item) === category);
                return <option key={category} value={category}>{sample ? accessoryCategoryLabel(sample) : category}</option>;
              })}
            </select> : null}
            <span className="text-sm text-slate-500">{filteredItems.length} items</span>
          </div>
        </div>

        <div className="space-y-3">
          {error ? <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</p> : null}
          {isLoading ? <p className="py-8 text-center text-sm text-slate-500">Loading stock from Supabase...</p> : null}
          {!isLoading && !error && filteredItems.length === 0 ? <p className="rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-600">{activeSection === "models" ? "No RO models were found in Supabase." : "No accessories were found in this category."}</p> : null}
          {filteredItems.map((item) => {
            const draftKey = `${item.kind}:${item.id}`;
            const stockValue = Number(stockDrafts[draftKey] ?? item.stock);
            const hasStockDraft = stockDrafts[draftKey] !== undefined && stockValue !== item.stock;
            return (
            <div key={`${item.kind}-${item.id}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  {item.image ? <img src={item.image} alt={item.name} className="h-12 w-12 rounded-xl object-cover" /> : <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-200 text-xs font-semibold text-slate-600">RO</div>}
                  <div>
                    <p className="font-medium text-slate-900">{item.name}</p>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{[item.brand, item.model].filter(Boolean).join(" · ") || item.kind}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 md:justify-end">
                  <button
                    type="button"
                    aria-label={`Decrease ${item.name} stock`}
                    disabled={savingId === item.id || stockValue === 0}
                    onClick={() => setStockDrafts((current) => ({ ...current, [draftKey]: String(stockValue - 1) }))}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-lg text-slate-700"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={0}
                    max={1000000}
                    step={1}
                    value={stockDrafts[draftKey] ?? item.stock}
                    disabled={savingId === item.id}
                    onChange={(event) => setStockDrafts((current) => ({ ...current, [draftKey]: event.target.value }))}
                    className="w-24 rounded-xl border border-slate-200 bg-white px-3 py-2 text-center text-sm font-semibold text-slate-900 outline-none ring-0"
                  />
                  <button
                    type="button"
                    aria-label={`Increase ${item.name} stock`}
                    disabled={savingId === item.id}
                    onClick={() => setStockDrafts((current) => ({ ...current, [draftKey]: String(stockValue + 1) }))}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-lg text-slate-700"
                  >
                    +
                  </button>
                  <button type="button" disabled={!hasStockDraft || savingId === item.id} onClick={() => void saveStock(item, stockValue)} className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">
                    {savingId === item.id ? "Saving" : "Save"}
                  </button>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600">
                <span>{activeSection === "accessories" ? accessoryCategoryLabel(item) : item.category}{item.sku ? ` · ${item.sku}` : ""}</span>
                {item.price ? <span>₹{item.price.toLocaleString("en-IN")}</span> : <span>{item.active ? "Active" : "Inactive"}</span>}
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${stockValue === 0 ? "bg-rose-50 text-rose-700" : stockValue <= 10 ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>
                  {stockValue === 0 ? "Out of stock" : stockValue <= 10 ? "Low stock" : "In stock"}
                </span>
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
