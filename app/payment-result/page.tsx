import { PaymentResultPanel } from "@/components/payment-result-panel";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default async function PaymentResultPage({ searchParams }: { searchParams: Promise<{ order_id?: string }> }) {
  const { order_id: orderId = "" } = await searchParams;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center px-4 py-12 sm:px-6">
        <PaymentResultPanel orderId={orderId} />
      </main>
      <SiteFooter />
    </>
  );
}