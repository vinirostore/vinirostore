"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useAuthState } from "@/components/auth-state";
import { ServiceRequestQr } from "@/components/service-request-qr";
import { supabase } from "@/lib/supabase";

type ServiceBooking = {
  id: string;
  qr_value: string;
  request_type: "service" | "amc";
  subject: string;
  status: string;
};

export function ServiceBookingForm({ serviceName, requestType, returnTo }: { serviceName: string; requestType: "service" | "amc"; returnTo: string }) {
  const { isAuthReady, user } = useAuthState();
  const [booking, setBooking] = useState<ServiceBooking | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [whatsappLink, setWhatsappLink] = useState("");

  useEffect(() => {
    if (!booking || booking.status === "completed" || booking.status === "cancelled") return;
    let active = true;
    const refreshStatus = async () => {
      try {
        const response = await fetch(`/api/service-requests?qrValue=${encodeURIComponent(booking.qr_value)}`, { cache: "no-store" });
        if (!response.ok) return;
        const result = await response.json() as { request?: Partial<ServiceBooking> };
        if (active && result.request?.status) setBooking((current) => current ? { ...current, status: result.request!.status! } : current);
      } catch {
        // Keep the last known booking status if the connection is temporarily unavailable.
      }
    };
    const interval = window.setInterval(() => void refreshStatus(), 10000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [booking]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError("");

    const form = new FormData(event.currentTarget);
    const payload = {
      requestType,
      subject: serviceName,
      name: String(form.get("name") || "").trim(),
      email: String(form.get("email") || "").trim(),
      phone: String(form.get("phone") || "").trim(),
      city: String(form.get("city") || "").trim(),
      address: String(form.get("address") || "").trim(),
      message: String(form.get("message") || "").trim(),
    };

    try {
      const sessionResult = await supabase?.auth.getSession();
      if (sessionResult?.error) throw new Error(sessionResult.error.message);
      const accessToken = sessionResult?.data.session?.access_token;
      const response = await fetch("/api/service-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json() as { request?: ServiceBooking; error?: string };
      if (!response.ok || !result.request) throw new Error(result.error || "Could not save your booking.");

      setBooking(result.request);
      setWhatsappLink(`https://wa.me/919104881806?text=${encodeURIComponent(`Service ID: ${result.request.id}\nService: ${serviceName}\nName: ${payload.name}\nPhone: ${payload.phone}\nAddress: ${payload.address}, ${payload.city}`)}`);
    } catch (bookingError) {
      setError(bookingError instanceof Error ? bookingError.message : "Could not save your booking. Please retry.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (booking) {
    return (
      <section className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-5" aria-live="polite">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-800">{booking.status === "completed" ? "Service completed" : booking.status === "cancelled" ? "Booking cancelled" : booking.status === "in_progress" ? "Service in progress" : "Service booked"}</p>
        <h2 className="mt-2 text-xl font-semibold text-slate-900">Your service ID</h2>
        <p className="mt-1 break-all font-mono text-sm text-slate-700">VINI-SVC-{booking.id.toUpperCase()}</p>
        <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-start">
          <ServiceRequestQr value={booking.qr_value} />
          <div className="max-w-xl">
            {booking.status === "completed" ? <p className="font-bold text-emerald-800">SERVICE COMPLETED</p> : booking.status === "cancelled" ? <p className="font-semibold text-slate-700">This booking has been cancelled.</p> : <>
              <p className="font-extrabold text-rose-700">DO NOT SCAN THIS QR CODE BEFORE THE SERVICE IS DONE.</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">Ask the service technician to scan it only after completing your {requestType === "amc" ? "AMC visit" : "service"}. Scanning marks this booking completed.</p>
            </>}
            {user ? <Link href="/account" className="mt-4 inline-block text-sm font-semibold text-sky-800 underline">View booking in your account</Link> : <p className="mt-4 text-xs text-slate-600">Keep this QR code available for the technician.</p>}
          </div>
        </div>
        {whatsappLink ? <a href={whatsappLink} target="_blank" rel="noreferrer" className="service-primary-button mt-5 inline-flex rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white">Send details on WhatsApp</a> : null}
      </section>
    );
  }

  if (!isAuthReady) {
    return <p className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">Checking your account...</p>;
  }

  if (!user) {
    const loginHref = `/login?returnTo=${encodeURIComponent(returnTo)}`;
    const registerHref = `/register?returnTo=${encodeURIComponent(returnTo)}`;

    return (
      <section className="mt-8 rounded-2xl border border-sky-200 bg-sky-50 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-800">{requestType === "amc" ? "AMC booking" : "Service booking"}</p>
        <h2 className="mt-2 text-xl font-semibold text-slate-900">Sign in to book a service</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">Sign in to your account or create one to book this service and track its status from your account page.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href={loginHref} className="service-primary-button rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white">Sign in</Link>
          <Link href={registerHref} className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700">Create account</Link>
        </div>
      </section>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 rounded-2xl border border-slate-200 bg-white p-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{requestType === "amc" ? "AMC booking" : "Service booking"}</p>
        <h2 className="mt-2 text-xl font-semibold text-slate-900">Book {serviceName}</h2>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">Name<input name="name" required maxLength={100} defaultValue={user?.name || ""} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5" autoComplete="name" /></label>
        <label className="text-sm font-medium text-slate-700">Email<input name="email" required type="email" defaultValue={user?.email || ""} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5" autoComplete="email" /></label>
        <label className="text-sm font-medium text-slate-700">Phone<input name="phone" required type="tel" defaultValue={user?.phone || ""} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5" autoComplete="tel" /></label>
        <label className="text-sm font-medium text-slate-700">City<input name="city" required maxLength={100} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5" autoComplete="address-level2" /></label>
        <label className="text-sm font-medium text-slate-700 sm:col-span-2">Full address<input name="address" required minLength={5} maxLength={500} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5" autoComplete="street-address" /></label>
        <label className="text-sm font-medium text-slate-700 sm:col-span-2">Service details<textarea name="message" required minLength={8} maxLength={2000} rows={4} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5" placeholder="Describe the issue or the work needed." /></label>
      </div>
      {error ? <p role="alert" className="mt-4 text-sm text-rose-700">{error}</p> : null}
      <button type="submit" disabled={isSubmitting} className="service-primary-button mt-5 rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-60">{isSubmitting ? "Saving booking..." : "Save booking and create QR"}</button>
    </form>
  );
}