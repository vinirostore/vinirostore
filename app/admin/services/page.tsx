import { AdminServiceRequestsPanel } from "@/components/admin-service-requests-panel";
import { AdminServiceStaffPanel } from "@/components/admin-service-staff-panel";

export default function AdminServicesPage() {
  return (
    <>
      <AdminServiceStaffPanel />
      <AdminServiceRequestsPanel requestType="service" />
    </>
  );
}
