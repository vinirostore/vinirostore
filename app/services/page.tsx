import type { ReactNode } from "react";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { serviceCatalog } from "@/lib/catalog";

function ServiceVisual({ kind }: { kind: string }) {
  const common = { className: "service-art-svg", viewBox: "0 0 200 120", fill: "none", xmlns: "http://www.w3.org/2000/svg" };

  const variants: Record<string, ReactNode> = {
    repair: (
      <svg {...common} aria-hidden="true">
        <path d="M48 62L90 24L128 62L108 82H62L48 62Z" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.78)" strokeWidth="3"/>
        <path d="M76 80V89C76 97 82 104 90 104H110C118 104 124 97 124 89V80" stroke="rgba(214, 234, 247, 0.9)" strokeWidth="4" strokeLinecap="round"/>
        <path d="M75 58H118" stroke="rgba(255,255,255,0.84)" strokeWidth="4" strokeLinecap="round"/>
        <path d="M92 48V34" stroke="rgba(255,255,255,0.84)" strokeWidth="4" strokeLinecap="round"/>
        <path d="M58 90L40 110" stroke="rgba(255,255,255,0.72)" strokeWidth="4" strokeLinecap="round"/>
        <path d="M138 90L156 110" stroke="rgba(255,255,255,0.72)" strokeWidth="4" strokeLinecap="round"/>
      </svg>
    ),
    "general-service": (
      <svg {...common} aria-hidden="true">
        <path d="M58 74C58 57 71 45 88 45H112C129 45 142 57 142 74V82C142 99 129 112 112 112H88C71 112 58 99 58 82V74Z" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.78)" strokeWidth="3"/>
        <path d="M84 69C96 57 102 50 112 50C121 50 129 57 136 70" stroke="rgba(214, 234, 247, 0.9)" strokeWidth="4" strokeLinecap="round"/>
        <path d="M58 82H142" stroke="rgba(255,255,255,0.8)" strokeWidth="4" strokeLinecap="round"/>
        <path d="M72 96C85 89 95 87 110 89" stroke="rgba(255,255,255,0.8)" strokeWidth="4" strokeLinecap="round"/>
      </svg>
    ),
    installation: (
      <svg {...common} aria-hidden="true">
        <rect x="38" y="52" width="124" height="30" rx="14" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.8)" strokeWidth="3"/>
        <path d="M54 66H118" stroke="rgba(214,234,247,0.9)" strokeWidth="4" strokeLinecap="round"/>
        <path d="M146 70V90" stroke="rgba(255,255,255,0.8)" strokeWidth="4" strokeLinecap="round"/>
        <path d="M146 90H166" stroke="rgba(255,255,255,0.8)" strokeWidth="4" strokeLinecap="round"/>
        <path d="M40 70H23" stroke="rgba(255,255,255,0.8)" strokeWidth="4" strokeLinecap="round"/>
        <path d="M20 97H60" stroke="rgba(255,255,255,0.7)" strokeWidth="3" strokeLinecap="round"/>
        <path d="M120 98H170" stroke="rgba(255,255,255,0.7)" strokeWidth="3" strokeLinecap="round"/>
      </svg>
    ),
    maintenance: (
      <svg {...common} aria-hidden="true">
        <path d="M67 78C67 60 80 46 98 46C115 46 128 60 128 78V82C128 99 115 112 98 112C80 112 67 99 67 82V78Z" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.8)" strokeWidth="3"/>
        <path d="M98 66V84" stroke="rgba(214,234,247,0.9)" strokeWidth="4" strokeLinecap="round"/>
        <path d="M84 78H98L109 90" stroke="rgba(255,255,255,0.8)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M134 58C149 64 153 82 144 95" stroke="rgba(191,223,242,0.9)" strokeWidth="4" strokeLinecap="round"/>
        <path d="M145 50L152 59L145 68" stroke="rgba(255,255,255,0.8)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    amc: (
      <svg {...common} aria-hidden="true">
        <path d="M65 42L100 26L135 42V75C135 95 120 111 100 116C80 111 65 95 65 75V42Z" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.8)" strokeWidth="3"/>
        <path d="M75 65C84 63 90 58 100 51C110 58 116 63 125 65" stroke="rgba(214,234,247,0.92)" strokeWidth="4" strokeLinecap="round"/>
        <path d="M100 52V87" stroke="rgba(255,255,255,0.8)" strokeWidth="4" strokeLinecap="round"/>
        <path d="M79 86H121" stroke="rgba(255,255,255,0.8)" strokeWidth="4" strokeLinecap="round"/>
        <circle cx="147" cy="55" r="16" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.8)" strokeWidth="3"/>
        <path d="M147 47V55L154 60" stroke="rgba(255,255,255,0.8)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    "other-ro-support": (
      <svg {...common} aria-hidden="true">
        <path d="M61 82C61 63 75 48 94 48H99C117 48 132 63 132 82V89C132 106 117 120 99 120H94C75 120 61 106 61 89V82Z" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.8)" strokeWidth="3"/>
        <path d="M74 84C82 76 89 74 97 74C106 74 113 78 120 88" stroke="rgba(214,234,247,0.9)" strokeWidth="4" strokeLinecap="round"/>
        <circle cx="42" cy="65" r="12" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.72)" strokeWidth="2"/>
        <circle cx="158" cy="62" r="12" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.72)" strokeWidth="2"/>
        <path d="M55 64H46M149 64H158M96 36V44M96 120V113" stroke="rgba(255,255,255,0.7)" strokeWidth="3" strokeLinecap="round"/>
      </svg>
    )
  };

  return variants[kind] ?? variants.repair;
}

export default function ServicesPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Services</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">Support your RO system with confidence</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">From repair and general service to installation and annual maintenance, our support model keeps your RO system running smoothly.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {serviceCatalog.map((service) => (
            <Link key={service.slug} href={`/services/${service.slug}`} className="service-card rounded-[30px] border border-slate-200 bg-white p-6 transition hover:border-sky-200 hover:shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">{service.name}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{service.description}</p>
            </Link>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
