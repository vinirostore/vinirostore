"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { businessConfig } from "@/lib/site-config";
import { ADMIN_EMAIL, useAuthState } from "@/components/auth-state";
import { getCustomerAccount, saveCustomerProfile, type CustomerOrder, type CustomerProfile, type CustomerServiceRequest } from "@/lib/customer-data";
import { ServiceRequestQr } from "@/components/service-request-qr";
import { useShopState } from "@/components/shop-state";

type NavItem = { id: string; label: string; href: string };
type AddressDraft = { label: string; name: string; line1: string; city: string; state: string; pincode: string; phone: string };

const navItems: NavItem[] = [
  { id: "overview", label: "Account Overview", href: "#overview" },
  { id: "orders", label: "My Orders", href: "#orders" },
  { id: "wishlist", label: "Wishlist", href: "#wishlist" },
  { id: "addresses", label: "My Addresses", href: "#addresses" },
  { id: "profile", label: "Profile Information", href: "#profile" },
  { id: "security", label: "Security", href: "#security" },
  { id: "support", label: "Help & Support", href: "#support" },
];

const quickActions = [
  { title: "My Orders", subtitle: "Track and manage your purchases", href: "#orders", icon: "orders" },
  { title: "Wishlist", subtitle: "Your saved products", href: "#wishlist", icon: "wishlist" },
  { title: "Addresses", subtitle: "Manage delivery addresses", href: "#addresses", icon: "address" },
  { title: "Profile", subtitle: "Personal information", href: "#profile", icon: "profile" },
  { title: "Help & Support", subtitle: "Get assistance", href: "#support", icon: "support" },
] as const;

const serviceCards = [
  { title: "Repair", body: "Quick RO repair requests", price: "From ₹1,200" },
  { title: "General Service", body: "Routine maintenance and filter check", price: "From ₹1,900" },
  { title: "Maintenance", body: "Preventive upkeep for peak performance", price: "From ₹2,300" },
  { title: "AMC", body: "Annual maintenance contract", price: "Starting at ₹2,900" },
  { title: "Other RO Support", body: "Installation, support and troubleshooting", price: "Custom quote" },
] as const;

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value || 0);
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "C";
}

function getOrderStatusTone(status: string) {
  const normalized = status.toLowerCase();
  if (["confirmed", "packed", "shipped"].includes(normalized)) {
    return { label: normalized === "confirmed" ? "Confirmed" : normalized === "packed" ? "Packed" : "Shipped", className: "border border-sky-200 bg-sky-50 text-sky-700" };
  }
  if (normalized === "out for delivery" || normalized === "out_for_delivery" || normalized === "out-for-delivery") {
    return { label: "Out for Delivery", className: "border border-amber-200 bg-amber-50 text-amber-700" };
  }
  if (normalized === "delivered") {
    return { label: "Delivered", className: "border border-emerald-200 bg-emerald-50 text-emerald-700" };
  }
  if (normalized === "cancelled" || normalized === "canceled") {
    return { label: "Cancelled", className: "border border-rose-200 bg-rose-50 text-rose-700" };
  }
  return { label: status || "Processing", className: "border border-slate-200 bg-slate-50 text-slate-700" };
}

function QuickActionIcon({ name }: { name: string }) {
  const shareProps = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "h-5 w-5",
    "aria-hidden": true,
  };

  if (name === "orders") {
    return (
      <svg {...shareProps}>
        <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5h13A2.5 2.5 0 0 1 21 7.5v9A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5v-9Z" />
        <path d="M8 9h8M8 12h8M8 15h5" />
      </svg>
    );
  }

  if (name === "wishlist") {
    return (
      <svg {...shareProps}>
        <path d="M12 20.5s-7-4.35-7-10.25A4.25 4.25 0 0 1 9.25 6c1.05 0 2.13.44 2.75 1.2A3.85 3.85 0 0 1 14.75 6 4.25 4.25 0 0 1 19 10.25C19 16.15 12 20.5 12 20.5Z" />
      </svg>
    );
  }

  if (name === "address") {
    return (
      <svg {...shareProps}>
        <path d="M12 21s6-5.06 6-11.3A6 6 0 0 0 6 9.7C6 15.94 12 21 12 21Z" />
        <circle cx="12" cy="9.5" r="2.5" />
      </svg>
    );
  }

  if (name === "profile") {
    return (
      <svg {...shareProps}>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 19c1.3-2.8 4.2-4 7-4s5.7 1.2 7 4" />
      </svg>
    );
  }

  return (
    <svg {...shareProps}>
      <circle cx="12" cy="12" r="8" />
      <path d="M9.5 9.5h5M9.5 12h5M9.5 14.5h3.5" />
    </svg>
  );
}

export default function AccountPage() {
  const router = useRouter();
  const { isAuthenticated, isAdminAuthenticated, logout, user, changePassword } = useAuthState();
  const { wishlistItems } = useShopState();
  const [activeSection, setActiveSection] = useState("overview");
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [serviceRequests, setServiceRequests] = useState<CustomerServiceRequest[]>([]);
  const [dataError, setDataError] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isServiceHistoryOpen, setIsServiceHistoryOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [profileDraft, setProfileDraft] = useState({ name: user?.name || "", email: user?.email || "", phone: user?.phone || "" });
  const [addressDraft, setAddressDraft] = useState<AddressDraft>({ label: "Home", name: "", line1: "", city: "", state: "", pincode: "", phone: "" });

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
    const accountUserId = user?.id ?? "";
    if (!accountUserId) return;
    const refreshAccount = () => void getCustomerAccount(accountUserId).then((result) => {
      setCustomerProfile(result.profile);
      setOrders(result.orders);
      setServiceRequests(result.serviceRequests);
      setDataError(result.error || "");
    });
    refreshAccount();
    const interval = window.setInterval(refreshAccount, 15000);
    window.addEventListener("focus", refreshAccount);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", refreshAccount);
    };
  }, [user?.id]);

  const profile = useMemo(() => ({
    name: customerProfile?.full_name || user?.name || "Customer",
    email: customerProfile?.email || user?.email || businessConfig.email,
    phone: customerProfile?.phone || user?.phone || businessConfig.phone,
    memberSince: customerProfile?.created_at ? new Date(customerProfile.created_at).getFullYear() : new Date().getFullYear(),
    addresses: customerProfile?.addresses ?? [],
    notifications: customerProfile?.notification_preferences ?? { serviceUpdates: true, promos: true, orderStatus: true },
    paymentPreferences: customerProfile?.payment_preferences ?? { method: "cashfree" },
  }), [customerProfile, user?.email, user?.name, user?.phone]);

  const initials = getInitials(profile.name);

  if (!isAuthenticated || !user) return null;
  const userId = user.id ?? "";
  if (!userId) return null;
  if (user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) return null;

  function handleLogout() {
    logout();
    router.replace("/login");
    router.refresh();
  }

  function openProfileEditor() {
    setProfileDraft({
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
    });
    setIsProfileModalOpen(true);
  }

  function openAddressEditor() {
    setAddressDraft({
      label: "Home",
      name: profile.name,
      line1: "",
      city: "",
      state: "Gujarat",
      pincode: "",
      phone: profile.phone,
    });
    setIsAddressModalOpen(true);
  }

  async function handleProfileSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextProfile = {
      id: userId,
      fullName: profileDraft.name.trim(),
      email: profileDraft.email.trim(),
      phone: profileDraft.phone.trim(),
    };
    if (!nextProfile.fullName || !nextProfile.email) return;
    const result = await saveCustomerProfile(nextProfile);
    if (!result.error) {
      setCustomerProfile((current) => ({
        ...(current ?? {
          full_name: "",
          email: "",
          phone: null,
          security_question: null,
          security_answer_hash: null,
          addresses: [],
          notification_preferences: { serviceUpdates: true, promos: true, orderStatus: true },
          payment_preferences: { method: "cashfree" },
          created_at: new Date().toISOString(),
        }),
        full_name: nextProfile.fullName,
        email: nextProfile.email,
        phone: nextProfile.phone || null,
      }));
      setIsProfileModalOpen(false);
    }
  }

  async function handleAddressSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!addressDraft.name.trim() || !addressDraft.line1.trim() || !addressDraft.city.trim() || !addressDraft.pincode.trim()) return;
    const nextAddress = {
      id: `local-${Date.now()}`,
      label: addressDraft.label || "Home",
      line1: addressDraft.line1,
      city: addressDraft.city,
      state: addressDraft.state || "Gujarat",
      pincode: addressDraft.pincode,
      phone: addressDraft.phone || profile.phone,
      isDefault: profile.addresses.length === 0,
    };
    setCustomerProfile((current) => ({
      ...(current ?? {
        full_name: profile.name,
        email: profile.email,
        phone: profile.phone,
        security_question: null,
        security_answer_hash: null,
        addresses: [],
        notification_preferences: { serviceUpdates: true, promos: true, orderStatus: true },
        payment_preferences: { method: "cashfree" },
        created_at: new Date().toISOString(),
      }),
      addresses: [...(current?.addresses ?? []), nextAddress],
    }));
    setAddressDraft({ label: "Home", name: "", line1: "", city: "", state: "", pincode: "", phone: "" });
    setIsAddressModalOpen(false);
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
      <main className="bg-[#f5f7fb] text-slate-900">
        <div className="mx-auto max-w-[1280px] px-4 pb-12 pt-5 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            <Link href="/" className="transition hover:text-sky-700">Home</Link>
            <span aria-hidden="true">/</span>
            <span className="text-slate-800">My Account</span>
          </nav>

          <header className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_12px_32px_rgba(15,23,42,0.04)] sm:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">My Account</p>
                <h1 className="mt-3 text-[28px] font-semibold tracking-[-0.04em] text-slate-900 sm:text-[32px]">Hello, {profile.name}</h1>
                <p className="mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
                  Manage your orders, profile, addresses and RO service preferences.
                </p>
              </div>

              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sky-100 text-lg font-semibold text-sky-800">{initials}</div>
                <div className="min-w-0">
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" /> Verified account
                  </div>
                  <p className="mt-2 text-sm text-slate-600">Member since {profile.memberSince}</p>
                </div>
                <button
                  type="button"
                  onClick={openProfileEditor}
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-sky-200 hover:text-sky-700"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          </header>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {quickActions.map((item) => (
              <Link key={item.title} href={item.href} className="group rounded-[22px] border border-slate-200 bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.02)] transition duration-200 hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-[0_12px_30px_rgba(14,116,144,0.06)]">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                    <QuickActionIcon name={item.icon} />
                  </div>
                  <span aria-hidden="true" className="text-lg text-slate-400 transition group-hover:text-sky-700">→</span>
                </div>
                <h2 className="mt-4 text-base font-semibold text-slate-900">{item.title}</h2>
                <p className="mt-1 text-sm text-slate-600">{item.subtitle}</p>
              </Link>
            ))}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
            <aside className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.03)] lg:sticky lg:top-20 lg:h-fit">
              <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Account Overview</p>
              <nav className="mt-4 space-y-1">
                {navItems.map((item) => (
                  <a
                    key={item.id}
                    href={item.href}
                    onClick={() => setActiveSection(item.id)}
                    className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition ${activeSection === item.id ? "border border-sky-200 bg-sky-50 text-sky-800 shadow-[inset_2px_0_0_0_#0ea5e9]" : "text-slate-700 hover:bg-slate-50"}`}
                  >
                    <span className="font-medium">{item.label}</span>
                  </a>
                ))}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-4 flex w-full items-center justify-between rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-left text-sm font-medium text-rose-700 transition hover:bg-rose-100"
                >
                  <span>Logout</span>
                </button>
              </nav>
            </aside>

            <div className="space-y-6">
              <section id="overview" className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.03)] sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Account overview</p>
                    <h2 className="mt-2 text-xl font-semibold text-slate-900">Your VINI RO summary</h2>
                  </div>
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">My orders</p>
                    <p className="mt-3 text-2xl font-semibold text-slate-900">{orders.length}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Wishlist</p>
                    <p className="mt-3 text-2xl font-semibold text-slate-900">{wishlistItems.length}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Saved addresses</p>
                    <p className="mt-3 text-2xl font-semibold text-slate-900">{profile.addresses.length}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Service requests</p>
                    <p className="mt-3 text-2xl font-semibold text-slate-900">{serviceRequests.length}</p>
                  </div>
                </div>
              </section>

              <section id="orders" className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.03)] sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">My Orders</p>
                    <h2 className="mt-2 text-xl font-semibold text-slate-900">Recent orders</h2>
                  </div>
                  <Link href="/orders" className="inline-flex items-center gap-1 text-sm font-medium text-sky-700 transition hover:text-sky-800">
                    View all orders <span aria-hidden="true">→</span>
                  </Link>
                </div>

                {dataError ? <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{dataError}</div> : null}

                {!dataError && orders.length === 0 ? (
                  <div className="mt-5 rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
                        <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5h13A2.5 2.5 0 0 1 21 7.5v9A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5v-9Z" />
                        <path d="M8 9h8M8 12h8M8 15h5" />
                      </svg>
                    </div>
                    <p className="mt-4 text-base font-semibold text-slate-900">No orders yet</p>
                    <p className="mt-2 text-sm text-slate-600">Explore our RO systems and find the right purifier for your home.</p>
                    <Link href="/products" className="mt-5 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-sky-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-sky-800">Start shopping</Link>
                  </div>
                ) : null}

                {orders.length > 0 ? (
                  <div className="mt-5 space-y-4">
                    {orders.slice(0, 3).map((order) => {
                      const status = getOrderStatusTone(order.status);
                      const firstItem = order.order_items[0];
                      return (
                        <article key={order.id} className="rounded-[22px] border border-slate-200 bg-slate-50 p-4 sm:p-5">
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Order #{order.order_number}</p>
                              <p className="mt-2 text-sm text-slate-600">Placed on {new Date(order.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
                            </div>
                            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${status.className}`}>{status.label}</span>
                          </div>

                          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
                            <div className="h-20 w-20 overflow-hidden rounded-xl border border-slate-200 bg-white">
                              {firstItem?.product_image ? (
                                <img src={firstItem.product_image} alt={firstItem.product_name} className="h-full w-full object-cover" />
                              ) : (
                                <div className="flex h-full items-center justify-center bg-slate-100 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">VINI</div>
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="text-base font-semibold text-slate-900">{firstItem?.product_name || "VINI RO Purifier"}</p>
                              <p className="mt-1 text-sm text-slate-600">Qty: {firstItem?.quantity ?? order.order_items.reduce((sum, item) => sum + item.quantity, 0)}</p>
                              <p className="mt-3 text-lg font-semibold text-slate-900">{formatCurrency(Number(order.total))}</p>
                            </div>

                            <div className="flex flex-col items-start sm:items-end">
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                                {status.label}
                              </div>
                              <p className="mt-2 text-sm text-slate-500">Delivered on {new Date(order.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
                              <Link href={`/track-order/${encodeURIComponent(order.id)}`} className="mt-3 inline-flex min-h-[40px] items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-sky-200 hover:text-sky-700">View order</Link>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                ) : null}
              </section>

              <section id="wishlist" className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.03)] sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">My Wishlist</p>
                    <h2 className="mt-2 text-xl font-semibold text-slate-900">Saved favourites</h2>
                  </div>
                  <Link href="/wishlist" className="inline-flex items-center gap-1 text-sm font-medium text-sky-700 transition hover:text-sky-800">
                    View wishlist <span aria-hidden="true">→</span>
                  </Link>
                </div>

                {wishlistItems.length === 0 ? (
                  <div className="mt-5 rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                    <p className="text-base font-semibold text-slate-900">Your wishlist is empty</p>
                    <p className="mt-2 text-sm text-slate-600">Save your RO favourites and revisit them anytime.</p>
                    <Link href="/products" className="mt-5 inline-flex min-h-[44px] items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-sky-200 hover:text-sky-700">Explore products</Link>
                  </div>
                ) : (
                  <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {wishlistItems.slice(0, 4).map((product) => (
                      <div key={product.slug} className="rounded-[22px] border border-slate-200 bg-slate-50 p-3">
                        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="h-36 w-full object-cover" />
                          ) : (
                            <div className="flex h-36 items-center justify-center bg-slate-100 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">VINI</div>
                          )}
                        </div>
                        <div className="mt-3 flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{product.name}</p>
                            <p className="mt-1 text-xs text-slate-500">★★★★★ 4.8</p>
                          </div>
                          <button type="button" className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500" aria-label={`Remove ${product.name} from wishlist`}>
                            ♥
                          </button>
                        </div>
                        <div className="mt-3 flex items-center justify-between gap-2">
                          <div>
                            <p className="text-base font-semibold text-slate-900">{formatCurrency(product.price || 0)}</p>
                            {product.compareAtPrice ? <p className="text-xs text-slate-400 line-through">{formatCurrency(product.compareAtPrice)}</p> : null}
                          </div>
                          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-700">In stock</span>
                        </div>
                        <button type="button" className="mt-4 inline-flex min-h-[42px] w-full items-center justify-center rounded-xl bg-sky-700 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-sky-800">Add to Cart</button>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section id="profile" className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.03)] sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Profile</p>
                    <h2 className="mt-2 text-xl font-semibold text-slate-900">Personal information</h2>
                  </div>
                  <button type="button" onClick={openProfileEditor} className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-sky-200 hover:text-sky-700">Edit Profile</button>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Name</p>
                    <p className="mt-3 text-sm font-medium text-slate-900">{profile.name}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Email</p>
                    <p className="mt-3 text-sm font-medium text-slate-900">{profile.email}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Phone</p>
                    <p className="mt-3 text-sm font-medium text-slate-900">{profile.phone}</p>
                  </div>
                </div>
              </section>

              <section id="addresses" className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.03)] sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Delivery</p>
                    <h2 className="mt-2 text-xl font-semibold text-slate-900">Saved addresses</h2>
                  </div>
                  <button type="button" onClick={openAddressEditor} className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-sky-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-sky-800">
                    + Add New Address
                  </button>
                </div>

                {profile.addresses.length === 0 ? (
                  <div className="mt-5 rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                    <p className="text-base font-semibold text-slate-900">No saved addresses</p>
                    <p className="mt-2 text-sm text-slate-600">Add your delivery address to make checkout faster.</p>
                  </div>
                ) : (
                  <div className="mt-5 grid gap-4 lg:grid-cols-2">
                    {profile.addresses.map((address) => (
                      <article key={address.id} className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{address.label || "Home"}</span>
                            {address.isDefault ? <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-700">Default</span> : null}
                          </div>
                          <div className="flex gap-2 text-sm">
                            <button type="button" className="font-medium text-sky-700">Edit</button>
                            <button type="button" className="font-medium text-slate-500">Remove</button>
                          </div>
                        </div>
                        <p className="mt-4 text-sm font-semibold text-slate-900">{profile.name}</p>
                        <p className="mt-2 text-sm text-slate-600">{address.line1 || "Address not available"}</p>
                        <p className="mt-1 text-sm text-slate-600">{address.city || "City"}, {address.state || "State"}</p>
                        <p className="mt-1 text-sm text-slate-600">PIN {address.pincode || "000000"}</p>
                        <p className="mt-3 text-sm text-slate-600">{address.phone || profile.phone}</p>
                      </article>
                    ))}
                  </div>
                )}
              </section>

              <section id="security" className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.03)] sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Security</p>
                    <h2 className="mt-2 text-xl font-semibold text-slate-900">Password & verification</h2>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                  <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Password</p>
                        <p className="mt-3 text-base font-semibold text-slate-900">••••••••••</p>
                      </div>
                      <button type="button" onClick={() => document.getElementById("password-form")?.scrollIntoView({ behavior: "smooth", block: "center" })} className="text-sm font-medium text-sky-700">Change Password →</button>
                    </div>
                    <p className="mt-3 text-sm text-slate-600">Last updated recently</p>
                  </div>

                  <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Verification</p>
                    <div className="mt-3 space-y-3 text-sm text-slate-700">
                      <div className="flex items-center justify-between gap-3"><span>Email verification</span><span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-700">Verified</span></div>
                      <div className="flex items-center justify-between gap-3"><span>Mobile verification</span><span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-700">Verified</span></div>
                    </div>
                  </div>
                </div>

                <form id="password-form" onSubmit={handlePasswordChange} className="mt-5 space-y-4 rounded-[22px] border border-slate-200 bg-slate-50 p-4 sm:p-5">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <input name="currentPassword" required type="password" className="min-h-[44px] rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-sky-300" placeholder="Current password" />
                    <input name="newPassword" required type="password" className="min-h-[44px] rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-sky-300" placeholder="New password" />
                    <input name="confirmPassword" required type="password" className="min-h-[44px] rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-sky-300" placeholder="Confirm password" />
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <button type="submit" disabled={isChangingPassword} className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-sky-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-sky-800 disabled:opacity-60">{isChangingPassword ? "Updating..." : "Update password"}</button>
                    {passwordError ? <p className="text-sm text-rose-700" role="alert">{passwordError}</p> : null}
                    {passwordMessage ? <p className="text-sm text-emerald-700" role="status">{passwordMessage}</p> : null}
                  </div>
                </form>
              </section>

              <section id="support" className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.03)] sm:p-6">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Support</p>
                  <h2 className="mt-2 text-xl font-semibold text-slate-900">Need help?</h2>
                </div>

                <div className="mt-5 rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-600">We&apos;re here to help with your order, installation or RO service.</p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link href="/help" className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-sky-200 hover:text-sky-700">Help Center</Link>
                    <Link href="/contact" className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-sky-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-sky-800">Contact Support</Link>
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">Call Us<br /><span className="mt-1 block font-medium text-slate-900">{businessConfig.phone}</span></div>
                    <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">WhatsApp<br /><span className="mt-1 block font-medium text-slate-900">Chat now</span></div>
                    <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">Email<br /><span className="mt-1 block font-medium text-slate-900">{businessConfig.email}</span></div>
                  </div>
                </div>
              </section>

              <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.03)] sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">RO Services</p>
                    <h2 className="mt-2 text-xl font-semibold text-slate-900">VINI RO Services</h2>
                  </div>
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                  {serviceCards.map((service) => (
                    <article key={service.title} className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                      <p className="text-base font-semibold text-slate-900">{service.title}</p>
                      <p className="mt-2 text-sm text-slate-600">{service.body}</p>
                      <p className="mt-4 text-sm font-semibold text-slate-900">{service.price}</p>
                      <Link href="/services" className="mt-4 inline-flex min-h-[40px] items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-sky-200 hover:text-sky-700">Explore {service.title}</Link>
                    </article>
                  ))}
                </div>
              </section>

              <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.03)] sm:p-6">
                <div id="customer-service-history-section" className="scroll-mt-24">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Service history</p>
                      <h2 className="mt-2 text-xl font-semibold text-slate-900">Your service bookings</h2>
                    </div>
                    <button type="button" onClick={() => setIsServiceHistoryOpen((open) => !open)} className="inline-flex min-h-[40px] items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-sky-200 hover:text-sky-700">
                      {isServiceHistoryOpen ? "Close" : "Open"}
                    </button>
                  </div>

                  {isServiceHistoryOpen ? (
                    <div id="customer-service-history" className="mt-5 space-y-3">
                      {serviceRequests.length === 0 ? (
                        <div className="rounded-[22px] border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">No service history yet. Your service and AMC bookings will appear here.</div>
                      ) : (
                        serviceRequests.map((request) => {
                          const statusLabel = request.status === "open" ? "Service booked" : request.status === "in_progress" ? "Service in progress" : request.status === "completed" ? "Service completed" : request.status === "cancelled" ? "Booking cancelled" : request.status.replace("_", " ");
                          return (
                            <div key={request.id} className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                  <p className="font-semibold text-slate-900">{request.subject}</p>
                                  <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{request.request_type === "amc" ? "AMC booking" : request.request_type === "service" ? "Service booking" : "Enquiry"}</p>
                                </div>
                                <span className="text-sm text-slate-600">{statusLabel}</span>
                              </div>
                              <p className="mt-3 text-sm text-slate-600">{request.message}</p>
                              <p className="mt-2 text-xs text-slate-500">Booked {new Date(request.created_at).toLocaleDateString("en-IN", { dateStyle: "medium" })}</p>
                              {request.qr_value && request.request_type !== "enquiry" ? (
                                <div className="mt-4 flex flex-col gap-4 border-t border-slate-200 pt-4 sm:flex-row">
                                  <ServiceRequestQr value={request.qr_value} />
                                  <div>
                                    <p className="break-all font-mono text-xs text-slate-700">VINI-SVC-{request.id.toUpperCase()}</p>
                                    {request.status === "completed" ? <p className="mt-2 font-semibold text-emerald-700">Service completed</p> : request.status === "cancelled" ? <p className="mt-2 font-semibold text-slate-600">Booking cancelled</p> : <p className="mt-2 font-semibold text-rose-700">Do not scan before service is done.</p>}
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          );
                        })
                      )}
                    </div>
                  ) : null}
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      {isProfileModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-lg rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_30px_80px_rgba(15,23,42,0.18)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Profile</p>
                <h3 className="mt-2 text-xl font-semibold text-slate-900">Edit profile</h3>
              </div>
              <button type="button" onClick={() => setIsProfileModalOpen(false)} className="text-slate-500">✕</button>
            </div>

            <form onSubmit={handleProfileSave} className="mt-5 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Name</label>
                <input value={profileDraft.name} onChange={(event) => setProfileDraft((current) => ({ ...current, name: event.target.value }))} className="min-h-[44px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition focus:border-sky-300" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
                <input type="email" value={profileDraft.email} onChange={(event) => setProfileDraft((current) => ({ ...current, email: event.target.value }))} className="min-h-[44px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition focus:border-sky-300" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Phone</label>
                <input value={profileDraft.phone} onChange={(event) => setProfileDraft((current) => ({ ...current, phone: event.target.value }))} className="min-h-[44px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition focus:border-sky-300" />
              </div>
              <div className="flex flex-wrap justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsProfileModalOpen(false)} className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700">Cancel</button>
                <button type="submit" className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-sky-700 px-4 py-2.5 text-sm font-medium text-white">Save changes</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {isAddressModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-lg rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_30px_80px_rgba(15,23,42,0.18)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Delivery</p>
                <h3 className="mt-2 text-xl font-semibold text-slate-900">Add new address</h3>
              </div>
              <button type="button" onClick={() => setIsAddressModalOpen(false)} className="text-slate-500">✕</button>
            </div>

            <form onSubmit={handleAddressSave} className="mt-5 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Address label</label>
                <input value={addressDraft.label} onChange={(event) => setAddressDraft((current) => ({ ...current, label: event.target.value }))} placeholder="Home" className="min-h-[44px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition focus:border-sky-300" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Full name</label>
                <input value={addressDraft.name} onChange={(event) => setAddressDraft((current) => ({ ...current, name: event.target.value }))} placeholder={profile.name} className="min-h-[44px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition focus:border-sky-300" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Address line</label>
                <input value={addressDraft.line1} onChange={(event) => setAddressDraft((current) => ({ ...current, line1: event.target.value }))} placeholder="Plot no., street, landmark" className="min-h-[44px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition focus:border-sky-300" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">City</label>
                  <input value={addressDraft.city} onChange={(event) => setAddressDraft((current) => ({ ...current, city: event.target.value }))} placeholder="Ahmedabad" className="min-h-[44px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition focus:border-sky-300" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">State</label>
                  <input value={addressDraft.state} onChange={(event) => setAddressDraft((current) => ({ ...current, state: event.target.value }))} placeholder="Gujarat" className="min-h-[44px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition focus:border-sky-300" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Pin code</label>
                  <input value={addressDraft.pincode} onChange={(event) => setAddressDraft((current) => ({ ...current, pincode: event.target.value }))} placeholder="380001" className="min-h-[44px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition focus:border-sky-300" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Phone</label>
                  <input value={addressDraft.phone} onChange={(event) => setAddressDraft((current) => ({ ...current, phone: event.target.value }))} placeholder={profile.phone} className="min-h-[44px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition focus:border-sky-300" />
                </div>
              </div>
              <div className="flex flex-wrap justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsAddressModalOpen(false)} className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700">Cancel</button>
                <button type="submit" className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-sky-700 px-4 py-2.5 text-sm font-medium text-white">Save address</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <SiteFooter />
    </>
  );
}
