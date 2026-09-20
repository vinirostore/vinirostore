import Link from "next/link";
import { customerGroupOrder, customerGroups } from "@/lib/customer-groups";

export default function AdminCustomersPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Customers</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Customer database</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {customerGroupOrder.map((groupKey) => {
          const group = customerGroups[groupKey];

          return (
            <Link
              key={group.slug}
              href={`/admin/customers/${group.slug}`}
              className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{group.label}</p>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{group.count}</span>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-600">{group.summary}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
