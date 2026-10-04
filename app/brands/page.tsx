"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { brands as defaultBrands, defaultModels, getBrandList, getBrandListFromStore, getModelList, getModelListFromStore, subscribeToCatalogUpdates } from "@/lib/catalog";

export default function BrandsPage() {
  const brands = useSyncExternalStore(subscribeToCatalogUpdates, getBrandList, () => defaultBrands);
  const models = useSyncExternalStore(subscribeToCatalogUpdates, getModelList, () => defaultModels);
  const [catalogError, setCatalogError] = useState("");

  useEffect(() => {
    const syncBrands = async () => {
      try {
        await Promise.all([getBrandListFromStore(), getModelListFromStore()]);
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
          <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">Explore our brands</h1>
          <p className="max-w-2xl text-sm leading-7 text-slate-600">Browse trusted RO brands, compare model families, and pick the perfect purification system for your home or business.</p>
        </div>

        {catalogError ? <p role="alert" className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">Showing saved brand information. {catalogError}</p> : null}
        {brands.length ? <div className="brand-directory-grid grid grid-cols-1 gap-5 sm:grid-cols-2">
          {brands.map((brand) => {
            const modelCount = models.filter((model) => model.brandId === brand.id && model.status !== "inactive").length;
            return (
              <article key={brand.id} className="brand-directory-card overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
                <div className="brand-directory-image overflow-hidden bg-slate-50">
                  <img src={brand.logo} alt={`${brand.name} water purification`} className="h-full w-full object-contain" />
                </div>
                <div className="brand-directory-copy">
                  <div className="flex items-baseline justify-between gap-3">
                    <h2 className="min-w-0 truncate text-2xl font-semibold text-slate-900">{brand.name}</h2>
                    <span className="shrink-0 text-xs text-slate-500">{modelCount} {modelCount === 1 ? "model" : "models"}</span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{brand.description}</p>
                  <Link href={`/brands/${brand.slug}`} className="brand-directory-link mt-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
                    Explore collection <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </article>
            );
          })}
        </div> : catalogError ? <p className="text-sm text-slate-600">No saved brands are available offline. Please try again when the catalog connection is restored.</p> : <p className="text-sm text-slate-500">Loading brands...</p>}
      </main>
      <SiteFooter />
    </>
  );
}
