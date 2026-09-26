import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { ProductActions } from "@/components/product-actions";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getProductBySlugFromStore, getProductsFromStore } from "@/lib/catalog";

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlugFromStore(slug);
  if (!product) notFound();

  const products = await getProductsFromStore();
  const relatedProducts = products.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 3);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white p-4">
              <img src={product.image} alt={product.name} className="h-[520px] w-full scale-[1.06] rounded-[20px] object-cover" />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {product.gallery.map((image) => (
                <div key={image} className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-2">
                  <img src={image} alt={product.name} className="h-28 w-full rounded-xl object-cover" />
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{product.brand}</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">{product.name}</h1>
            <div className="mt-4 flex items-center gap-3">
              <span className="text-3xl font-semibold text-slate-900">₹{product.price.toLocaleString("en-IN")}</span>
              {product.compareAtPrice ? <span className="text-lg text-slate-400 line-through">₹{product.compareAtPrice.toLocaleString("en-IN")}</span> : null}
            </div>

            <div className="mt-6"><ProductActions product={product} /></div>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700">
              <p className="font-medium text-slate-900">Availability</p>
              <p className="mt-2">{product.stockStatus === "in-stock" ? "In stock and ready to dispatch" : product.stockStatus === "low-stock" ? "Low stock" : "Not available right now"}</p>
            </div>

            <div className="mt-8 space-y-6 text-sm leading-7 text-slate-600">
              <p>{product.description}</p>
              <div>
                <h2 className="text-base font-semibold text-slate-900">Features</h2>
                <ul className="mt-3 list-disc space-y-2 pl-5">
                  {product.features?.map((feature) => <li key={feature}>{feature}</li>)}
                </ul>
              </div>
              {product.specifications ? (
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Specifications</h2>
                  <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="rounded-xl border border-slate-200 bg-white p-3">
                        <dt className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{key}</dt>
                        <dd className="mt-1 font-medium text-slate-900">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <section className="mt-16">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-slate-900">Related products</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {relatedProducts.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
