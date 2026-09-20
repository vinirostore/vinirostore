import Link from "next/link";

const amcStatusOrder = [
  { slug: "active-amc", label: "Active AMC", count: 110, description: "Customers currently covered by active annual maintenance plans." },
  { slug: "due-this-month", label: "Due this month", count: 23, description: "Renewals that need attention before the month closes." },
  { slug: "renewals", label: "Renewals", count: 31, description: "Customers who have recently renewed or are scheduled for renewal." },
] as const;

export default function AdminAcmPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">AMC</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Annual maintenance</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {amcStatusOrder.map((item) => (
          <Link
            key={item.slug}
            href={`/admin/amc/${item.slug}`}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{item.count}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
