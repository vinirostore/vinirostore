import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getBrandList, getBrandModels, getProductsFromStore } from "@/lib/catalog";

export default async function ProductsPage() {
  const brands = getBrandList();
  const products = await getProductsFromStore();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 pb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Products</p>
          <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">Choose a brand and model</h1>
          <p className="max-w-2xl text-sm leading-7 text-slate-600">Browse the brand-first catalog and move from brand selection to model details before adding your preferred RO product to cart or wishlist.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {brands.map((brand) => {
            const modelCount = getBrandModels(brand.slug).length;
            const productCount = products.filter((product) => product.brandId === brand.id || product.brand === brand.name).length;

            return (
              <Link key={brand.id} href={`/brands/${brand.slug}`} className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-slate-100">
                  <img src={brand.logo} alt={brand.name} className="h-full w-full object-cover" />
                </div>
                <div className="mt-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Brand</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">{brand.name}</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{brand.description}</p>
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4 text-sm text-slate-600">
                  <span>{modelCount} models</span>
                  <span>{productCount} products</span>
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
