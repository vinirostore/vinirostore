"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Accessory, getAccessoryList, Product } from "@/lib/catalog";
import { useShopState } from "@/components/shop-state";

export function AccessoryDetail({ slug, initialAccessory }: { slug: string; initialAccessory?: Accessory }) {
  const [accessory, setAccessory] = useState<Accessory | undefined>(initialAccessory);
  const { addToCart, isWishlisted, toggleWishlist } = useShopState();

  useEffect(() => {
    if (!initialAccessory) {
      window.setTimeout(() => {
        setAccessory(getAccessoryList().find((item) => item.slug === slug));
      }, 0);
    }
  }, [initialAccessory, slug]);

  if (!accessory) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold text-slate-900">Accessory not found</h1>
        <p className="mt-3 text-slate-600">This accessory may have been removed or is not available yet.</p>
        <Link href="/accessories" className="mt-6 inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white">Back to accessories</Link>
      </main>
    );
  }

  const accessoryProduct: Product = {
    id: accessory.id,
    name: accessory.name,
    slug: accessory.slug,
    category: "accessories",
    brand: "VINI",
    price: accessory.price,
    inventory: accessory.stock,
    image: accessory.image,
    gallery: [accessory.image],
    description: accessory.description,
    shortDescription: accessory.shortDescription,
    sku: accessory.id,
    stockStatus: accessory.stock > 0 ? "in-stock" : "out-of-stock",
    status: accessory.status,
    features: accessory.features,
  };
  const wishlisted = isWishlisted(accessory.slug);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between gap-4">
        <Link href="/accessories" className="text-sm font-medium text-sky-700">← Back to accessories</Link>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
          <img src={accessory.image} alt={accessory.name} className="h-[420px] w-full rounded-[20px] object-cover" />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{accessory.category}</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">{accessory.name}</h1>
          <div className="mt-5 flex items-center gap-3">
            <span className="text-3xl font-semibold text-slate-900">₹{accessory.price.toLocaleString("en-IN")}</span>
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${accessory.stock > 0 ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
              {accessory.stock > 0 ? `${accessory.stock} in stock` : "Out of stock"}
            </span>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-700">
            <p className="font-medium text-slate-900">About this accessory</p>
            <p className="mt-2">{accessory.description || accessory.shortDescription}</p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" onClick={() => addToCart(accessoryProduct)} className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white">Add to cart</button>
            <button type="button" onClick={() => toggleWishlist(accessory.slug, accessoryProduct)} className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700">{wishlisted ? "♥ Wishlisted" : "♡ Add to wishlist"}</button>
          </div>

          <div className="mt-8 space-y-6 text-sm leading-7 text-slate-600">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Highlights</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                {(accessory.features?.length ? accessory.features : [accessory.shortDescription || "Premium RO accessory for better performance and maintenance."]).map((feature) => <li key={feature}>{feature}</li>)}
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
  );
}
