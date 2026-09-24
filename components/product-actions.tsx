"use client";

import Link from "next/link";
import type { Product } from "@/lib/catalog";
import { useShopState } from "@/components/shop-state";

export function ProductActions({ product }: { product: Product }) {
  const { addToCart, isWishlisted, removeFromCart, toggleWishlist } = useShopState();
  const wishlisted = isWishlisted(product.slug);

  return (
    <div className="flex flex-wrap gap-3">
      <button type="button" onClick={() => addToCart(product)} className="rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white">Add to cart</button>
      <button type="button" onClick={() => toggleWishlist(product.slug, product)} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700" aria-label={`${wishlisted ? "Remove" : "Add"} ${product.name} ${wishlisted ? "from" : "to"} wishlist`}>
        {wishlisted ? "♥ Wishlisted" : "♡ Wishlist"}
      </button>
      <Link href="/products" className="rounded-full border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700">Back to shop</Link>
      <button type="button" onClick={() => removeFromCart(product.slug)} className="rounded-full border border-rose-200 px-5 py-3 text-sm font-medium text-rose-700">Remove product</button>
    </div>
  );
}
