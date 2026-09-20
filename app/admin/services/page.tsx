import Link from "next/link";

const serviceStatusOrder = [
  { slug: "open-tickets", label: "Open tickets", count: 12, description: "New service requests awaiting action." },
  { slug: "in-progress", label: "In progress", count: 8, description: "Technicians are currently working on these jobs." },
  { slug: "completed", label: "Completed", count: 34, description: "Service work that has already been completed." },
] as const;

export default function AdminServicesPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Services</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Service requests</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {serviceStatusOrder.map((item) => (
          <Link
            key={item.slug}
            href={`/admin/services/${item.slug}`}
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
