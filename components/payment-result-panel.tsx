"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuthState } from "@/components/auth-state";
import { useShopState } from "@/components/shop-state";
import { supabase } from "@/lib/supabase";

type PaymentResult = {
  error?: string;
  orderNumber?: string;
  paymentStatus?: string;
  cashfreeStatus?: string;
};

export function PaymentResultPanel({ orderId }: { orderId: string }) {
  const { isAuthReady, user } = useAuthState();
  const { clearCart } = useShopState();
  const [status, setStatus] = useState<"loading" | "pending" | "paid" | "failed" | "error">("loading");
  const [orderNumber, setOrderNumber] = useState("");
  const [message, setMessage] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!isAuthReady) return;
    if (!user || !orderId || !supabase) return;
    let active = true;

    async function verifyPayment() {
      try {
        const { data, error } = await supabase!.auth.getSession();
        const accessToken = data.session?.access_token;
        if (error || !accessToken) throw new Error("Please sign in to check this order's payment status.");

        const response = await fetch("/api/payments/verify-order", {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
          body: JSON.stringify({ orderId }),
          cache: "no-store",
        });
        const result = await response.json() as PaymentResult;
        if (!response.ok) throw new Error(result.error || "Payment status could not be checked.");
        if (!active) return;
        setOrderNumber(result.orderNumber || "");
        setMessage("");
        if (result.paymentStatus === "paid") {
          setStatus("paid");
          clearCart();
        } else if (result.paymentStatus === "failed") {
          setStatus("failed");
        } else {
          setStatus("pending");
        }
      } catch (error) {
        if (!active) return;
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Payment status could not be checked.");
      } finally {
        if (active) setIsChecking(false);
      }
    }

    void verifyPayment();
    return () => {
      active = false;
    };
  }, [clearCart, isAuthReady, orderId, retryCount, user]);

  const viewStatus = !isAuthReady || (user && status === "loading") ? "loading" : !user || !orderId ? "error" : status;
  const viewMessage = !user
    ? "Sign in with the same account you used at checkout to verify this payment."
    : !orderId ? "We could not identify this payment. Open your account or contact support." : message;
  const heading = viewStatus === "paid" ? "Payment confirmed" : viewStatus === "failed" ? "Payment not completed" : viewStatus === "pending" ? "Payment is processing" : viewStatus === "loading" ? "Checking your payment" : "Payment status unavailable";

  return (
    <section className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 text-left shadow-sm sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Cashfree checkout</p>
      <h1 className="mt-3 text-2xl font-semibold text-slate-900">{heading}</h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        {viewStatus === "paid" ? "Your payment was verified securely. Your order is being prepared." : viewStatus === "failed" ? "No successful payment was found. You can return to checkout and try again." : viewStatus === "pending" ? "Cashfree has not confirmed payment yet. Wait a moment, then check again." : viewStatus === "loading" ? "We’re confirming the result directly with Cashfree." : viewMessage}
      </p>
      {orderNumber ? <p className="mt-4 rounded-md bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">Order {orderNumber}</p> : null}
      {viewStatus === "error" && viewMessage ? <p className="mt-3 text-sm text-rose-700" role="alert">{viewMessage}</p> : null}
      <div className="mt-6 flex flex-wrap gap-3">
        {(viewStatus === "pending" || viewStatus === "error") && user && orderId ? <button type="button" onClick={() => { setIsChecking(true); setStatus("loading"); setRetryCount((count) => count + 1); }} disabled={isChecking} className="rounded-md bg-slate-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60">{isChecking ? "Checking..." : "Check payment again"}</button> : null}
        {viewStatus === "failed" ? <Link href="/checkout" className="rounded-md bg-slate-900 px-4 py-2.5 text-sm font-medium text-white">Return to checkout</Link> : null}
        <Link href="/account" className="rounded-md border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-800">My account</Link>
      </div>
    </section>
  );
}