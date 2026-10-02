"use client";

import { useEffect, useState } from "react";
import { useAuthState } from "@/components/auth-state";
import { supabase } from "@/lib/supabase";

type TrackingActivity = { date: string; status: string; description: string; location: string };
type TrackingOrder = {
  orderNumber: string;
  status: string;
  destination: string;
  courier: string;
  awb: string;
  trackingUrl: string;
  currentStatus: string;
  deliveredTo: string;
  estimatedDelivery: string;
  activities: TrackingActivity[];
};

type TrackingResponse = { error?: string; order?: TrackingOrder };

export function ShipmentTrackingPanel({ orderId }: { orderId: string }) {
  const { isAuthReady, user } = useAuthState();
  const [order, setOrder] = useState<TrackingOrder | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!isAuthReady || !user || !orderId || !supabase) return;
    let active = true;

    async function refreshTracking() {
      try {
        const { data, error: sessionError } = await supabase!.auth.getSession();
        const accessToken = data.session?.access_token;
        if (sessionError || !accessToken) throw new Error("Please sign in to see this delivery.");

        const response = await fetch(`/api/shiprocket/track?orderId=${encodeURIComponent(orderId)}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          cache: "no-store",
        });
        const result = await response.json() as TrackingResponse;
        if (!response.ok) throw new Error(result.error || "Unable to load tracking information.");
        if (!active) return;
        setOrder(result.order || null);
        setError("");
      } catch (trackingError) {
        if (!active) return;
        setError(trackingError instanceof Error ? trackingError.message : "Unable to load tracking information.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void refreshTracking();
    return () => {
      active = false;
    };
  }, [isAuthReady, orderId, retryCount, user]);

  const requiresLogin = isAuthReady && !user;

  return (
    <section className="w-full max-w-3xl rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Shiprocket delivery</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">Track your order</h1>
          {order ? <p className="mt-2 text-sm text-slate-600">Order {order.orderNumber}</p> : null}
        </div>
        {order ? <span className="rounded-full bg-sky-50 px-3 py-1.5 text-sm font-semibold text-sky-900">{order.currentStatus || order.status}</span> : null}
      </div>

      {loading ? <p className="py-8 text-sm text-slate-600" role="status">Loading the latest carrier update...</p> : null}
      {requiresLogin ? <p className="py-8 text-sm text-slate-700">Sign in with the account that placed this order to view tracking.</p> : null}
      {error ? <p className="py-8 text-sm text-rose-700" role="alert">{error}</p> : null}

      {order ? (
        <>
          <dl className="grid gap-4 border-b border-slate-200 py-5 sm:grid-cols-2">
            <div><dt className="text-xs uppercase tracking-[0.12em] text-slate-500">Courier</dt><dd className="mt-1 text-sm font-medium text-slate-900">{order.courier || "Shiprocket courier"}</dd></div>
            <div><dt className="text-xs uppercase tracking-[0.12em] text-slate-500">AWB</dt><dd className="mt-1 break-all text-sm font-medium text-slate-900">{order.awb}</dd></div>
            <div><dt className="text-xs uppercase tracking-[0.12em] text-slate-500">Destination</dt><dd className="mt-1 text-sm font-medium text-slate-900">{order.destination}</dd></div>
            {order.estimatedDelivery ? <div><dt className="text-xs uppercase tracking-[0.12em] text-slate-500">Estimated delivery</dt><dd className="mt-1 text-sm font-medium text-slate-900">{order.estimatedDelivery}</dd></div> : null}
            {order.deliveredTo ? <div><dt className="text-xs uppercase tracking-[0.12em] text-slate-500">Delivered to</dt><dd className="mt-1 text-sm font-medium text-slate-900">{order.deliveredTo}</dd></div> : null}
          </dl>

          <div className="py-5">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-base font-semibold text-slate-900">Tracking activity</h2>
              <button type="button" onClick={() => { setLoading(true); setRetryCount((count) => count + 1); }} disabled={loading} className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-800 disabled:opacity-50">{loading ? "Refreshing..." : "Refresh"}</button>
            </div>
            {order.activities.length ? (
              <ol className="mt-5 space-y-5">
                {order.activities.map((activity, index) => (
                  <li key={`${activity.date}-${index}`} className="relative flex gap-3">
                    <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-sky-600" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900">{activity.status || activity.description || "Shipment update"}</p>
                      {activity.description && activity.description !== activity.status ? <p className="mt-1 text-sm text-slate-600">{activity.description}</p> : null}
                      <p className="mt-1 text-xs text-slate-500">{[activity.date, activity.location].filter(Boolean).join(" · ")}</p>
                    </div>
                  </li>
                ))}
              </ol>
            ) : <p className="mt-4 text-sm text-slate-600">The courier has not posted a scan yet. Check again later for new updates.</p>}
          </div>

          {order.trackingUrl ? <a href={order.trackingUrl} target="_blank" rel="noreferrer" className="inline-flex rounded-md border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-800">Open Shiprocket tracking</a> : null}
        </>
      ) : null}
    </section>
  );
}