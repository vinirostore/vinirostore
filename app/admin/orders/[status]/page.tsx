import { notFound } from "next/navigation";
import { AdminOrdersPanel } from "@/components/admin-orders-panel";
import { orderStatusConfig, type OrderStatusKey } from "@/lib/order-status-config";

export default async function AdminOrderStatusPage({ params }: { params: Promise<{ status: string }> }) {
  const { status } = await params;
  const normalizedStatus = status as OrderStatusKey;
  const statusConfig = orderStatusConfig[normalizedStatus];

  if (!statusConfig) {
    notFound();
  }

  return <AdminOrdersPanel status={normalizedStatus} />;
}
