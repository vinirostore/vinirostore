import Link from "next/link";
import { notFound } from "next/navigation";

const statusConfig = {
  "open-tickets": {
    label: "Open tickets",
    count: 12,
    description: "New service requests awaiting a response.",
    customers: [
      { name: "Riya Shah", phone: "+91 98765 43210", city: "Ahmedabad", date: "12 Aug 2026", service: "RO filter replacement", amount: "₹2,450" },
      { name: "Manoj Joshi", phone: "+91 99887 66554", city: "Rajkot", date: "03 Aug 2026", service: "General maintenance", amount: "₹1,650" },
      { name: "Nisha Desai", phone: "+91 98944 22334", city: "Bhavnagar", date: "08 Aug 2026", service: "Water pressure issue", amount: "₹1,980" },
    ],
  },
  "in-progress": {
    label: "In progress",
    count: 8,
    description: "Technicians are actively working on these requests.",
    customers: [
      { name: "Amit Patel", phone: "+91 98123 45678", city: "Surat", date: "09 Aug 2026", service: "Installation follow-up", amount: "₹3,200" },
      { name: "Pooja Mehta", phone: "+91 98989 12121", city: "Gandhinagar", date: "28 Jul 2026", service: "AMC check-in", amount: "₹2,900" },
      { name: "Sakshi Raval", phone: "+91 97888 44556", city: "Rajkot", date: "17 Aug 2026", service: "RO membrane service", amount: "₹2,300" },
    ],
  },
  completed: {
    label: "Completed",
    count: 34,
    description: "Requests that have already been completed.",
    customers: [
      { name: "Neha Trivedi", phone: "+91 99222 33445", city: "Vadodara", date: "06 Aug 2026", service: "RO membrane service", amount: "₹1,990" },
      { name: "Hardik Desai", phone: "+91 97654 32109", city: "Bhavnagar", date: "19 Jul 2026", service: "Leak repair", amount: "₹1,250" },
      { name: "Jay Shah", phone: "+91 97222 33445", city: "Nadiad", date: "11 Jul 2026", service: "General filter service", amount: "₹1,520" },
    ],
  },
} as const;

export default async function AdminServiceStatusPage({ params }: { params: Promise<{ status: string }> }) {
  const { status } = await params;
  const config = statusConfig[status as keyof typeof statusConfig];

  if (!config) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Services</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">{config.label}</h1>
        </div>
        <Link href="/admin/services" className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
          Back to services
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
        {config.customers.map((customer) => (
          <div key={`${customer.name}-${customer.phone}`} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">{customer.name}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">Service</p>
                <p className="mt-1 text-sm font-medium text-slate-700">{customer.service}</p>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-700">{config.label}</span>
            </div>

            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <div className="flex items-center justify-between gap-3"><span className="text-slate-500">Phone</span><span className="font-medium text-slate-800">{customer.phone}</span></div>
              <div className="flex items-center justify-between gap-3"><span className="text-slate-500">City</span><span className="font-medium text-slate-800">{customer.city}</span></div>
              <div className="flex items-center justify-between gap-3"><span className="text-slate-500">Date</span><span className="font-medium text-slate-800">{customer.date}</span></div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3">
              <span className="text-xs uppercase tracking-[0.18em] text-slate-500">Amount</span>
              <span className="text-sm font-semibold text-slate-900">{customer.amount}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
