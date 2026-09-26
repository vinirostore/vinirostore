import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ProductCatalog } from "@/app/products/product-catalog";
import { getBrandListFromStore, getProductsFromStore } from "@/lib/catalog";

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ category?: string; search?: string; sort?: string }> }) {
  const [brands, products] = await Promise.all([getBrandListFromStore(), getProductsFromStore()]);
  const filters = await searchParams;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 pb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Products</p>
          <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">Choose a brand and model</h1>
          <p className="max-w-2xl text-sm leading-7 text-slate-600">Browse the brand-first catalog and move from brand selection to model details before adding your preferred RO product to cart or wishlist.</p>
        </div>

        <ProductCatalog initialBrands={brands} initialProducts={products} initialFilters={filters} />
      </main>
      <SiteFooter />
    </>
  );
}
