"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { useAuthState } from "@/components/auth-state";

export default function RegisterPage() {
  const router = useRouter();
  const { isAuthenticated, registerAccount } = useAuthState();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) router.replace("/account");
  }, [isAuthenticated, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;
    setError("");
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (!name || !email || !phone || !password) {
      setError("Please complete all fields to continue.");
      setIsSubmitting(false);
      return;
    }

    if (password.length < 6) {
      setError("Use at least 6 characters for your password.");
      setIsSubmitting(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsSubmitting(false);
      return;
    }

    const result = await registerAccount(name, email, password, phone);
    if (result.error) {
      const normalizedError = result.error.toLowerCase();
      setError(normalizedError.includes("rate limit") || normalizedError.includes("email rate")
        ? "Email sending is temporarily limited by Supabase. Wait a few minutes, then try again. If this email already has an account, use Login with email OTP instead."
        : normalizedError.includes("already registered")
          ? "An account with this email already exists. Please log in instead."
          : result.error);
      setIsSubmitting(false);
      return;
    }

    if (result.needsEmailConfirmation) {
      setError("Account created. Check your email to confirm the account, then log in.");
      setIsSubmitting(false);
      return;
    }

    router.push("/account");
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-md px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-[30px] border border-slate-200 bg-white p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Account</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">Create account</h1>
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <label className="block text-sm font-medium text-slate-700">
              Full name
              <input
                name="name"
                required
                type="text"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-sky-300"
                placeholder="Your full name"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Email
              <input
                name="email"
                required
                type="email"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-sky-300"
                placeholder="you@example.com"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Phone number
              <input
                name="phone"
                required
                type="tel"
                inputMode="tel"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-sky-300"
                placeholder="+91 98765 43210"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Password
              <div className="relative mt-2">
                <input
                  name="password"
                  required
                  type={showPassword ? "text" : "password"}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 pr-11 outline-none focus:border-sky-300"
                  placeholder="Create password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute inset-y-0 right-3 flex items-center text-xs font-medium text-slate-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Confirm password
              <div className="relative mt-2">
                <input
                  name="confirmPassword"
                  required
                  type={showConfirmPassword ? "text" : "password"}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 pr-11 outline-none focus:border-sky-300"
                  placeholder="Re-enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((current) => !current)}
                  className="absolute inset-y-0 right-3 flex items-center text-xs font-medium text-slate-600"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
            </label>
            <button type="submit" disabled={isSubmitting} className="w-full rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60">
              {isSubmitting ? "Creating account..." : "Create account"}
            </button>
            {error ? <p className="text-sm text-rose-700" role="alert">{error}</p> : null}
          </form>
          <p className="mt-5 text-sm text-slate-600">
            Already have an account? <Link href="/login" className="font-medium text-sky-700">Login</Link>
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
