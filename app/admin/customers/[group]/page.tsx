import Link from "next/link";
import { notFound } from "next/navigation";
import { customerGroups, type CustomerGroupKey } from "@/lib/customer-groups";

export default async function AdminCustomerGroupPage({ params }: { params: Promise<{ group: string }> }) {
  const { group } = await params;
  const groupKey = group as CustomerGroupKey;
  const customerGroup = customerGroups[groupKey];

  if (!customerGroup) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Customers</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">{customerGroup.label}</h1>
        </div>

        <Link
          href="/admin/customers"
          className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
        >
          Back to customers
        </Link>
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Total</p>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{customerGroup.count}</span>
        </div>

        <p className="mt-4 text-sm leading-6 text-slate-600">{customerGroup.summary}</p>
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Customer details</h2>
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {customerGroup.customers.map((customer) => {
            const statusStyles = {
              Active: "bg-emerald-100 text-emerald-700",
              Repeat: "bg-amber-100 text-amber-700",
              New: "bg-indigo-100 text-indigo-700",
            } as const;

            return (
              <li key={`${customer.name}-${customer.phone}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{customer.name}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">Ordered</p>
                    <p className="mt-1 text-sm font-medium text-slate-700">{customer.product}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${statusStyles[customer.status]}`}>
                    {customer.status}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-sm text-slate-600">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-500">Phone</span>
                    <span className="font-medium text-slate-800">{customer.phone}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-500">City</span>
                    <span className="font-medium text-slate-800">{customer.city}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-500">Order date</span>
                    <span className="font-medium text-slate-800">{customer.orderDate}</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3">
                  <span className="text-xs uppercase tracking-[0.18em] text-slate-500">Total</span>
                  <span className="text-sm font-semibold text-slate-900">{customer.amount}</span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
