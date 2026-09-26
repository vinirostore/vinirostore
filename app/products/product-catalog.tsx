"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ProductCard } from "@/components/product-card";
import { Brand, Product, getBrandList, getProductsFromStoreSync } from "@/lib/catalog";

export function ProductCatalog({ initialBrands, initialProducts, initialFilters }: { initialBrands: Brand[]; initialProducts: Product[]; initialFilters?: { category?: string; search?: string; sort?: string } }) {
  const [brands, setBrands] = useState(initialBrands);
  const [products, setProducts] = useState(initialProducts);
  const filteredProducts = useMemo(() => {
    const search = initialFilters?.search?.trim().toLowerCase() ?? "";
    const category = initialFilters?.category?.toLowerCase() ?? "";
    const next = products.filter((product) => product.status !== "inactive").filter((product) => !category || product.category.toLowerCase() === category).filter((product) => {
      if (!search) return true;
      return [product.name, product.brand, product.model, product.category, product.shortDescription, product.description].filter(Boolean).some((value) => String(value).toLowerCase().includes(search));
    });
    if (initialFilters?.sort === "discount") return [...next].sort((a, b) => discountFor(b) - discountFor(a));
    if (initialFilters?.sort === "popular") return [...next].sort((a, b) => Number(b.bestSeller) - Number(a.bestSeller));
    if (initialFilters?.sort === "featured") return [...next].sort((a, b) => Number(b.featured) - Number(a.featured));
    if (initialFilters?.sort === "newest") return [...next].sort((a, b) => Number(Boolean(b.newArrival)) - Number(Boolean(a.newArrival)) || Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || Number(b.price) - Number(a.price));
    return next;
  }, [initialFilters, products]);

  useEffect(() => {
    const syncCatalog = () => {
      const savedBrands = window.localStorage.getItem("vini-brands");
      const savedProducts = window.localStorage.getItem("vini-products");

      if (savedBrands) setBrands(getBrandList());
      if (savedProducts) setProducts(getProductsFromStoreSync());
    };

    syncCatalog();
    const handleCatalogChange = () => syncCatalog();
    window.addEventListener("vini-catalog-updated", handleCatalogChange);
    window.addEventListener("storage", handleCatalogChange);

    return () => {
      window.removeEventListener("vini-catalog-updated", handleCatalogChange);
      window.removeEventListener("storage", handleCatalogChange);
    };
  }, []);

  return (
    <>
      <div className="grid grid-cols-2 gap-6 lg:gap-8">
        {brands.map((brand) => (
          <Link key={brand.id} href={`/brands/${brand.slug}`} className="group flex aspect-square min-h-0 min-w-0 flex-col justify-between overflow-hidden rounded-[30px] border border-slate-200 bg-white p-2.5 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md sm:p-7">
            <div className="flex aspect-square w-16 max-w-[38%] items-center justify-center overflow-hidden rounded-2xl bg-slate-100 sm:w-32">
              <img src={brand.logo} alt={brand.name} className="h-full w-full object-cover" />
            </div>
            <div className="mt-2 min-w-0 sm:mt-5">
              <h2 className="break-words text-[clamp(0.85rem,4.5vw,1.75rem)] font-semibold leading-tight text-slate-900">{brand.name}</h2>
            </div>
            <div className="mt-2 flex items-center justify-end border-t border-slate-200 pt-2 sm:mt-5 sm:pt-4">
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3.5 py-2 text-sm font-medium text-white transition group-hover:bg-sky-700 sm:px-4 sm:py-2.5">
                View more
                <span aria-hidden="true">→</span>
              </span>
            </div>
          </Link>
        ))}
      </div>

      <section className="mt-14">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-slate-900">All products</h2>
          <p className="mt-2 text-sm text-slate-600">Explore the latest products available in our catalog.</p>
        </div>
        {products.length ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-600">No products matched your search.</p>
        )}
      </section>
    </>
  );
}

function discountFor(product: Product) {
  if (!product.compareAtPrice || product.compareAtPrice <= product.price) return 0;
  return (product.compareAtPrice - product.price) / product.compareAtPrice;
}
