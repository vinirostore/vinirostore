"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { BrandBackButton } from "@/components/brand-back-button";
import { SiteHeader } from "@/components/site-header";
import {
  Brand,
  Product,
  ProductModelSummary,
  getBrandList,
  getBrandListFromStore,
  getModelSummaryList,
  getModelSummaryListFromStore,
  getProductsFromStore,
  getProductsFromStoreSync,
} from "@/lib/catalog";

export default function BrandDetailPage() {
  const params = useParams<{ brand: string }>();
  const brandSlug = params?.brand ?? "";
  const [brand, setBrand] = useState<Brand | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [catalogModels, setCatalogModels] = useState<ProductModelSummary[]>([]);
  const [hasLoadedCatalog, setHasLoadedCatalog] = useState(false);
  const [catalogError, setCatalogError] = useState("");

  useEffect(() => {
    const applyCatalog = (nextBrands: Brand[], nextModels: ProductModelSummary[], nextProducts: Product[], isFinal = false) => {
      const normalizeBrandRoute = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      let decodedBrandRoute = brandSlug;
      try {
        decodedBrandRoute = decodeURIComponent(brandSlug);
      } catch {
        // Keep the original route value if it contains malformed encoding.
      }
      const routeKey = normalizeBrandRoute(decodedBrandRoute);
      const nextBrand = nextBrands.find((item) => item.slug === brandSlug || item.slug === decodedBrandRoute || normalizeBrandRoute(item.slug) === routeKey || normalizeBrandRoute(item.name) === routeKey) ?? null;
      setBrand(nextBrand);
      setCatalogModels(nextModels);
      setProducts(nextProducts);
      if (nextBrand || isFinal) setHasLoadedCatalog(true);
    };

    const syncBrand = async () => {
      try {
        const [nextBrands, nextModels, nextProducts] = await Promise.all([getBrandListFromStore(), getModelSummaryListFromStore(), getProductsFromStore()]);
        applyCatalog(nextBrands, nextModels, nextProducts, true);
        setCatalogError("");
      } catch (error) {
        console.error("Could not refresh the brand model catalog:", error);
        setCatalogError(error instanceof Error ? error.message : "Could not refresh the brand model catalog.");
        setHasLoadedCatalog(true);
      }
    };

    applyCatalog(getBrandList(), getModelSummaryList(), getProductsFromStoreSync());
    void syncBrand();
    const handleCatalogChange = () => { void syncBrand(); };
    window.addEventListener("vini-catalog-updated", handleCatalogChange);

    return () => {
      window.removeEventListener("vini-catalog-updated", handleCatalogChange);
    };
  }, [brandSlug]);

  const models = useMemo(() => (brand ? catalogModels.filter((model) => model.brandId === brand.id) : []), [brand, catalogModels]);
  const brandedProducts = useMemo(() => (brand ? products.filter((product) => product.brandId === brand.id || product.brand === brand.name) : []), [brand, products]);

  if (!hasLoadedCatalog) {
    return <main className="mx-auto max-w-4xl px-4 py-16 text-center text-sm text-slate-500">Loading brand...</main>;
  }

  if (!brand) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Brand</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">This brand is not available yet.</h1>
            <p className="mt-3 text-sm leading-7 text-slate-600">The brand may still be pending or may not have been saved to the catalog yet.</p>
            <div className="mt-6 flex justify-center gap-3">
              <Link href="/brands" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700">Back to brands</Link>
              <Link href="/products" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white">Browse products</Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {catalogError ? <p role="alert" className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">Showing saved model information. {catalogError}</p> : null}
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Brand</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900 sm:text-4xl">{brand.name}</h1>
          </div>
          <BrandBackButton />
        </div>

        <div className="mb-8 rounded-[28px] border border-slate-200 bg-white p-6">
          <p className="text-sm leading-7 text-slate-600">{brand.description}</p>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Popular models</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {models.length ? models.map((model) => (
              <Link key={model.id} href={`/brands/${brand.slug}/${model.slug}`} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-200">
                <div className="overflow-hidden rounded-2xl bg-slate-100">
                  <img src={model.image} alt={model.name} className="h-52 w-full object-cover" />
                </div>
                <div className="mt-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Model</p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-900">{model.name}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{model.description}</p>
                </div>
              </Link>
            )) : (
              <div className="col-span-full rounded-[24px] border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-600">
                No models are available for this brand yet.
              </div>
            )}
          </div>
        </div>

        {brandedProducts.length ? (
          <div className="mt-12">
            <h2 className="text-2xl font-semibold text-slate-900">Products in this brand</h2>
            <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {brandedProducts.map((product) => (
                <div key={product.id} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                  <img src={product.image} alt={product.name} className="h-52 w-full rounded-2xl object-cover" />
                  <div className="mt-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">{product.model ?? product.name}</p>
                    <h3 className="mt-2 text-lg font-semibold text-slate-900">{product.name}</h3>
                    <p className="mt-2 text-sm text-slate-600">{product.shortDescription}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xl font-semibold text-slate-900">₹{product.price.toLocaleString("en-IN")}</span>
                      <Link href={`/products/${product.slug}`} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white">View product</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </main>
    </>
  );
}
