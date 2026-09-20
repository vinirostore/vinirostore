import Link from "next/link";

const shippingStatusOrder = [
  { slug: "in-transit", label: "In transit", count: 24, description: "Orders currently moving to the customer." },
  { slug: "delivered", label: "Delivered", count: 142, description: "Orders completed and received by customers." },
  { slug: "delayed", label: "Delayed", count: 3, description: "Orders requiring follow-up for delivery exceptions." },
] as const;

export default function AdminShippingPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Shipping</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Shipping operations</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {shippingStatusOrder.map((item) => (
          <Link
            key={item.slug}
            href={`/admin/shipping/${item.slug}`}
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
