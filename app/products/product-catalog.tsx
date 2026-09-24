"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ProductCard } from "@/components/product-card";
import { Brand, Product, getBrandList, getProductsFromStoreSync } from "@/lib/catalog";

export function ProductCatalog({ initialBrands, initialProducts }: { initialBrands: Brand[]; initialProducts: Product[] }) {
  const [brands, setBrands] = useState(initialBrands);
  const [products, setProducts] = useState(initialProducts);

  useEffect(() => {
    const savedBrands = window.localStorage.getItem("vini-brands");
    const savedProducts = window.localStorage.getItem("vini-products");

    window.setTimeout(() => {
      if (savedBrands) setBrands(getBrandList());
      if (savedProducts) setProducts(getProductsFromStoreSync());
    }, 0);
  }, []);

  return (
    <>
      <div className="grid gap-6 grid-cols-2">
        {brands.map((brand) => (
          <Link key={brand.id} href={`/brands/${brand.slug}`} className="group min-w-0 rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-slate-100">
              <img src={brand.logo} alt={brand.name} className="h-full w-full object-cover" />
            </div>
            <div className="mt-5 min-w-0">
              <h2 className="whitespace-nowrap text-[clamp(0.7rem,4.5vw,1.5rem)] font-semibold text-slate-900">{brand.name}</h2>
            </div>
            <div className="mt-5 flex items-center justify-end border-t border-slate-200 pt-4">
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3.5 py-2 text-sm font-medium text-white transition group-hover:bg-sky-700">
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
            {products.filter((product) => product.status !== "inactive").map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-600">No products are available yet.</p>
        )}
      </section>
    </>
  );
}
