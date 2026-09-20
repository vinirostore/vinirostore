import Link from "next/link";
import { orderStatusConfig, orderStatusOrder } from "@/lib/order-status-data";

export default function AdminOrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Orders</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Order management</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {orderStatusOrder.map((status) => {
          const item = orderStatusConfig[status];
          const accentClasses = {
            amber: "border-amber-200 bg-amber-50/60",
            sky: "border-sky-200 bg-sky-50/60",
            emerald: "border-emerald-200 bg-emerald-50/60",
          } as const;

          return (
            <Link
              key={item.slug}
              href={`/admin/orders/${item.slug}`}
              className={`block rounded-2xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${accentClasses[item.accent as keyof typeof accentClasses]}`}
            >
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">{item.count}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
