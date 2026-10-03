import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ServiceStaffPortal } from "@/components/service-staff-portal";

export default function ServicePortalPage() {
  return (
    <>
      <SiteHeader />
      <ServiceStaffPortal />
      <SiteFooter />
    </>
  );
}
