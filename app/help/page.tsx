import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { businessConfig } from "@/lib/site-config";

export default function HelpPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-[30px] border border-slate-200 bg-white p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Help</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">Need assistance?</h1>
          <p className="mt-4 text-base leading-7 text-slate-600">Tell us what you need and we will assist you through the right support path.</p>

          <form className="mt-8 space-y-5">
            <label className="block text-sm font-medium text-slate-700">
              Name
              <input type="text" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-sky-300" placeholder="Your name" />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Email
              <input type="email" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-sky-300" placeholder="you@example.com" />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Help needed
              <textarea rows={6} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-sky-300" placeholder="Describe your issue or request" />
            </label>
            <button type="submit" className="rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white">Submit request</button>
          </form>

          <div className="mt-8 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            <p>Alternate contact routes: <a href="tel:+919104881806" className="font-medium text-sky-700">{businessConfig.phone}</a> or <a href="mailto:vinirostore@gmail.com" className="font-medium text-sky-700">{businessConfig.email}</a></p>
            <p className="mt-2">WhatsApp is disabled until an official business number is configured.</p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
