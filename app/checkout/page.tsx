"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { load } from "@cashfreepayments/cashfree-js";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { useAuthState } from "@/components/auth-state";
import { useShopState } from "@/components/shop-state";
import { calculateOrderSummary } from "@/lib/catalog";
import { supabase } from "@/lib/supabase";

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthReady, user } = useAuthState();
  const { cart } = useShopState();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const summary = calculateOrderSummary(cart);

  useEffect(() => {
    if (isAuthReady && !user) router.replace("/login?returnTo=%2Fcheckout");
  }, [isAuthReady, router, user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user?.id) {
      router.push("/login?returnTo=%2Fcheckout");
      return;
    }
    if (!cart.length) {
      setError("Your cart is empty.");
      return;
    }
    setIsSubmitting(true);
    setError("");
    const formData = new FormData(event.currentTarget);
    try {
      if (!supabase) throw new Error("Online payment is not configured. Please contact support.");
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (sessionError || !accessToken) throw new Error("Your login session expired. Please sign in again.");

      const response = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          phone: formData.get("phone"),
          address: formData.get("address"),
          city: formData.get("city"),
          state: formData.get("state"),
          pincode: formData.get("pincode"),
          items: cart.map(({ product, quantity }) => ({ productId: product.id, quantity, colorName: product.selectedColorName })),
        }),
      });
      const paymentOrder = await response.json() as {
        error?: string;
        paymentSessionId?: string;
        environment?: "sandbox" | "production";
      };
      if (!response.ok || !paymentOrder.paymentSessionId || !paymentOrder.environment) {
        throw new Error(paymentOrder.error || "Unable to start payment. Please try again.");
      }

      const cashfree = await load({ mode: paymentOrder.environment });
      if (!cashfree) throw new Error("Cashfree checkout could not be loaded. Check your connection and try again.");
      const checkoutResult = await cashfree.checkout({
        paymentSessionId: paymentOrder.paymentSessionId,
        redirectTarget: "_self",
      });
      if (checkoutResult?.error) throw new Error(checkoutResult.error.message || "Cashfree could not open the payment page.");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to start payment. Please try again.");
      setIsSubmitting(false);
    }
  }
  if (!isAuthReady || !user) {
    return <><SiteHeader /><main className="mx-auto max-w-6xl px-4 py-16 text-center text-sm text-slate-600">Sign in to continue to checkout...</main><SiteFooter /></>;
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
                <label className="text-sm font-medium text-slate-700 sm:col-span-2">Full name<input name="name" required autoComplete="name" defaultValue={user?.name || ""} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3" /></label>
                <label className="text-sm font-medium text-slate-700 sm:col-span-2">Phone number<input name="phone" required type="tel" inputMode="tel" autoComplete="tel" pattern="[0-9+() -]{10,18}" defaultValue={user?.phone || ""} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3" /></label>
                <label className="text-sm font-medium text-slate-700 sm:col-span-2">Street address<input name="address" required autoComplete="street-address" minLength={5} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3" /></label>
                <label className="text-sm font-medium text-slate-700">City<input name="city" required autoComplete="address-level2" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3" /></label>
                <label className="text-sm font-medium text-slate-700">State<input name="state" required autoComplete="address-level1" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3" /></label>
                <label className="text-sm font-medium text-slate-700">PIN code<input name="pincode" required inputMode="numeric" autoComplete="postal-code" pattern="[0-9]{6}" maxLength={6} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3" /></label>
              </div>
            </section>

            <section className="rounded-[30px] border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900">Payment</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">You’ll securely complete payment on Cashfree. Your order is confirmed only after payment is verified.</p>
              <button type="submit" disabled={isSubmitting || !cart.length} className="mt-5 w-full rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? "Connecting to Cashfree..." : `Pay ₹${summary.grandTotal.toLocaleString("en-IN")}`}</button>
              {error ? <p className="mt-4 text-sm text-rose-700" role="alert">{error}</p> : null}
            </section>
          </form>

          <aside className="rounded-[30px] border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">Order summary</h2>
            <div className="mt-5 space-y-3 text-sm text-slate-600">
              <div className="flex justify-between"><span>Subtotal</span><span>₹{summary.subtotal.toLocaleString("en-IN")}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>₹{summary.shipping.toLocaleString("en-IN")}</span></div>
            </div>
            <div className="mt-5 border-t border-slate-200 pt-5 flex justify-between text-base font-semibold text-slate-900">
              <span>Total (incl. GST)</span>
              <span>₹{summary.grandTotal.toLocaleString("en-IN")}</span>
            </div>
            {cart.length === 0 ? <p className="mt-5 text-sm text-slate-600">Your cart is empty.</p> : null}
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
