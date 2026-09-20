import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { businessConfig } from "@/lib/site-config";

const policies = {
  privacy: {
    title: "Privacy Policy",
    summary: "We use the information you share to respond to product, service, and support requests.",
  },
  terms: {
    title: "Terms & Conditions",
    summary: "Using this website means you agree to provide accurate information and use our services lawfully.",
  },
  shipping: {
    title: "Shipping Policy",
    summary: "Orders are prepared for dispatch through the configured shipping provider after confirmation.",
  },
  refunds: {
    title: "Return/Refund Policy",
    summary: "Return and refund requests are reviewed according to the product condition and order details.",
  },
  cancellation: {
    title: "Cancellation Policy",
    summary: "Contact us as soon as possible if you need to cancel an order or service request.",
  },
} as const;

type PolicySlug = keyof typeof policies;

export default async function PolicyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const policy = policies[slug as PolicySlug];
  if (!policy) notFound();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <article className="rounded-[30px] border border-slate-200 bg-white p-8 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Policy</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">{policy.title}</h1>
          <p className="mt-5 text-base leading-7 text-slate-600">{policy.summary}</p>
          <div className="mt-8 space-y-5 text-sm leading-7 text-slate-600">
            <p>{businessConfig.businessName} supports customers with RO products, installation, maintenance, repair, AMC, and related service requests.</p>
            <p>For questions about this policy or a specific order, contact us at <a className="font-medium text-sky-700" href={`mailto:${businessConfig.email}`}>{businessConfig.email}</a> or <a className="font-medium text-sky-700" href={`tel:${businessConfig.phone.replace(/\s+/g, "")}`}>{businessConfig.phone}</a>.</p>
          </div>
          <Link href="/contact" className="mt-8 inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white">Contact VINI RO SERVICES</Link>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
