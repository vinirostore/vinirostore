"use client";

import { FormEvent, useState } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { businessConfig } from "@/lib/site-config";
import { useAuthState } from "@/components/auth-state";
import { createServiceRequest } from "@/lib/customer-data";

export default function ContactPage() {
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuthState();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const subject = String(formData.get("subject") ?? "").trim();
    const body = String(formData.get("message") ?? "").trim();

    if (!name || !email || !body) {
      setStatus("Please complete your name, email, and message before continuing.");
      return;
    }

    setIsSubmitting(true);

    let persistenceWarning = "";
    if (user?.id) {
      const result = await createServiceRequest({ customerId: user.id, name, email, phone, subject, message: body });
      if (result.error) {
        persistenceWarning = " Your WhatsApp booking was prepared, but it could not be saved to your account.";
      }
    }

    const whatsappMessage = [
      `Name: ${name}`,
      `Email: ${email}`,
      `Phone: ${phone || "Not provided"}`,
      `Subject: ${subject || "General enquiry"}`,
      `Message: ${body}`,
    ].join("\n");
    window.open(`https://wa.me/919104881806?text=${encodeURIComponent(whatsappMessage)}`, "_blank", "noopener,noreferrer");
    setStatus(`WhatsApp opened with your message ready to review.${persistenceWarning}`);
    setIsSubmitting(false);
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[30px] border border-slate-200 bg-white p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Contact</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">We&apos;re here to help</h1>
            <div className="mt-6 space-y-4 text-sm leading-7 text-slate-600">
              <p><span className="font-medium text-slate-900">Business:</span> {businessConfig.businessName}</p>
              <p><span className="font-medium text-slate-900">Owner:</span> {businessConfig.ownerName}</p>
              <p><span className="font-medium text-slate-900">Phone:</span> <a href={`tel:${businessConfig.phone.replace(/\s+/g, "")}`} className="text-sky-700">{businessConfig.phone}</a></p>
              <p><span className="font-medium text-slate-900">Email:</span> <a href={`mailto:${businessConfig.email}`} className="text-sky-700">{businessConfig.email}</a></p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="rounded-[30px] border border-slate-200 bg-white p-8">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">Name<input name="name" required type="text" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none transition focus:border-sky-300" placeholder="Your name" /></label>
              <label className="block text-sm font-medium text-slate-700">Email<input name="email" required type="email" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none transition focus:border-sky-300" placeholder="you@example.com" /></label>
              <label className="block text-sm font-medium text-slate-700">Phone<input name="phone" type="tel" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none transition focus:border-sky-300" placeholder="Your phone number" /></label>
              <label className="block text-sm font-medium text-slate-700">Subject<input name="subject" type="text" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none transition focus:border-sky-300" placeholder="How can we help?" /></label>
              <label className="block text-sm font-medium text-slate-700 sm:col-span-2">Message<textarea name="message" required rows={6} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none transition focus:border-sky-300" placeholder="Tell us how we can help." /></label>
            </div>
            <button type="submit" disabled={isSubmitting} className="mt-6 rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? "Preparing booking..." : "Open WhatsApp"}</button>
            {status ? <p className="mt-4 text-sm text-slate-600" role="status">{status}</p> : null}
          </form>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
