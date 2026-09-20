import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { businessConfig } from "@/lib/site-config";

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-[30px] border border-slate-200 bg-white p-8 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">About</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">{businessConfig.businessName}</h1>
          <div className="mt-6 space-y-5 text-base leading-8 text-slate-600">
            <p>
              Established in {businessConfig.establishedYear}, {businessConfig.businessName} is led by {businessConfig.ownerName}. The business focuses on RO water purification products and service support for customer needs across installation, maintenance, repairs, and ongoing care.
            </p>
            <p>
              Our mission is to provide dependable RO solutions with transparent communication and practical service support. We focus on product quality, customer trust, and a smooth service journey from initial consultation to maintenance and support.
            </p>
            <p>
              The platform is designed to help the business manage products, service requests, AMC bookings, and customer support while keeping operational decisions flexible and configurable.
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
