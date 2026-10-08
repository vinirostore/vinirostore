"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { orderStatusConfig, orderStatusOrder, type OrderStatusKey } from "@/lib/order-status-config";

type OrderItem = { product_name: string; quantity: number; line_total: number };
type AdminOrder = {
  id: string;
  order_number: string;
  customer_id: string;
  status: string;
  payment_status: string;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_pincode: string;
  subtotal: number;
  shipping: number;
  total: number;
  created_at: string;
  customer_email: string;
  items: OrderItem[];
};

function orderMatchesStatus(order: AdminOrder, status: OrderStatusKey) {
  if (status === "pending") return order.status === "pending" && order.payment_status !== "failed";
  if (status === "ready-to-dispatch") return order.status === "processing";
  if (status === "shipped") return order.status === "shipped";
  if (status === "completed") return order.status === "delivered";
  if (status === "payment-failed") return order.payment_status === "failed";
  if (status === "refunded") return order.payment_status === "refunded";
  return order.status === "cancelled";
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

function formatMoney(value: number) {
  return `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

export function AdminOrdersPanel({ status }: { status?: OrderStatusKey }) {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState("");
  const [updatedAt, setUpdatedAt] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const loadInProgress = useRef(false);

  useEffect(() => {
    let active = true;

    async function loadOrders() {
      if (document.visibilityState !== "visible") return;
      if (loadInProgress.current) return;
      loadInProgress.current = true;
      try {
        await performLoadOrders();
      } finally {
        loadInProgress.current = false;
      }
    }

    async function performLoadOrders() {
      if (!supabase) {
        if (active) {
          setError("Supabase is not configured.");
          setIsLoading(false);
        }
        return;
      }

      const { data, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !data.session) {
        if (active) {
          setError("Admin session expired. Sign in again to load orders.");
          setIsLoading(false);
        }
        return;
      }

      try {
        const response = await fetch("/api/admin/orders", {
          credentials: "include",
          cache: "no-store",
          headers: { Authorization: `Bearer ${data.session.access_token}` },
        });
        const result = await response.json() as { orders?: AdminOrder[]; error?: string };
        if (!response.ok) throw new Error(result.error || "Could not load orders from Supabase.");
        if (active) {
          setOrders(result.orders || []);
          setError("");
          setUpdatedAt(new Date().toLocaleTimeString());
        }
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : "Could not load orders from Supabase.");
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void loadOrders();
    let interval: number | null = null;
    const startPolling = () => {
      if (document.visibilityState === "visible" && interval === null) {
        interval = window.setInterval(() => void loadOrders(), 30000);
      }
    };
    const stopPolling = () => {
      if (interval !== null) {
        window.clearInterval(interval);
        interval = null;
      }
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        stopPolling();
        return;
      }
      void loadOrders();
      startPolling();
    };
    const handleFocus = () => {
      if (document.visibilityState === "visible") void loadOrders();
    };
    startPolling();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    return () => {
      active = false;
      stopPolling();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [refreshKey]);

  async function markDelivered(order: AdminOrder) {
    if (!supabase) return;
    setUpdatingOrderId(order.id);
    setError("");
    setMessage("");

    try {
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !data.session) throw new Error("Admin session expired. Sign in again.");

      const response = await fetch("/api/admin/orders", {
        method: "PATCH",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${data.session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: order.id, status: "delivered" }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "Could not update order status.");

      setOrders((current) => current.map((entry) => entry.id === order.id ? { ...entry, status: "delivered" } : entry));
      setMessage(`${order.order_number} marked delivered.`);
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Could not update order status.");
    } finally {
      setUpdatingOrderId("");
    }
  }

  const statusCounts = Object.fromEntries(orderStatusOrder.map((key) => [
    key,
    orders.filter((order) => orderMatchesStatus(order, key)).length,
  ])) as Record<OrderStatusKey, number>;
  const visibleOrders = status ? orders.filter((order) => orderMatchesStatus(order, status)) : [];
  const heading = status ? orderStatusConfig[status].label : "Order management";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Orders · Supabase</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">{heading}</h1>
          <p className="mt-2 text-xs text-slate-500">Auto-refreshes every 30 seconds{updatedAt ? ` · updated ${updatedAt}` : ""}</p>
        </div>
        <button type="button" onClick={() => setRefreshKey((key) => key + 1)} className="self-start rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 sm:self-auto">Refresh</button>
      </div>

      {error ? <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</p> : null}
      {message ? <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p> : null}
      {isLoading ? <p className="py-8 text-center text-sm text-slate-500">Loading orders from Supabase...</p> : null}

      {!status ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {orderStatusOrder.map((key) => {
          const config = orderStatusConfig[key];
          const accents: Record<string, string> = {
            amber: "border-amber-200 bg-amber-50/60",
            sky: "border-sky-200 bg-sky-50/60",
            indigo: "border-indigo-200 bg-indigo-50/60",
            emerald: "border-emerald-200 bg-emerald-50/60",
            rose: "border-rose-200 bg-rose-50/60",
            slate: "border-slate-200 bg-slate-50",
          };
          return <Link key={key} href={`/admin/orders/${key}`} className={`rounded-2xl border p-5 transition hover:-translate-y-0.5 ${accents[config.accent]}`}>
            <p className="text-xs uppercase tracking-[0.16em] text-slate-600">{config.label}</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{isLoading && !updatedAt ? "—" : statusCounts[key]}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{config.description}</p>
          </Link>;
        })}
      </div> : <>
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Orders in this status</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{visibleOrders.length}</p>
          </div>
          <Link href="/admin/orders" className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700">All statuses</Link>
        </div>

        {visibleOrders.length ? <div className="space-y-4">
          {visibleOrders.map((order) => (
            <article key={order.id} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{order.order_number}</p>
                  <h2 className="mt-1 text-lg font-semibold text-slate-900">{order.shipping_name}</h2>
                  <p className="mt-1 text-sm text-slate-600">{order.customer_email || "No email"} · {order.shipping_phone}</p>
                </div>
                <div className="sm:text-right">
                  <p className="text-lg font-semibold text-slate-900">{formatMoney(order.total)}</p>
                  <p className="mt-1 text-xs capitalize text-slate-500">Payment {order.payment_status} · Order {order.status}</p>
                </div>
              </div>

              <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Delivery address</p>
                  <p className="mt-1 text-slate-700">{order.shipping_address}, {order.shipping_city}, {order.shipping_state} {order.shipping_pincode}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Order date</p>
                  <p className="mt-1 text-slate-700">{formatDate(order.created_at)}</p>
                </div>
              </div>

              <div className="mt-4 border-t border-slate-100 pt-3">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Items</p>
                <ul className="mt-2 space-y-1 text-sm text-slate-700">
                  {order.items.map((item, index) => <li key={`${order.id}-${index}`} className="flex justify-between gap-4"><span>{item.product_name} × {item.quantity}</span><span>{formatMoney(item.line_total)}</span></li>)}
                </ul>
              </div>

              {order.payment_status === "paid" && ["processing", "shipped"].includes(order.status) ? <div className="mt-4 flex justify-end">
                <button type="button" disabled={updatingOrderId === order.id} onClick={() => void markDelivered(order)} className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white disabled:cursor-wait disabled:opacity-60">
                  {updatingOrderId === order.id ? "Updating..." : "Mark delivered"}
                </button>
              </div> : null}
            </article>
          ))}
        </div> : !isLoading ? <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">No orders in this status.</p> : null}
      </>}
    </div>
  );
}