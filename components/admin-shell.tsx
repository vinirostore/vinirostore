"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthState } from "@/components/auth-state";

const nav = [
  { label: "Overview", href: "/admin" },
  { label: "Brands", href: "/admin/brands" },
  { label: "Models", href: "/admin/models" },
  { label: "Accessories", href: "/admin/accessories" },
  { label: "Products", href: "/admin/products" },
  { label: "Orders", href: "/admin/orders" },
  { label: "Inventory", href: "/admin/inventory" },
  { label: "Customers", href: "/admin/customers" },
  { label: "Services", href: "/admin/services" },
  { label: "AMC", href: "/admin/amc" },
  { label: "Payments", href: "/admin/payments" },
  { label: "Shipping", href: "/admin/shipping" },
  { label: "Settings", href: "/admin/settings" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { logout } = useAuthState();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  function confirmLogout() {
    setShowLogoutConfirm(false);
    logout();
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <button
        type="button"
        aria-label={isMenuOpen ? "Close admin menu" : "Open admin menu"}
        aria-expanded={isMenuOpen}
        onClick={() => setIsMenuOpen((open) => !open)}
        className="fixed right-4 top-4 z-50 flex h-11 w-11 items-center justify-center rounded-xl border border-slate-300 bg-white/90 text-slate-800 shadow-lg transition md:hidden"
      >
        <span className="flex flex-col gap-1.5">
          <span className="block h-0.5 w-5 rounded-full bg-current" />
          <span className="block h-0.5 w-5 rounded-full bg-current" />
          <span className="block h-0.5 w-5 rounded-full bg-current" />
        </span>
      </button>

      {isMenuOpen && (
        <button
          type="button"
          aria-label="Close admin menu overlay"
          onClick={() => setIsMenuOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/40 md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-200 bg-slate-950 text-slate-100 transition-transform duration-300 ease-out ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex items-center gap-3 px-6 py-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500 font-bold text-slate-950">V</div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Admin</p>
            <h1 className="text-lg font-semibold">VINI RO</h1>
          </div>
        </div>
        <nav className="space-y-1 px-4 py-4">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMenuOpen(false)}
              className="flex rounded-xl px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              {item.label}
            </Link>
          ))}

          <button
            type="button"
            onClick={() => {
              setIsMenuOpen(false);
              setShowLogoutConfirm(true);
            }}
            className="mt-4 flex w-full items-center justify-center rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2.5 text-sm font-medium text-rose-200 transition hover:bg-rose-500/20"
          >
            Logout
          </button>
        </nav>
      </aside>

      <main className="min-h-screen md:ml-72">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3 px-4 py-4 md:px-6">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Operations</p>
              <h2 className="text-xl font-semibold text-slate-900">Business Control Center</h2>
            </div>
            <div className="hidden items-center gap-3 md:flex">
              <button type="button" onClick={() => setShowAlerts((current) => !current)} className="rounded-full border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700">Alerts</button>
              <button type="button" onClick={() => router.push("/admin")} className="rounded-full bg-slate-900 px-3 py-2 text-sm font-medium text-white">Admin profile</button>
              <button type="button" onClick={() => setShowLogoutConfirm(true)} className="rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">Logout</button>
            </div>
          </div>
          {showAlerts ? (
            <div className="border-t border-slate-200 bg-white px-4 py-3 md:px-6">
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="rounded-xl bg-amber-50 p-3 text-amber-800">3 low-stock products need review.</li>
                <li className="rounded-xl bg-sky-50 p-3 text-sky-800">2 service requests pending confirmation.</li>
                <li className="rounded-xl bg-emerald-50 p-3 text-emerald-800">AMC renewals are on track.</li>
              </ul>
            </div>
          ) : null}
        </header>
        <div className="p-4 md:p-6">{children}</div>
      </main>

      {showLogoutConfirm ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/55 p-4">
          <div className="w-full max-w-sm rounded-[28px] border border-slate-200 bg-white p-5 shadow-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Confirm logout</p>
            <h3 className="mt-3 text-xl font-semibold text-slate-900">Are you sure?</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">You will be signed out of the admin portal and redirected to the login screen.</p>
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => setShowLogoutConfirm(false)} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700">Cancel</button>
              <button type="button" onClick={confirmLogout} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white">Logout</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
