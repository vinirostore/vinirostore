"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ADMIN_EMAIL, useAuthState } from "@/components/auth-state";
import { supabase } from "@/lib/supabase";

type OverviewData = {
  metrics: {
    sales: number;
    orders: number;
    pending: number;
    customers: number;
  };
  inventory: { totalStock: number; lowStock: number; outOfStock: number } | null;
  inventoryError?: string;
  salesByDay: Array<{ date: string; total: number }>;
};

export default function AdminOverviewPage() {
  const router = useRouter();
  const { isAuthReady, isAdminAuthenticated, isAuthenticated, isSupabaseAuthenticated, user } = useAuthState();
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadOverview() {
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
          setError("Admin session expired. Sign in again to load sales data.");
          setIsLoading(false);
        }
        return;
      }

      try {
        const response = await fetch("/api/admin/overview", {
          credentials: "include",
          cache: "no-store",
          headers: { Authorization: `Bearer ${data.session.access_token}` },
        });
        const result = await response.json() as OverviewData & { error?: string };
        if (!response.ok) throw new Error(result.error || "Could not load sales data from Supabase.");
        if (active) {
          setOverview(result);
          setError("");
          setUpdatedAt(new Date().toLocaleTimeString());
        }
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : "Could not load sales data from Supabase.");
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void loadOverview();
    const interval = window.setInterval(() => void loadOverview(), 30000);
    window.addEventListener("focus", loadOverview);
    return () => {
      active = false;
      window.clearInterval(interval);
      window.removeEventListener("focus", loadOverview);
    };
  }, [refreshKey]);

  useEffect(() => {
    if (!isAuthReady) return;
    if (!isAuthenticated || !isSupabaseAuthenticated || user?.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      router.replace("/login");
      return;
    }

    if (!isAdminAuthenticated) {
      router.replace("/admin-access");
    }
  }, [isAdminAuthenticated, isAuthReady, isAuthenticated, isSupabaseAuthenticated, router, user]);

  if (!isAuthReady || !isAuthenticated || !isSupabaseAuthenticated || !isAdminAuthenticated || user?.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) return null;

  const metrics = overview?.metrics;
  const inventory = overview?.inventory;
  const maximumSales = Math.max(1, ...(overview?.salesByDay.map((day) => day.total) || [0]));
  const kpis = [
    { label: "Paid sales", value: metrics ? `₹${metrics.sales.toLocaleString("en-IN", { maximumFractionDigits: 0 })}` : "—" },
    { label: "Orders", value: metrics ? metrics.orders.toLocaleString("en-IN") : "—" },
    { label: "Pending payment", value: metrics ? metrics.pending.toLocaleString("en-IN") : "—" },
    { label: "Customers with orders", value: metrics ? metrics.customers.toLocaleString("en-IN") : "—" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Overview</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Operations snapshot</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((item) => (
          <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Paid sales · last 7 days</h2>
              <p className="mt-1 text-xs text-slate-500">Supabase{updatedAt ? ` · updated ${updatedAt}` : ""}</p>
            </div>
            <button type="button" onClick={() => setRefreshKey((key) => key + 1)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700">Refresh</button>
          </div>
          {error ? <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</p> : null}
          {isLoading && !overview ? <p className="py-16 text-center text-sm text-slate-500">Loading sales data...</p> : null}
          {!isLoading && !error && overview ? <div className="mt-6">
            <div className="flex h-48 items-end gap-3 border-b border-slate-200 pb-2">
              {overview.salesByDay.map((day) => {
                const height = day.total > 0 ? Math.max(5, (day.total / maximumSales) * 100) : 2;
                const label = new Date(`${day.date}T00:00:00Z`).toLocaleDateString("en-IN", { weekday: "short", timeZone: "UTC" });
                return <div key={day.date} className="flex h-full flex-1 flex-col items-center justify-end gap-2" title={`${day.date}: ₹${day.total.toLocaleString("en-IN")}`}>
                  <div className="w-full max-w-12 rounded-t-md bg-sky-600" style={{ height: `${height}%` }} aria-label={`${label}: ₹${day.total.toLocaleString("en-IN")}`} />
                  <span className="text-[11px] text-slate-500">{label}</span>
                </div>;
              })}
            </div>
          </div> : null}
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">Inventory snapshot</h2>
          {inventory ? <dl className="mt-5 space-y-4 text-sm">
            <div className="flex items-center justify-between gap-3"><dt className="text-slate-600">Units in stock</dt><dd className="font-semibold text-slate-900">{inventory.totalStock.toLocaleString("en-IN")}</dd></div>
            <div className="flex items-center justify-between gap-3"><dt className="text-slate-600">Low-stock items</dt><dd className="font-semibold text-amber-700">{inventory.lowStock.toLocaleString("en-IN")}</dd></div>
            <div className="flex items-center justify-between gap-3"><dt className="text-slate-600">Out-of-stock items</dt><dd className="font-semibold text-rose-700">{inventory.outOfStock.toLocaleString("en-IN")}</dd></div>
            <div className="border-t border-slate-200 pt-4"><Link href="/admin/inventory" className="font-medium text-sky-700 hover:text-sky-900">Open inventory</Link></div>
          </dl> : <div className="mt-4 space-y-3">
            <p role={overview?.inventoryError ? "alert" : undefined} className={`text-sm ${overview?.inventoryError ? "text-rose-700" : "text-slate-500"}`}>
              {overview?.inventoryError || "Inventory metrics will appear when Supabase data loads."}
            </p>
            <Link href="/admin/inventory" className="inline-block text-sm font-medium text-sky-700 hover:text-sky-900">Open inventory</Link>
          </div>}
        </div>
      </div>
    </div>
  );
}
