import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getBrandList } from "@/lib/catalog";

export default async function ProductsPage() {
  const brands = getBrandList();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 pb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Products</p>
          <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">Choose a brand and model</h1>
          <p className="max-w-2xl text-sm leading-7 text-slate-600">Browse the brand-first catalog and move from brand selection to model details before adding your preferred RO product to cart or wishlist.</p>
        </div>

        <div className="grid gap-6 grid-cols-2">
          {brands.map((brand) => {
            return (
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
            );
          })}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
