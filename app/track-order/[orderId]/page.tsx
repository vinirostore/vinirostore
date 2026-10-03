import { ShipmentTrackingPanel } from "@/components/shipment-tracking-panel";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default async function TrackOrderPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex min-h-[60vh] max-w-5xl items-center justify-center px-4 py-10 sm:px-6">
        <ShipmentTrackingPanel orderId={orderId} />
      </main>
      <SiteFooter />
    </>
  );
}