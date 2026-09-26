"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ADMIN_EMAIL, useAuthState } from "@/components/auth-state";

export default function LoginPage() {
  const router = useRouter();
  const { login, signInAdmin, requestEmailOtp, verifyEmailOtp, requestPasswordReset, resetPasswordWithSecurityAnswer } = useAuthState();
  const [mode, setMode] = useState<"password" | "otp" | "recovery">("password");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [recoveryQuestion, setRecoveryQuestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    if (isSubmitting) return;
    const form = document.querySelector("main form") as HTMLFormElement | null;
    if (!form) return;
    const formData = new FormData(form);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const normalizedEmail = email.toLowerCase();

    setIsSubmitting(true);
    setError("");

    try {

      if (!email || (mode === "password" && !password) || (mode === "otp" && otpSent && !String(formData.get("otp") ?? "").trim())) {
        setError("Enter your email and password to continue.");
        return;
      }

      if (mode === "recovery") {
        const answer = String(formData.get("securityAnswer") ?? "").trim();
        const newPassword = String(formData.get("newPassword") ?? "");
        const confirmPassword = String(formData.get("confirmRecoveryPassword") ?? "");
        if (!recoveryQuestion) {
          const result = await requestPasswordReset(email);
          if (result.error) { setError(result.error); return; }
          if (result.emailReset) {
            setError("A password reset link was sent to your email. Open it to choose a new password.");
            return;
          }
          setRecoveryQuestion(result.question || "");
          setError("Answer the security question to continue.");
          return;
        }
        if (!answer || newPassword.length < 6 || newPassword !== confirmPassword) {
          setError("Enter the correct answer and a matching password of at least 6 characters.");
          return;
        }
        const result = await resetPasswordWithSecurityAnswer(email, answer, newPassword);
        if (result.error) { setError(result.error); return; }
        setMode("password");
        setRecoveryQuestion("");
        setError("Password changed. You can now log in.");
        return;
      }

      if (mode === "otp") {
        if (otpSent) {
          const result = await verifyEmailOtp(email, String(formData.get("otp") ?? ""));
          if (result.error) {
            setError(result.error);
            return;
          }
          router.push("/account");
          return;
        }

        const result = await requestEmailOtp(email);
        if (result.error) {
          setError(result.error);
          return;
        }
        setOtpSent(true);
        setError("A 6-digit verification code was sent to your email.");
        return;
      }

      if (normalizedEmail === ADMIN_EMAIL.toLowerCase()) {
        const adminResult = await signInAdmin(email, password);
        if (adminResult.error) {
          setError(adminResult.error);
          return;
        }
        router.push("/admin-access");
        return;
      }

      const result = await login(email, undefined, undefined, undefined, password);
      if (result.error) {
        setError(result.error.includes("Invalid login credentials") ? "No account found for this email or the password is incorrect." : result.error);
        return;
      }

      router.push("/account");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-md px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-[30px] border border-slate-200 bg-white p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Account</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">Login</h1>
          {isSubmitting ? <div className="mt-4 overflow-hidden rounded-full bg-slate-200"><div className="h-2.5 w-full animate-pulse rounded-full bg-gradient-to-r from-sky-500 via-sky-600 to-cyan-500" /></div> : null}
          <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
            <label className="block text-sm font-medium text-slate-700">
              Email
              <input name="email" required type="email" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-sky-300" placeholder="you@example.com" />
            </label>
            {mode === "password" ? <label className="block text-sm font-medium text-slate-700">
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
            </label> : mode === "otp" ? <label className="block text-sm font-medium text-slate-700">
              Verification code
              <input name="otp" inputMode="numeric" maxLength={6} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 tracking-[0.3em] outline-none focus:border-sky-300" placeholder={otpSent ? "Enter 6-digit code" : "Click send code first"} disabled={!otpSent} />
            </label> : <>
              {recoveryQuestion ? <p className="rounded-2xl bg-sky-50 p-4 text-sm text-sky-900">{recoveryQuestion}</p> : null}
              {recoveryQuestion ? <label className="block text-sm font-medium text-slate-700">Security answer<input name="securityAnswer" required type="text" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-sky-300" placeholder="Your answer" /></label> : null}
              {recoveryQuestion ? <label className="block text-sm font-medium text-slate-700">New password<input name="newPassword" required type="password" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-sky-300" placeholder="At least 6 characters" /></label> : null}
              {recoveryQuestion ? <label className="block text-sm font-medium text-slate-700">Confirm new password<input name="confirmRecoveryPassword" required type="password" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-sky-300" placeholder="Re-enter password" /></label> : null}
            </>}
            <button type="button" disabled={isSubmitting} onClick={handleSubmit} className="w-full rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-400">{isSubmitting ? "Please wait..." : mode === "otp" && !otpSent ? "Send OTP" : mode === "recovery" ? (recoveryQuestion ? "Change password" : "Find account") : "Continue"}</button>
            <button type="button" disabled={isSubmitting} onClick={() => { setMode(mode === "password" ? "otp" : "password"); setOtpSent(false); setRecoveryQuestion(""); setError(""); }} className="w-full rounded-full border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-60">{mode === "password" ? "Login with email OTP" : "Login with password"}</button>
            {mode === "password" ? <button type="button" disabled={isSubmitting} onClick={() => { setMode("recovery"); setError(""); setRecoveryQuestion(""); }} className="w-full text-sm font-medium text-sky-700 disabled:cursor-not-allowed disabled:opacity-60">Forgot password?</button> : null}
            {error ? <p className="text-sm text-rose-700" role="alert">{error}</p> : null}
          </form>
          <p className="mt-5 text-sm text-slate-600">Need an account? <Link href="/register" className="font-medium text-sky-700">Create one</Link></p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
