"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { businessConfig } from "@/lib/site-config";
import { ADMIN_EMAIL, getStoredAccountByEmail, useAuthState } from "@/components/auth-state";
import { getCustomerAccount, type CustomerOrder, type CustomerServiceRequest } from "@/lib/customer-data";

export default function AccountPage() {
  const router = useRouter();
  const { isAuthenticated, isAdminAuthenticated, logout, user, changePassword } = useAuthState();
  const storedAccount = user ? getStoredAccountByEmail(user.email) : undefined;
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [serviceRequests, setServiceRequests] = useState<CustomerServiceRequest[]>([]);
  const [dataError, setDataError] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() || isAdminAuthenticated) {
      router.replace("/admin");
    }
  }, [isAuthenticated, isAdminAuthenticated, router, user]);

  useEffect(() => {
    if (!user?.id) return;
    void getCustomerAccount(user.id).then((result) => {
      setOrders(result.orders);
      setServiceRequests(result.serviceRequests);
      setDataError(result.error || "");
    });
  }, [user?.id]);

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

  async function handlePasswordChange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordMessage("");
    setPasswordError("");
    const formData = new FormData(event.currentTarget);
    const currentPassword = String(formData.get("currentPassword") || "");
    const newPassword = String(formData.get("newPassword") || "");
    const confirmPassword = String(formData.get("confirmPassword") || "");
    if (newPassword.length < 6 || newPassword !== confirmPassword) {
      setPasswordError("Use a matching password of at least 6 characters.");
      return;
    }
    setIsChangingPassword(true);
    const result = await changePassword(currentPassword, newPassword);
    setIsChangingPassword(false);
    if (result.error) {
      setPasswordError(result.error);
      return;
    }
    event.currentTarget.reset();
    setPasswordMessage("Your password was changed successfully.");
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
                <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">My orders</p><p className="mt-2 text-base font-medium text-slate-900">{orders.length} total</p></div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Service requests</p><p className="mt-2 text-base font-medium text-slate-900">{serviceRequests.length} total</p></div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Completed orders</p><p className="mt-2 text-base font-medium text-slate-900">{orders.filter((order) => order.status === "delivered").length}</p></div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Completed services</p><p className="mt-2 text-base font-medium text-slate-900">{serviceRequests.filter((request) => request.status === "completed").length}</p></div>
              </div>
            </div>

            <div className="mt-8 border-t border-slate-200 pt-8">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Recent activity</h3>
              {dataError ? <p className="mt-4 text-sm text-rose-700">{dataError}</p> : null}
              {!dataError && orders.length === 0 && serviceRequests.length === 0 ? <p className="mt-4 text-sm text-slate-600">No orders or service requests yet.</p> : null}
              <div className="mt-4 space-y-3">
                {orders.slice(0, 5).map((order) => <div key={order.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="flex justify-between gap-4"><p className="font-medium text-slate-900">Order {order.order_number}</p><span className="text-sm capitalize text-slate-600">{order.status}</span></div><p className="mt-2 text-sm text-slate-600">{order.order_items.length} item(s) · ₹{Number(order.total).toLocaleString("en-IN")}</p></div>)}
                {serviceRequests.slice(0, 5).map((request) => <div key={request.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="flex justify-between gap-4"><p className="font-medium text-slate-900">{request.subject}</p><span className="text-sm capitalize text-slate-600">{request.status.replace("_", " ")}</span></div><p className="mt-2 line-clamp-2 text-sm text-slate-600">{request.message}</p></div>)}
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

            <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_20px_40px_rgba(15,23,42,0.04)]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Security</p>
              <h2 className="mt-3 text-xl font-semibold text-slate-900">Change password</h2>
              <form onSubmit={handlePasswordChange} className="mt-5 space-y-4">
                <input name="currentPassword" required type="password" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-sky-300" placeholder="Current password" />
                <input name="newPassword" required type="password" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-sky-300" placeholder="New password" />
                <input name="confirmPassword" required type="password" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-sky-300" placeholder="Confirm new password" />
                <button type="submit" disabled={isChangingPassword} className="rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60">{isChangingPassword ? "Updating..." : "Update password"}</button>
                {passwordError ? <p className="text-sm text-rose-700" role="alert">{passwordError}</p> : null}
                {passwordMessage ? <p className="text-sm text-emerald-700" role="status">{passwordMessage}</p> : null}
              </form>
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
