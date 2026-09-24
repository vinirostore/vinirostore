"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { useAuthState } from "@/components/auth-state";
import { useShopState } from "@/components/shop-state";
import { calculateOrderSummary } from "@/lib/catalog";
import { createCustomerOrder } from "@/lib/customer-data";

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuthState();
  const { cart } = useShopState();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const summary = calculateOrderSummary(cart);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user?.id) { router.push("/login"); return; }
    if (!cart.length) { setError("Your cart is empty."); return; }
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);
    const result = await createCustomerOrder({
      customerId: user.id,
      shippingName: String(formData.get("name") || "").trim(),
      shippingAddress: String(formData.get("address") || "").trim(),
      city: String(formData.get("city") || "").trim(),
      pincode: String(formData.get("pincode") || "").trim(),
      phone: String(formData.get("phone") || user.phone || "").trim(),
      subtotal: summary.subtotal,
      gst: summary.gst,
      shipping: summary.shipping,
      total: summary.grandTotal,
      items: cart.map(({ product, quantity }) => ({ productId: product.id, productName: product.name, productSlug: product.slug, productImage: product.image, sku: product.sku, unitPrice: product.price, quantity, lineTotal: product.price * quantity })),
    });
    if (result.error) { setError(result.error); setIsSubmitting(false); return; }
    router.push(`/account?order=${encodeURIComponent(result.orderNumber || "")}`);
  }
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Checkout</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">Complete your order</h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <section className="rounded-[30px] border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900">Delivery details</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <input name="name" required className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 sm:col-span-2" placeholder="Full name" />
                <input name="phone" required className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 sm:col-span-2" placeholder="Phone number" defaultValue={user?.phone || ""} />
                <input name="address" required className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 sm:col-span-2" placeholder="Full address" />
                <input name="city" required className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3" placeholder="City" />
                <input name="pincode" required className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3" placeholder="Pincode" />
              </div>
            </section>

            <section className="rounded-[30px] border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900">Payment</h2>
              <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                Cashfree payment is configured as the primary provider. Payment is verified server-side before order confirmation.
              </div>
              <button type="submit" disabled={isSubmitting} className="mt-5 rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white disabled:opacity-60">{isSubmitting ? "Saving order..." : "Place order"}</button>
              {error ? <p className="mt-4 text-sm text-rose-700" role="alert">{error}</p> : null}
            </section>
          </form>

          <aside className="rounded-[30px] border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">Order summary</h2>
            <div className="mt-5 space-y-3 text-sm text-slate-600">
              <div className="flex justify-between"><span>Subtotal</span><span>₹{summary.subtotal.toLocaleString("en-IN")}</span></div>
              <div className="flex justify-between"><span>GST</span><span>₹{summary.gst.toLocaleString("en-IN")}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>₹{summary.shipping.toLocaleString("en-IN")}</span></div>
            </div>
            <div className="mt-5 border-t border-slate-200 pt-5 flex justify-between text-base font-semibold text-slate-900">
              <span>Total</span>
              <span>₹{summary.grandTotal.toLocaleString("en-IN")}</span>
            </div>
            <Link href="/payment-result" className="mt-6 inline-flex w-full items-center justify-center rounded-full border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700">View payment result</Link>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
