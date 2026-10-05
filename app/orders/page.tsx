"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthState } from "@/components/auth-state";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getCustomerOrders, type CustomerOrder } from "@/lib/customer-data";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function getStatusClass(status: string) {
  const normalized = status.toLowerCase();
  if (normalized === "delivered") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (normalized === "cancelled" || normalized === "canceled") return "border-rose-200 bg-rose-50 text-rose-700";
  return "border-sky-200 bg-sky-50 text-sky-700";
}

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated, isAuthReady, user } = useAuthState();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthReady) return;
    if (!isAuthenticated || !user?.id) {
      router.replace("/login?returnTo=%2Forders");
      return;
    }

    let isCurrent = true;
    getCustomerOrders(user.id)
      .then((result) => {
        if (!isCurrent) return;
        setOrders(result.orders);
        setError(result.error || "");
      })
      .catch((loadError: unknown) => {
        if (!isCurrent) return;
        setError(loadError instanceof Error ? loadError.message : "Your orders could not be loaded.");
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [isAuthReady, isAuthenticated, router, user?.id]);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto min-h-[55vh] max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Your account</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">My orders</h1>
          <p className="mt-2 text-sm text-slate-600">Review your purchases and follow delivery updates.</p>
        </div>

        {isLoading ? (
          <div role="status" className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
            Loading your orders…
          </div>
        ) : error ? (
          <div role="alert" className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800">
            {error}
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center sm:p-12">
            <h2 className="text-xl font-semibold text-slate-900">No orders yet</h2>
            <p className="mt-2 text-sm text-slate-600">Your orders will appear here after checkout.</p>
            <Link href="/products" className="mt-5 inline-flex min-h-11 items-center rounded-full bg-sky-700 px-5 text-sm font-semibold text-white hover:bg-sky-800">
              Explore products
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <article key={order.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="font-semibold text-slate-900">Order {order.order_number}</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Placed {new Date(order.created_at).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                    </p>
                  </div>
                  <span className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClass(order.status)}`}>
                    {order.status.replaceAll("_", " ") || "Processing"}
                  </span>
                </div>

                <ul className="divide-y divide-slate-100">
                  {order.order_items.map((item) => (
                    <li key={item.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                      <span className="min-w-0 text-slate-700">
                        {item.product_name} <span className="text-slate-500">× {item.quantity}</span>
                      </span>
                      <span className="shrink-0 font-medium text-slate-900">{formatCurrency(item.line_total)}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
                  <p className="text-sm text-slate-600">
                    Total <span className="ml-1 font-semibold text-slate-900">{formatCurrency(order.total)}</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/track-order/${encodeURIComponent(order.id)}`}
                      className="inline-flex min-h-10 items-center rounded-full border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      View order
                    </Link>
                    {order.shiprocket_tracking_url ? (
                      <a
                        href={order.shiprocket_tracking_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex min-h-10 items-center rounded-full border border-sky-200 px-4 text-sm font-semibold text-sky-700 hover:bg-sky-50"
                      >
                        Track order
                      </a>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
