"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type CourierQuote = { id: number; name: string; rate: number; etd: string };
type ShippingOrder = {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  shipping_name: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_pincode: string;
  shipping_phone: string;
  customer_email: string;
  total: number;
  created_at: string;
  shiprocket_awb_code: string | null;
  shiprocket_courier_name: string | null;
  shiprocket_tracking_url: string | null;
  shiprocket_payment_method: string | null;
  package_weight_kg: number | null;
  package_length_cm: number | null;
  package_breadth_cm: number | null;
  package_height_cm: number | null;
  items: Array<{ product_name: string; sku: string; unit_price: number; quantity: number }>;
};

type ShiprocketResult = {
  error?: string;
  orders?: ShippingOrder[];
  couriers?: CourierQuote[];
  shipment?: { awb: string; courier: string; trackingUrl: string };
};

async function callShiprocket(body?: Record<string, unknown>) {
  if (!supabase) throw new Error("Supabase authentication is not configured.");
  const { data, error } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (error || !token) throw new Error("Your admin session has expired. Sign in again.");

  const response = await fetch("/api/shiprocket", {
    method: body ? "POST" : "GET",
    credentials: "include",
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  const result = await response.json() as ShiprocketResult;
  if (!response.ok) throw new Error(result.error || "The Shiprocket request failed.");
  return result;
}

function DispatchOrderCard({ order, onDispatched }: { order: ShippingOrder; onDispatched: () => void }) {
  const [state, setState] = useState(order.shipping_state || "");
  const [paymentMethod, setPaymentMethod] = useState(order.shiprocket_payment_method || "COD");
  const [weightKg, setWeightKg] = useState(order.package_weight_kg?.toString() || "");
  const [lengthCm, setLengthCm] = useState(order.package_length_cm?.toString() || "");
  const [breadthCm, setBreadthCm] = useState(order.package_breadth_cm?.toString() || "");
  const [heightCm, setHeightCm] = useState(order.package_height_cm?.toString() || "");
  const [couriers, setCouriers] = useState<CourierQuote[]>([]);
  const [selectedCourier, setSelectedCourier] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleRequest(action: "rates" | "dispatch") {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const result = await callShiprocket({
        action,
        orderId: order.id,
        state,
        paymentMethod,
        weightKg,
        lengthCm,
        breadthCm,
        heightCm,
        courierId: selectedCourier,
      });
      if (action === "rates") {
        setCouriers(result.couriers || []);
        setSelectedCourier("");
        if (!result.couriers?.length) setMessage("No courier services are available for this shipment.");
      } else if (result.shipment) {
        setMessage(`Booked with ${result.shipment.courier}. AWB ${result.shipment.awb}.`);
        setCouriers([]);
        onDispatched();
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Shiprocket request failed.");
    } finally {
      setBusy(false);
    }
  }

  const isBooked = Boolean(order.shiprocket_awb_code);

  return (
    <article className="border-b border-slate-200 py-6 last:border-b-0">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{order.order_number}</h2>
          <p className="mt-1 text-sm text-slate-600">{order.shipping_name} · {order.shipping_phone} · {order.customer_email}</p>
          <p className="mt-1 text-sm text-slate-600">{order.shipping_address}, {order.shipping_city}, {order.shipping_state || "State needed"} {order.shipping_pincode}</p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-slate-900">₹{Number(order.total).toLocaleString("en-IN")}</p>
          <p className="mt-1 text-xs capitalize text-slate-500">{order.payment_status} · {order.status}</p>
        </div>
      </div>

      <ul className="mt-3 space-y-1 text-sm text-slate-600">
        {order.items.map((item, index) => <li key={`${item.sku}-${index}`}>{item.product_name} × {item.quantity}</li>)}
      </ul>

      {isBooked ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-emerald-50 p-4">
          <div>
            <p className="text-sm font-semibold text-emerald-900">{order.shiprocket_courier_name || "Shipment booked"} · AWB {order.shiprocket_awb_code}</p>
            <p className="mt-1 text-sm text-emerald-800">{order.shiprocket_payment_method || ""} shipment</p>
          </div>
          {order.shiprocket_tracking_url ? <a href={order.shiprocket_tracking_url} target="_blank" rel="noreferrer" className="text-sm font-medium text-emerald-900 underline">Track shipment</a> : null}
        </div>
      ) : (
        <>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <label className="text-xs font-medium text-slate-600">Delivery state
              <input value={state} onChange={(event) => setState(event.target.value)} required className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900" placeholder="Gujarat" />
            </label>
            <label className="text-xs font-medium text-slate-600">Payment method
              <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)} className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900">
                <option value="COD">Cash on delivery</option>
                <option value="Prepaid">Prepaid</option>
              </select>
            </label>
            <label className="text-xs font-medium text-slate-600">Package weight (kg)
              <input type="number" min="0.01" step="0.01" value={weightKg} onChange={(event) => setWeightKg(event.target.value)} required className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900" placeholder="1.00" />
            </label>
            <label className="text-xs font-medium text-slate-600">Length (cm)
              <input type="number" min="1" step="0.1" value={lengthCm} onChange={(event) => setLengthCm(event.target.value)} required className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900" placeholder="30" />
            </label>
            <label className="text-xs font-medium text-slate-600">Breadth (cm)
              <input type="number" min="1" step="0.1" value={breadthCm} onChange={(event) => setBreadthCm(event.target.value)} required className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900" placeholder="20" />
            </label>
            <label className="text-xs font-medium text-slate-600">Height (cm)
              <input type="number" min="1" step="0.1" value={heightCm} onChange={(event) => setHeightCm(event.target.value)} required className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900" placeholder="15" />
            </label>
          </div>

          {couriers.length ? (
            <fieldset className="mt-4 space-y-2">
              <legend className="mb-2 text-sm font-semibold text-slate-800">Available couriers</legend>
              {couriers.map((courier) => (
                <label key={courier.id} className="flex cursor-pointer items-center justify-between gap-4 rounded-md border border-slate-200 px-3 py-3 text-sm">
                  <span className="flex items-center gap-3"><input type="radio" name={`courier-${order.id}`} value={courier.id} checked={selectedCourier === String(courier.id)} onChange={() => setSelectedCourier(String(courier.id))} />{courier.name}{courier.etd ? ` · ${courier.etd}` : ""}</span>
                  <span className="font-semibold text-slate-900">₹{courier.rate.toLocaleString("en-IN")}</span>
                </label>
              ))}
            </fieldset>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button type="button" disabled={busy} onClick={() => void handleRequest("rates")} className="rounded-md bg-slate-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60">{busy ? "Checking..." : "Check courier rates"}</button>
            {couriers.length ? <button type="button" disabled={busy || !selectedCourier} onClick={() => void handleRequest("dispatch")} className="rounded-md border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-800 disabled:opacity-50">{busy ? "Booking..." : "Book shipment"}</button> : null}
          </div>
        </>
      )}

      {error ? <p className="mt-3 text-sm text-rose-700" role="alert">{error}</p> : null}
      {message ? <p className="mt-3 text-sm text-emerald-700" role="status">{message}</p> : null}
    </article>
  );
}

export default function AdminShippingPage() {
  const [orders, setOrders] = useState<ShippingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadOrders() {
    setLoading(true);
    setError("");
    try {
      const result = await callShiprocket();
      setOrders(result.orders || []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load shipping orders.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    void callShiprocket().then((result) => {
      if (active) setOrders(result.orders || []);
    }).catch((loadError: unknown) => {
      if (active) setError(loadError instanceof Error ? loadError.message : "Unable to load shipping orders.");
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Shiprocket</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">Delivery dispatch</h1>
        <p className="mt-2 text-sm text-slate-600">Review live orders, compare courier rates, and book shipments.</p>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white px-5">
        {loading ? <p className="py-8 text-sm text-slate-600">Loading orders...</p> : null}
        {error ? <p className="py-8 text-sm text-rose-700" role="alert">{error}</p> : null}
        {!loading && !error && orders.length === 0 ? <p className="py-8 text-sm text-slate-600">No orders are available for shipping.</p> : null}
        {!loading && !error ? orders.map((order) => <DispatchOrderCard key={order.id} order={order} onDispatched={() => void loadOrders()} />) : null}
      </section>
    </div>
  );
}
