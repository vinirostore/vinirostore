import { notFound } from "next/navigation";
import { AdminServiceRequestsPanel, type ServiceRequestStatus } from "@/components/admin-service-requests-panel";

const statusFilters: Record<string, ServiceRequestStatus> = {
  "open-tickets": "open",
  "in-progress": "in_progress",
  completed: "completed",
  cancelled: "cancelled",
};

export default async function AdminAcmStatusPage({ params }: { params: Promise<{ status: string }> }) {
  const { status } = await params;
  const statusFilter = statusFilters[status];
  if (!statusFilter) notFound();
  return <AdminServiceRequestsPanel requestType="amc" statusFilter={statusFilter} />;
}
