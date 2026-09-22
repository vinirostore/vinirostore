"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { businessConfig } from "@/lib/site-config";
import { ADMIN_EMAIL, getStoredAccountByEmail, useAuthState } from "@/components/auth-state";

const accountSections = [
  { label: "My Orders", value: "2 active orders" },
  { label: "Service Requests", value: "3 recent requests" },
  { label: "Service History", value: "8 completed visits" },
  { label: "AMC Information", value: "Active coverage" },
];

export default function AccountPage() {
  const router = useRouter();
  const { isAuthenticated, isAdminAuthenticated, logout, user } = useAuthState();
  const storedAccount = user ? getStoredAccountByEmail(user.email) : undefined;

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() || isAdminAuthenticated) {
      router.replace("/admin");
    }
  }, [isAuthenticated, isAdminAuthenticated, router, user]);

  if (!isAuthenticated || !user) return null;

  if (user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) return null;

  const profile = {
    name: user.name || "Customer",
    email: user.email || businessConfig.email,
    phone: user.phone || storedAccount?.phone || businessConfig.phone,
    memberSince: storedAccount?.createdAt ? new Date(storedAccount.createdAt).getFullYear() : new Date().getFullYear(),
    addresses: storedAccount?.addresses ?? [],
    notifications: storedAccount?.notifications ?? { serviceUpdates: true, promos: true, orderStatus: true },
    paymentPreferences: storedAccount?.paymentPreferences ?? { method: "cashfree" },
  };

  const initials = profile.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "C";

  function handleLogout() {
    logout();
    router.replace("/login");
    router.refresh();
    if (typeof window !== "undefined" && window.location.pathname !== "/login") {
      window.location.assign("/login");
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Account</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">Welcome back</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            Manage your RO service requests, preferred plans, and upcoming support details.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_20px_40px_rgba(15,23,42,0.04)] sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Profile</p>
                <h2 className="mt-3 text-2xl font-semibold text-slate-900">{profile.name}</h2>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sky-100 text-lg font-semibold text-sky-800">
                {initials}
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Email</p>
                <p className="mt-3 text-sm font-medium text-slate-900">{profile.email}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Phone</p>
                <p className="mt-3 text-sm font-medium text-slate-900">{profile.phone}</p>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Quick overview</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {accountSections.map((section) => (
                  <div key={section.label} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{section.label}</p>
                    <p className="mt-2 text-base font-medium text-slate-900">{section.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_20px_40px_rgba(15,23,42,0.04)]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Account settings</p>
              <ul className="mt-5 space-y-3 text-sm text-slate-700">
                <li className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">Profile details: {profile.name}</li>
                <li className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">Saved addresses: {profile.addresses.length ? `${profile.addresses.length} saved` : "None yet"}</li>
                <li className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">Payment preferences: {profile.paymentPreferences.method}</li>
                <li className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">Notifications: {Object.values(profile.notifications).filter(Boolean).length} enabled</li>
              </ul>
            </div>

            <div className="rounded-[30px] border border-slate-200 bg-gradient-to-br from-slate-900 to-sky-900 p-6 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-200">Member since</p>
              <p className="mt-3 text-3xl font-semibold">{profile.memberSince}</p>
              <p className="mt-4 text-sm text-slate-200">Need help with your RO system? Book a service or contact the VINI support team.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/contact" className="rounded-full bg-white px-4 py-2.5 text-sm font-medium text-slate-900">Book service</Link>
                <button type="button" onClick={handleLogout} className="rounded-full border border-white/20 px-4 py-2.5 text-sm font-medium text-white">Logout</button>
              </div>
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
