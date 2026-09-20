export default function AdminPaymentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Payments</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Payment overview</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          ["Cash collected", "₹4.8L"],
          ["Pending", "₹1.2L"],
          ["Refunds", "₹38K"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
