import Link from "next/link";
import { notFound } from "next/navigation";
import { orderStatusConfig, orderStatusOrder, type OrderStatusKey } from "@/lib/order-status-data";

export default async function AdminOrderStatusPage({ params }: { params: Promise<{ status: string }> }) {
  const { status } = await params;
  const normalizedStatus = status as OrderStatusKey;
  const statusConfig = orderStatusConfig[normalizedStatus];

  if (!statusConfig) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Orders</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">{statusConfig.label}</h1>
        </div>

        <Link
          href="/admin/orders"
          className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
        >
          Back to order dashboard
        </Link>
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Orders</p>
            <p className="mt-3 text-2xl font-semibold text-slate-900">{statusConfig.count}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Status</p>
            <p className="mt-3 text-2xl font-semibold text-slate-900">{statusConfig.label}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Focus</p>
            <p className="mt-3 text-sm font-medium text-slate-700">{statusConfig.description}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {statusConfig.customers.map((customer) => (
          <div key={customer.id} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Customer</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-900">{customer.name}</h2>
              </div>

              <div className="text-left md:text-right">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Order ID</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{customer.id}</p>
              </div>
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Phone</p>
                <p className="mt-2 text-sm font-medium text-slate-700">{customer.phone}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Email</p>
                <p className="mt-2 text-sm font-medium text-slate-700">{customer.email}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">City</p>
                <p className="mt-2 text-sm font-medium text-slate-700">{customer.city}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Ordered</p>
                <p className="mt-2 text-sm font-medium text-slate-700">{customer.orderedAt}</p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-slate-50 p-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Shipping address</p>
                  <p className="mt-2 text-sm font-medium text-slate-700">{customer.address}</p>
                </div>
                <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
                  {customer.quantity} item{customer.quantity > 1 ? "s" : ""}
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Product</p>
                <p className="mt-2 text-sm font-medium text-slate-700">{customer.item}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Amount</p>
                <p className="mt-2 text-sm font-medium text-slate-700">₹{customer.amount.toLocaleString("en-IN")}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Action</p>
                <p className="mt-2 text-sm font-medium text-slate-700">
                  {statusConfig.label === "Pending" ? "Awaiting confirmation" : statusConfig.label === "Ready to dispatch" ? "Dispatch ready" : "Delivered"}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Link
          href="/admin/orders"
          className="inline-flex items-center rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Return to orders dashboard
        </Link>
      </div>
    </div>
  );
}
