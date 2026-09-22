import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getBrandList, getProductsFromStore } from "@/lib/catalog";

export default async function BrandsPage() {
  const brands = getBrandList();
  const products = await getProductsFromStore();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Brands</p>
          <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">Choose your RO brand</h1>
          <p className="max-w-2xl text-sm leading-7 text-slate-600">Browse trusted RO brands, compare model families, and pick the perfect purification system for your home or business.</p>
        </div>

        <div className="grid gap-6 grid-cols-2">
          {brands.map((brand) => {
            return (
              <div key={brand.id} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-slate-100">
                  <img src={brand.logo} alt={brand.name} className="h-full w-full object-cover" />
                </div>
                <div className="mt-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Brand</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">{brand.name}</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{brand.description}</p>
                </div>

                <div className="mt-5 flex items-center justify-end border-t border-slate-200 pt-4">
                  <Link href={`/brands/${brand.slug}`} className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-sky-700">
                    View more
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
