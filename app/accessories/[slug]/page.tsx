import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getAccessoryList } from "@/lib/catalog";

export default async function AccessoryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const accessory = getAccessoryList().find((item) => item.slug === slug);

  if (!accessory) {
    notFound();
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <Link href="/accessories" className="text-sm font-medium text-sky-700">← Back to accessories</Link>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
              <img src={accessory.image} alt={accessory.name} className="h-[420px] w-full rounded-[20px] object-cover" />
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{accessory.category}</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">{accessory.name}</h1>

            <div className="mt-5 flex items-center gap-3">
              <span className="text-3xl font-semibold text-slate-900">₹{accessory.price.toLocaleString("en-IN")}</span>
              {accessory.stock > 0 ? (
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">{accessory.stock} in stock</span>
              ) : (
                <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">Out of stock</span>
              )}
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-700">
              <p className="font-medium text-slate-900">About this accessory</p>
              <p className="mt-2">{accessory.description || accessory.shortDescription}</p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/cart" className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white">Add to cart</Link>
              <Link href="/wishlist" className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700">Add to wishlist</Link>
            </div>

            <div className="mt-8 space-y-6 text-sm leading-7 text-slate-600">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Highlights</h2>
                <ul className="mt-3 list-disc space-y-2 pl-5">
                  {accessory.features?.length ? (
                    accessory.features.map((feature) => <li key={feature}>{feature}</li>)
                  ) : (
                    <li>{accessory.shortDescription || "Premium RO accessory for better performance and maintenance."}</li>
                  )}
                </ul>
              </div>

              <div>
                <h2 className="text-base font-semibold text-slate-900">Why customers choose it</h2>
                <p className="mt-3">Built for dependable performance, cleaner water flow, and easier maintenance across VINI RO systems and accessories.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
