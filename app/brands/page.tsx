"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { brands as defaultBrands, getBrandList, getBrandListFromStore, subscribeToCatalogUpdates } from "@/lib/catalog";

export default function BrandsPage() {
  const brands = useSyncExternalStore(subscribeToCatalogUpdates, getBrandList, () => defaultBrands);
  const [catalogError, setCatalogError] = useState("");

  useEffect(() => {
    const syncBrands = async () => {
      try {
        await getBrandListFromStore();
        setCatalogError("");
      } catch (error) {
        console.error("Could not refresh the brand catalog:", error);
        setCatalogError(error instanceof Error ? error.message : "Could not refresh the brand catalog.");
      }
    };
    void syncBrands();

    const handleCatalogChange = () => { void syncBrands(); };
    window.addEventListener("vini-catalog-updated", handleCatalogChange);

    return () => {
      window.removeEventListener("vini-catalog-updated", handleCatalogChange);
    };
  }, []);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Brands</p>
          <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">Choose your RO brand</h1>
          <p className="max-w-2xl text-sm leading-7 text-slate-600">Browse trusted RO brands, compare model families, and pick the perfect purification system for your home or business.</p>
        </div>

        {catalogError ? <p role="alert" className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">Showing saved brand information. {catalogError}</p> : null}
        {brands.length ? <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {brands.map((brand) => {
            return (
              <div key={brand.id} className="flex aspect-square min-h-0 flex-col rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="min-h-0 flex-1 overflow-hidden rounded-2xl bg-slate-100">
                  <img src={brand.logo} alt={brand.name} className="h-full w-full object-cover" />
                </div>

                <div className="mt-5 flex items-center justify-between gap-4 border-t border-slate-200 pt-4">
                  <h2 className="min-w-0 truncate text-2xl font-semibold text-slate-900">{brand.name}</h2>
                  <Link href={`/brands/${brand.slug}`} className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-sky-700">
                    View more
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div> : catalogError ? <p className="text-sm text-slate-600">No saved brands are available offline. Please try again when the catalog connection is restored.</p> : <p className="text-sm text-slate-500">Loading brands...</p>}
      </main>
      <SiteFooter />
    </>
  );
}
