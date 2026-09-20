"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getAccessoryList, type Accessory } from "@/lib/catalog";

export default function AccessoriesPage() {
  const [accessories, setAccessories] = useState<Accessory[]>([]);

  useEffect(() => {
    setAccessories(getAccessoryList());
  }, []);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 pb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Accessories</p>
          <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">Accessories</h1>
          <p className="max-w-2xl text-sm leading-7 text-slate-600">
            Browse replacement and support accessories for RO systems. This section is currently being prepared.
          </p>
        </div>

        {accessories.length ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {accessories.map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm">
                <img src={item.image} alt={item.name} className="h-36 w-full rounded-2xl object-cover" />
                <h2 className="mt-4 text-lg font-semibold text-slate-900">{item.name}</h2>
                <p className="mt-1 text-sm text-slate-600">{item.shortDescription}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-lg font-semibold text-slate-900">₹{item.price.toLocaleString("en-IN")}</span>
                  <Link href={`/accessories/${item.slug}`} className="text-sm font-medium text-sky-700">View details</Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[30px] border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <p className="text-lg font-medium text-slate-700">No accessories available right now.</p>
            <p className="mt-2 text-sm text-slate-500">This page will show accessory listings added from the admin portal.</p>
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
