"use client";

import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { useShopState } from "@/components/shop-state";
import { productsBySlug } from "@/lib/catalog";

export default function WishlistPage() {
  const { addToCart, toggleWishlist, wishlist, wishlistItems } = useShopState();
  const savedProducts = wishlistItems.length ? wishlistItems : wishlist.map((slug) => productsBySlug[slug]).filter(Boolean);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Wishlist</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">Saved items</h1>
        </div>

        {savedProducts.length === 0 ? <div className="rounded-[30px] border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">Your wishlist is empty.</div> : <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {savedProducts.map((product) => (
            <article key={product.slug} className="rounded-[30px] border border-slate-200 bg-white p-4">
              <Link href={`/products/${product.slug}`} className="block overflow-hidden rounded-[24px] bg-slate-100"><img src={product.image} alt={product.name} className="h-52 w-full object-cover" /></Link>
              <h2 className="mt-4 text-lg font-semibold text-slate-900">{product.name}</h2>
              <p className="mt-2 text-lg font-semibold text-slate-900">₹{product.price.toLocaleString("en-IN")}</p>
              <div className="mt-4 flex gap-3">
                <button type="button" onClick={() => addToCart(product)} className="flex-1 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white">Add to cart</button>
                <button type="button" onClick={() => toggleWishlist(product.slug, product)} className="rounded-full border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700">Remove</button>
              </div>
            </article>
          ))}
        </div>}
      </main>
      <SiteFooter />
    </>
  );
}
