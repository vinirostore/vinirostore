"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { useAuthState } from "@/components/auth-state";

const kpis = [
  { label: "Total sales", value: "₹7.8L" },
  { label: "Orders", value: "184" },
  { label: "Pending", value: "12" },
  { label: "Customers", value: "420" },
];

export default function AdminOverviewPage() {
  const router = useRouter();
  const { isAdminAuthenticated, isAuthenticated } = useAuthState();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (!isAdminAuthenticated) {
      router.replace("/admin-access");
    }
  }, [isAdminAuthenticated, isAuthenticated, router]);

  if (!isAuthenticated || !isAdminAuthenticated) return null;

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
          <h2 className="text-lg font-semibold text-slate-900">Revenue over time</h2>
          <div className="mt-6 flex h-52 items-end gap-3">
            {[42, 68, 56, 81, 71, 96, 124].map((height, index) => (
              <div key={index} className="flex-1 rounded-t-2xl bg-sky-500/90" style={{ height: `${height}%` }} />
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">Alerts</h2>
          <ul className="mt-5 space-y-3 text-sm text-slate-700">
            <li className="rounded-2xl bg-amber-50 p-3 text-amber-800">3 low-stock products need review.</li>
            <li className="rounded-2xl bg-sky-50 p-3 text-sky-800">2 service requests pending confirmation.</li>
            <li className="rounded-2xl bg-emerald-50 p-3 text-emerald-800">AMC renewals are on track.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
