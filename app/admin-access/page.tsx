"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ADMIN_EMAIL, useAuthState } from "@/components/auth-state";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function AdminAccessPage() {
  const router = useRouter();
  const { isAuthReady, isAuthenticated, isSupabaseAuthenticated, isAdminAuthenticated, user, verifyAdminAccess } = useAuthState();
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthReady) return;
    if (!isAuthenticated || !isSupabaseAuthenticated || user?.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      router.replace("/login");
      return;
    }
    if (isAdminAuthenticated) router.replace("/admin");
  }, [isAdminAuthenticated, isAuthReady, isAuthenticated, isSupabaseAuthenticated, router, user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = await verifyAdminAccess(phone, birthDate);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.replace("/admin");
  }

  if (!isAuthReady || !isAuthenticated || !isSupabaseAuthenticated || user?.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) return null;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-lg px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-[30px] border border-slate-200 bg-white p-8 shadow-[0_20px_40px_rgba(15,23,42,0.04)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Admin access</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">Verify identity</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Enter the registered admin phone number and birth date to continue to the admin portal.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <label className="block text-sm font-medium text-slate-700">
              Phone number
              <input
                type="password"
                required
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-sky-300"
                placeholder="••••••••••"
                autoComplete="off"
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Security question: Birth date
              <input
                type="password"
                required
                value={birthDate}
                onChange={(event) => setBirthDate(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-sky-300"
                placeholder="••••••••••"
                autoComplete="off"
              />
            </label>

            <button type="submit" className="w-full rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white">
              Continue to admin portal
            </button>

            {error ? <p className="text-sm text-rose-700" role="alert">{error}</p> : null}
          </form>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
