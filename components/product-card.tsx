"use client";

import Link from "next/link";
import { Product } from "@/lib/catalog";
import { useShopState } from "@/components/shop-state";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart, isWishlisted, toggleWishlist } = useShopState();
  const wishlisted = isWishlisted(product.slug);

  return (
    <article className="group overflow-hidden rounded-3xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-sm">
      <div className="relative aspect-[4/5.75] overflow-hidden bg-slate-100">
        <img src={product.image} alt={product.name} className="h-full w-full scale-[1.14] object-cover transition duration-500 group-hover:scale-[1.18]" />
        {product.badge ? (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-medium tracking-[0.12em] text-slate-700 uppercase shadow-sm">
            {product.badge}
          </span>
        ) : null}
      </div>
      <div className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">{product.brand}</p>
            <h3 className="mt-1 text-lg font-semibold text-slate-900">{product.name}</h3>
          </div>
          <button type="button" onClick={() => toggleWishlist(product.slug, product)} className={`wishlist-button rounded-full border p-2 transition hover:border-sky-200 hover:text-sky-700 ${wishlisted ? "border-sky-300 text-sky-700" : "border-slate-200 text-slate-500"}`} aria-label={`${wishlisted ? "Remove" : "Add"} ${product.name} ${wishlisted ? "from" : "to"} wishlist`}>
            {wishlisted ? "♥" : "♡"}
          </button>
        </div>

        <p className="text-sm leading-6 text-slate-600">{product.shortDescription}</p>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xl font-semibold text-slate-900">₹{product.price.toLocaleString("en-IN")}</p>
            {product.compareAtPrice ? <p className="text-sm text-slate-400 line-through">₹{product.compareAtPrice.toLocaleString("en-IN")}</p> : null}
          </div>
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">{product.stockStatus.replace("-", " ")}</span>
        </div>

        <div className="flex gap-2">
          <Link href={`/products/${product.slug}`} className="flex-1 rounded-full bg-slate-900 px-4 py-2.5 text-center text-sm font-medium text-white transition hover:bg-slate-700">
            View product
          </Link>
          <button type="button" onClick={() => addToCart(product)} className="secondary-action rounded-full border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
            Add to cart
          </button>
        </div>
      </div>
    </article>
  );
}
