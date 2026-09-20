"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthState } from "@/components/auth-state";

export default function AdminSettingsPage() {
  const router = useRouter();
  const { logout } = useAuthState();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  function confirmLogout() {
    setShowLogoutConfirm(false);
    logout();
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Settings</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Business settings</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {[
          ["Store identity", "VINI RO Services"],
          ["Support phone", "+91 9104881806"],
          ["Email", "vinirostore@gmail.com"],
          ["Operating city", "Ahmedabad"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
            <p className="mt-3 text-lg font-medium text-slate-900">{value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Session</p>
            <h2 className="mt-2 text-lg font-semibold text-slate-900">Admin account</h2>
          </div>
          <button type="button" onClick={() => setShowLogoutConfirm(true)} className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-700">Logout</button>
        </div>
      </div>

      {showLogoutConfirm ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/55 p-4">
          <div className="w-full max-w-sm rounded-[28px] border border-slate-200 bg-white p-5 shadow-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Confirm logout</p>
            <h3 className="mt-3 text-xl font-semibold text-slate-900">Are you sure?</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">You will be signed out of the admin portal and redirected to the login page.</p>
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
