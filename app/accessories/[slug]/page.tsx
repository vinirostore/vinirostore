import { AccessoryDetail } from "./accessory-detail";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getAccessoryListFromStore } from "@/lib/catalog";

export default async function AccessoryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const accessories = await getAccessoryListFromStore();
  const accessory = accessories.find((item) => item.slug === slug);

  return (
    <>
      <SiteHeader />
      <AccessoryDetail slug={slug} initialAccessory={accessory} />
      <SiteFooter />
    </>
  );
}
