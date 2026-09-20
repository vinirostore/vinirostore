"use client";

import { useEffect, useMemo, useState } from "react";
import { Product, getProductsFromStoreSync, saveProductsToStore } from "@/lib/catalog";

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    setProducts(getProductsFromStoreSync());
  }, []);

  const sortedProducts = useMemo(
    () => [...products].sort((a, b) => a.name.localeCompare(b.name)),
    [products]
  );

  const totalInventory = products.reduce((sum, product) => sum + product.inventory, 0);

  function updateInventory(productId: string, nextValue: number) {
    const normalized = Math.max(0, Number.isFinite(nextValue) ? nextValue : 0);
    const stockStatus: Product["stockStatus"] = normalized === 0 ? "out-of-stock" : normalized <= 10 ? "low-stock" : "in-stock";

    const updated: Product[] = products.map((product) => {
      if (product.id !== productId) return product;

      return {
        ...product,
        inventory: normalized,
        stockStatus,
      };
    });

    setProducts(updated);
    saveProductsToStore(updated);
  }

  function adjustInventory(productId: string, delta: number) {
    const product = products.find((item) => item.id === productId);
    if (!product) return;

    updateInventory(productId, product.inventory + delta);
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Inventory</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Stock overview</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Total stock</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{totalInventory}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Low stock</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{products.filter((item) => item.inventory > 0 && item.inventory <= 10).length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Out of stock</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{products.filter((item) => item.inventory === 0).length}</p>
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Stock management</h2>
          <span className="text-sm text-slate-500">{sortedProducts.length} products</span>
        </div>

        <div className="space-y-3">
          {sortedProducts.map((product) => (
            <div key={product.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <img src={product.image} alt={product.name} className="h-12 w-12 rounded-xl object-cover" />
                  <div>
                    <p className="font-medium text-slate-900">{product.name}</p>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{product.brand}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 md:justify-end">
                  <button
                    type="button"
                    onClick={() => adjustInventory(product.id, -1)}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-lg text-slate-700"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={0}
                    value={product.inventory}
                    onChange={(event) => updateInventory(product.id, Number(event.target.value || 0))}
                    className="w-24 rounded-xl border border-slate-200 bg-white px-3 py-2 text-center text-sm font-semibold text-slate-900 outline-none ring-0"
                  />
                  <button
                    type="button"
                    onClick={() => adjustInventory(product.id, 1)}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-lg text-slate-700"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600">
                <span>{product.category}</span>
                <span>₹{product.price.toLocaleString("en-IN")}</span>
                <span className="rounded-full bg-sky-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-700">{product.stockStatus}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
