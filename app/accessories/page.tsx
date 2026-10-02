import { AccessoriesCatalog } from "@/components/accessories-catalog";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getAccessoryListFromStore } from "@/lib/catalog";

export default async function AccessoriesPage({ searchParams }: { searchParams: Promise<{ search?: string; category?: string }> }) {
  const [{ search, category }, accessories] = await Promise.all([searchParams, getAccessoryListFromStore()]);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 pb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Accessories</p>
          <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">Accessories</h1>
          <p className="max-w-2xl text-sm leading-7 text-slate-600">
            Browse replacement and support accessories for RO systems.
          </p>
        </div>
        <AccessoriesCatalog accessories={accessories} initialSearch={search || ""} initialCategory={category || "all"} />
      </main>
      <SiteFooter />
    </>
  );
}