import Link from "next/link";
import { notFound } from "next/navigation";
import { getBrandBySlug, getBrandModels, getProductsFromStore } from "@/lib/catalog";

export default async function BrandDetailPage({ params }: { params: Promise<{ brand: string }> }) {
  const { brand: brandSlug } = await params;
  const brand = getBrandBySlug(brandSlug);
  if (!brand) notFound();

  const models = getBrandModels(brandSlug);
  const products = await getProductsFromStore();
  const brandedProducts = products.filter((product) => product.brandId === brand.id || product.brand === brand.name);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Brand</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900 sm:text-4xl">{brand.name}</h1>
        </div>
        <Link href="/brands" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700">Back to brands</Link>
      </div>

      <div className="mb-8 rounded-[28px] border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-5">
          <div className="h-20 w-20 overflow-hidden rounded-2xl bg-slate-100">
            <img src={brand.logo} alt={brand.name} className="h-full w-full object-cover" />
          </div>
          <div>
            <p className="text-sm leading-7 text-slate-600">{brand.description}</p>
          </div>
        </div>
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
  );
}
