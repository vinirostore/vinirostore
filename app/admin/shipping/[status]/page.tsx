import Link from "next/link";
import { notFound } from "next/navigation";

const statusConfig = {
  "in-transit": {
    label: "In transit",
    count: 24,
    description: "Orders currently moving toward the customer.",
    orders: [
      { name: "Riya Shah", phone: "+91 98765 43210", city: "Ahmedabad", date: "12 Aug 2026", product: "Kent Supreme Plus", amount: "₹18,999" },
      { name: "Manoj Joshi", phone: "+91 99887 66554", city: "Rajkot", date: "03 Aug 2026", product: "VINI Compact RO Unit", amount: "₹6,999" },
      { name: "Neha Trivedi", phone: "+91 99222 33445", city: "Vadodara", date: "06 Aug 2026", product: "Pureit Classic", amount: "₹7,999" },
    ],
  },
  delivered: {
    label: "Delivered",
    count: 142,
    description: "Orders that have already reached their destination.",
    orders: [
      { name: "Amit Patel", phone: "+91 98123 45678", city: "Surat", date: "09 Aug 2026", product: "AQUAGUARD Essence", amount: "₹12,999" },
      { name: "Pooja Mehta", phone: "+91 98989 12121", city: "Gandhinagar", date: "28 Jul 2026", product: "Kent Supreme Plus", amount: "₹18,999" },
      { name: "Jay Shah", phone: "+91 97222 33445", city: "Nadiad", date: "11 Jul 2026", product: "Pureit Classic", amount: "₹7,999" },
    ],
  },
  delayed: {
    label: "Delayed",
    count: 3,
    description: "Orders that need follow-up for delivery issues.",
    orders: [
      { name: "Hardik Desai", phone: "+91 97654 32109", city: "Bhavnagar", date: "19 Jul 2026", product: "RO Membrane Kit", amount: "₹2,990" },
      { name: "Nisha Desai", phone: "+91 98944 22334", city: "Bhavnagar", date: "08 Aug 2026", product: "VINI Compact RO Unit", amount: "₹6,999" },
      { name: "Priya Shah", phone: "+91 98181 71717", city: "Nadiad", date: "11 Aug 2026", product: "Kent Supreme Plus", amount: "₹18,999" },
    ],
  },
} as const;

export default async function AdminShippingStatusPage({ params }: { params: Promise<{ status: string }> }) {
  const { status } = await params;
  const config = statusConfig[status as keyof typeof statusConfig];

  if (!config) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Shipping</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">{config.label}</h1>
        </div>
        <Link href="/admin/shipping" className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
          Back to shipping
        </Link>
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Total</p>
            <p className="mt-3 text-2xl font-semibold text-slate-900">{config.count}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Focus</p>
            <p className="mt-3 text-sm font-medium text-slate-700">{config.description}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {config.orders.map((order) => (
          <div key={`${order.name}-${order.phone}`} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">{order.name}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">Product</p>
                <p className="mt-1 text-sm font-medium text-slate-700">{order.product}</p>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-700">{config.label}</span>
            </div>

            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <div className="flex items-center justify-between gap-3"><span className="text-slate-500">Phone</span><span className="font-medium text-slate-800">{order.phone}</span></div>
              <div className="flex items-center justify-between gap-3"><span className="text-slate-500">City</span><span className="font-medium text-slate-800">{order.city}</span></div>
              <div className="flex items-center justify-between gap-3"><span className="text-slate-500">Dispatch date</span><span className="font-medium text-slate-800">{order.date}</span></div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3">
              <span className="text-xs uppercase tracking-[0.18em] text-slate-500">Amount</span>
              <span className="text-sm font-semibold text-slate-900">{order.amount}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
