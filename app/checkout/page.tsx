import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function CheckoutPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Checkout</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">Complete your order</h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <section className="rounded-[30px] border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900">Delivery details</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <input className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3" placeholder="First name" />
                <input className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3" placeholder="Last name" />
                <input className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 sm:col-span-2" placeholder="Full address" />
                <input className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3" placeholder="City" />
                <input className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3" placeholder="Pincode" />
              </div>
            </section>

            <section className="rounded-[30px] border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900">Payment</h2>
              <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                Cashfree payment is configured as the primary provider. Payment is verified server-side before order confirmation.
              </div>
              <button type="button" className="mt-5 rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white">Pay securely</button>
            </section>
          </div>

          <aside className="rounded-[30px] border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">Order summary</h2>
            <div className="mt-5 space-y-3 text-sm text-slate-600">
              <div className="flex justify-between"><span>Subtotal</span><span>₹10,899</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>₹199</span></div>
              <div className="flex justify-between"><span>Discount</span><span>₹0</span></div>
            </div>
            <div className="mt-5 border-t border-slate-200 pt-5 flex justify-between text-base font-semibold text-slate-900">
              <span>Total</span>
              <span>₹11,098</span>
            </div>
            <Link href="/payment-result" className="mt-6 inline-flex w-full items-center justify-center rounded-full border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700">View payment result</Link>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
