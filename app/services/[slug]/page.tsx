import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { serviceCatalog } from "@/lib/catalog";

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = serviceCatalog.find((item) => item.slug === slug);
  if (!service) notFound();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-[30px] border border-slate-200 bg-white p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Service</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">{service.name}</h1>
          <p className="mt-4 text-base leading-7 text-slate-600">{service.description}</p>

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Visit Charge</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">₹200</p>
              <p className="mt-1 text-sm text-slate-600">Approximate fee within 10 km</p>
              <p className="mt-2 text-xs font-medium text-slate-500">T&amp;C Apply</p>
            </div>
            <div className="rounded-2xl bg-sky-50 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-sky-700">AMC</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">₹2,900</p>
              <p className="mt-1 text-sm text-slate-600">Ahmedabad only</p>
              <p className="mt-2 text-xs font-medium text-slate-500">T&amp;C Apply</p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/contact" className="rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white">Book service</Link>
            <Link href="/services" className="rounded-full border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700">See all services</Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
