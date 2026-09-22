"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ADMIN_EMAIL, ADMIN_PASSWORD, useAuthState } from "@/components/auth-state";

export default function LoginPage() {
  const router = useRouter();
  const { login, loginAdminAccess } = useAuthState();
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const normalizedEmail = email.toLowerCase();

    if (!email || !password) {
      setError("Enter your email and password to continue.");
      return;
    }

    if (normalizedEmail === ADMIN_EMAIL.toLowerCase()) {
      if (password !== ADMIN_PASSWORD) {
        setError("Incorrect password for the specified admin email. Use the exact admin email and password provided for this portal.");
        return;
      }

      loginAdminAccess();
      router.push("/admin-access");
      return;
    }

    const result = await login(email, undefined, undefined, undefined, password);
    if (result.error) {
      setError(result.error.includes("Invalid login credentials") ? "No account found for this email or the password is incorrect." : result.error);
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
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">Login</h1>
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <label className="block text-sm font-medium text-slate-700">
              Email
              <input name="email" required type="email" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-sky-300" placeholder="you@example.com" />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Password
              <div className="relative mt-2">
                <input
                  name="password"
                  required
                  type={showPassword ? "text" : "password"}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 pr-11 outline-none focus:border-sky-300"
                  placeholder="Enter password"
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
            <button type="submit" className="w-full rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white">Continue</button>
            {error ? <p className="text-sm text-rose-700" role="alert">{error}</p> : null}
          </form>
          <p className="mt-5 text-sm text-slate-600">Need an account? <Link href="/register" className="font-medium text-sky-700">Create one</Link></p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
