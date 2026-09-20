"use client";

import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { useShopState } from "@/components/shop-state";

export default function CartPage() {
  const { cart, cartCount, removeFromCart, updateCartQuantity } = useShopState();
  const subtotal = cart.reduce((total, line) => total + line.product.price * line.quantity, 0);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Cart</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">Your cart ({cartCount})</h1>
        </div>

        {cart.length === 0 ? <div className="rounded-[30px] border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">Your cart is empty.</div> : <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            {cart.map((line) => (
              <div key={line.product.slug} className="cart-line flex min-w-0 items-center gap-3 rounded-[28px] border border-slate-200 bg-white p-3 sm:gap-4 sm:p-4">
                <Link href={`/products/${line.product.slug}`} className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-slate-100"><img src={line.product.image} alt={line.product.name} className="h-full w-full object-cover" /></Link>
                <div className="min-w-0 flex-1">
                  <Link href={`/products/${line.product.slug}`} className="text-lg font-semibold text-slate-900">{line.product.name}</Link>
                  <p className="mt-1 text-sm text-slate-600">₹{line.product.price.toLocaleString("en-IN")}</p>
                  <div className="mt-2 flex items-center gap-2"><button type="button" onClick={() => updateCartQuantity(line.product.slug, line.quantity - 1)} className="h-7 w-7 rounded-full border border-slate-200">-</button><span className="text-sm">{line.quantity}</span><button type="button" onClick={() => updateCartQuantity(line.product.slug, line.quantity + 1)} className="h-7 w-7 rounded-full border border-slate-200">+</button><button type="button" onClick={() => removeFromCart(line.product.slug)} className="ml-2 text-sm text-rose-700">Remove product</button></div>
                </div>
                <p className="cart-line-total shrink-0 text-right text-sm font-semibold text-slate-900 sm:text-lg">₹{(line.product.price * line.quantity).toLocaleString("en-IN")}</p>
              </div>
            ))}
          </div>

          <aside className="rounded-[30px] border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">Summary</h2>
            <div className="mt-5 flex justify-between text-sm text-slate-600"><span>Subtotal</span><span>₹{subtotal.toLocaleString("en-IN")}</span></div>
            <Link href="/checkout" className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white">Proceed to checkout</Link>
          </aside>
        </div>}
      </main>
      <SiteFooter />
    </>
  );
}
