import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductActions } from "@/components/product-actions";
import { getBrandBySlug, getBrandModels, getProductBySlugFromStore, getProductsFromStore } from "@/lib/catalog";

export default async function BrandModelDetailPage({ params }: { params: Promise<{ brand: string; model: string }> }) {
  const { brand: brandSlug, model: modelSlug } = await params;
  const brand = getBrandBySlug(brandSlug);
  if (!brand) notFound();

  const models = getBrandModels(brandSlug);
  const model = models.find((item) => item.slug === modelSlug);
  if (!model) notFound();

  const products = await getProductsFromStore();
  const modelProducts = products.filter((product) => product.brandId === brand.id && (product.modelSlug === model.slug || product.model === model.name));

  const mainProduct = modelProducts[0] ?? products.find((product) => product.brandId === brand.id && product.slug.includes(modelSlug)) ?? products.find((product) => product.brand === brand.name && product.slug.includes(modelSlug));

  if (!mainProduct) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{brand.name}</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">{model.name}</h1>
        <p className="mt-4 text-slate-600">This model is available for selection but no product variant has been created yet.</p>
        <div className="mt-6 flex gap-3">
          <Link href={`/brands/${brand.slug}`} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700">Back to models</Link>
          <Link href="/products" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white">Browse products</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{brand.name} / {model.name}</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900 sm:text-4xl">{mainProduct.name}</h1>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white p-4">
            <img src={mainProduct.image} alt={mainProduct.name} className="h-[420px] w-full rounded-[20px] object-cover" />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {mainProduct.gallery.map((image) => (
              <div key={image} className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-2">
                <img src={image} alt={mainProduct.name} className="h-28 w-full rounded-xl object-cover" />
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm leading-7 text-slate-600">{model.description}</p>
          <div className="mt-6 flex items-center gap-3">
            <span className="text-3xl font-semibold text-slate-900">₹{mainProduct.price.toLocaleString("en-IN")}</span>
            {mainProduct.compareAtPrice ? <span className="text-lg text-slate-400 line-through">₹{mainProduct.compareAtPrice.toLocaleString("en-IN")}</span> : null}
          </div>

          <div className="mt-6">
            <ProductActions product={mainProduct} />
          </div>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700">
            <p className="font-medium text-slate-900">Model details</p>
            <ul className="mt-3 space-y-2">
              <li>Brand: {brand.name}</li>
              <li>Model: {model.name}</li>
              <li>Availability: {mainProduct.stockStatus === "in-stock" ? "In stock" : "Limited stock"}</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-semibold text-slate-900">Other {brand.name} options</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {modelProducts.filter((item) => item.id !== mainProduct.id).map((product) => (
            <Link key={product.id} href={`/products/${product.slug}`} className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
              <img src={product.image} alt={product.name} className="h-48 w-full rounded-2xl object-cover" />
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-slate-900">{product.name}</h3>
                <p className="mt-2 text-sm text-slate-600">{product.shortDescription}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
