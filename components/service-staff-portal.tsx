"use client";

import { FormEvent, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { useAuthState } from "@/components/auth-state";
import { ServiceQrScanner } from "@/components/service-qr-scanner";
import { supabase } from "@/lib/supabase";

type StaffAccess = {
  display_name: string;
  status: "pending" | "approved" | "rejected";
};

export function ServiceStaffPortal() {
  const { logout } = useAuthState();
  const [user, setUser] = useState<User | null>(null);
  const [staff, setStaff] = useState<StaffAccess | null>(null);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [displayName, setDisplayName] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [awaitingEmailCode, setAwaitingEmailCode] = useState(false);
  const [isLoading, setIsLoading] = useState(Boolean(supabase));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResendingCode, setIsResendingCode] = useState(false);
  const [error, setError] = useState(supabase ? "" : "Technician sign-in is unavailable because Supabase is not configured.");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!supabase) return;

    let active = true;
    void supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return;
      if (sessionError) setError(sessionError.message);
      const sessionUser = data.session?.user || null;
      setUser(sessionUser);
      setDisplayName(String(sessionUser?.user_metadata.name || ""));
      setIsLoading(false);
    }).catch((sessionError: unknown) => {
      if (active) {
        setError(sessionError instanceof Error ? sessionError.message : "Could not check your sign-in status.");
        setIsLoading(false);
      }
    });

    const subscription = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user?.user_metadata.name) setDisplayName(String(session.user.user_metadata.name));
      if (!session) setStaff(null);
    }).data.subscription;

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const userId = user?.id;
    if (!userId || !supabase) return;

    let active = true;
    void supabase.auth.getSession().then(async ({ data, error: sessionError }) => {
      if (sessionError) throw new Error(sessionError.message);
      const accessToken = data.session?.access_token;
      if (!accessToken) throw new Error("Your sign-in expired. Sign in again.");

      const response = await fetch("/api/service-staff", {
        cache: "no-store",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const result = await response.json() as { staff?: StaffAccess | null; error?: string };
      if (!response.ok) throw new Error(result.error || "Could not load technician access.");
      if (active) {
        setStaff(result.staff || null);
        if (result.staff?.display_name) setDisplayName(result.staff.display_name);
        setError("");
      }
    }).catch((loadError: unknown) => {
      if (active) setError(loadError instanceof Error ? loadError.message : "Could not load technician access.");
    }).finally(() => {
      if (active) setIsLoading(false);
    });

    return () => {
      active = false;
    };
  }, [user?.id]);

  async function requestAccess(accessToken: string, name: string) {
    const response = await fetch("/api/service-staff", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ displayName: name }),
    });
    const result = await response.json() as { staff?: StaffAccess; error?: string };
    if (!response.ok || !result.staff) throw new Error(result.error || "Could not submit your access request.");
    setStaff(result.staff);
    setMessage("Your technician access request has been sent to the administrator for approval.");
  }

  async function handleAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || isSubmitting) return;
    setError("");
    setMessage("");
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const password = String(formData.get("password") || "");
    const name = String(formData.get("name") || "").trim();

    try {
      if (mode === "register") {
        if (name.length < 2 || name.length > 100 || password.length < 6) {
          throw new Error("Enter your name and a password with at least 6 characters.");
        }
        const { data, error: signupError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name },
            emailRedirectTo: new URL("/auth/callback?next=%2Fservice-portal", window.location.origin).toString(),
          },
        });
        if (signupError) throw new Error(signupError.message);
        if (!data.session) {
          setPendingEmail(email);
          setVerificationCode("");
          setAwaitingEmailCode(true);
          setMessage("Your account was created. Enter the six-digit verification code sent to your email to continue. Do not open the email link.");
          return;
        }
        setUser(data.user);
        setDisplayName(name);
        await requestAccess(data.session.access_token, name);
      } else {
        const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
        if (loginError?.code === "email_not_confirmed" || loginError?.message.toLowerCase().includes("email not confirmed")) {
          setPendingEmail(email);
          setVerificationCode("");
          setAwaitingEmailCode(true);
          const { error: resendError } = await supabase.auth.resend({ type: "signup", email });
          if (resendError) throw new Error(`Your email is not confirmed and a new code could not be sent: ${resendError.message}`);
          setMessage("Your email is not confirmed. A new six-digit code was sent; enter it below.");
          return;
        }
        if (loginError) throw new Error(loginError.message);
        if (!data.session || !data.user) throw new Error("Sign-in did not create a session. Verify your email and try again.");
        setIsLoading(true);
        setUser(data.user);
        setDisplayName(String(data.user.user_metadata.name || ""));
      }
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Could not sign in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVerifySignupCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || isSubmitting) return;
    if (!/^\d{6}$/.test(verificationCode)) {
      setError("Enter the six-digit code from your email.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setMessage("");
    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email: pendingEmail,
        token: verificationCode,
        type: "signup",
      });
      if (verifyError) throw new Error(verifyError.message);
      if (!data.user || !data.session) throw new Error("Email verification did not create a session. Request a new code and try again.");
      setUser(data.user);
      setDisplayName(String(data.user.user_metadata.name || displayName));
      await requestAccess(data.session.access_token, String(data.user.user_metadata.name || displayName));
      setAwaitingEmailCode(false);
    } catch (verifyError) {
      setError(verifyError instanceof Error ? verifyError.message : "Could not verify your email code.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResendSignupCode() {
    if (!supabase || isResendingCode || !pendingEmail) return;
    setIsResendingCode(true);
    setError("");
    setMessage("");
    try {
      const { error: resendError } = await supabase.auth.resend({ type: "signup", email: pendingEmail });
      if (resendError) throw new Error(resendError.message);
      setMessage("A new six-digit verification code was sent to your email.");
    } catch (resendError) {
      setError(resendError instanceof Error ? resendError.message : "Could not resend the verification code.");
    } finally {
      setIsResendingCode(false);
    }
  }

  async function handleRequestAccess() {
    if (!supabase || !user || isSubmitting) return;
    setIsSubmitting(true);
    setError("");
    setMessage("");
    try {
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw new Error(sessionError.message);
      if (!data.session) throw new Error("Your sign-in expired. Sign in again.");
      await requestAccess(data.session.access_token, displayName.trim());
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not submit your access request.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleLogout() {
    setError("");
    try {
      if (!supabase) throw new Error("Supabase is not configured.");
      const { error: logoutError } = await supabase.auth.signOut();
      if (logoutError) throw new Error(logoutError.message);
      logout();
      setUser(null);
      setStaff(null);
      setMessage("");
    } catch (logoutError) {
      setError(logoutError instanceof Error ? logoutError.message : "Could not sign out.");
    }
  }

  return (
    <main className="mx-auto min-h-[60vh] max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Service technician portal</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Complete a service visit</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">Technician accounts must be approved before they can scan customer booking QR codes.</p>
      </div>

      {isLoading ? <p className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">Checking your technician access...</p> : null}

      {!isLoading && !user ? <section className="max-w-md rounded-2xl border border-slate-200 bg-white p-6">
        {awaitingEmailCode ? <>
          <h2 className="text-xl font-semibold text-slate-900">Verify your email</h2>
          <p className="mt-2 text-sm text-slate-600">Enter the six-digit code sent to <span className="font-medium text-slate-900">{pendingEmail}</span>.</p>
          <form onSubmit={handleVerifySignupCode} className="mt-5 space-y-4">
            <label className="block text-sm font-medium text-slate-700">Email verification code<input required type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={verificationCode} onChange={(event) => setVerificationCode(event.target.value.replace(/\D/g, "").slice(0, 6))} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 tracking-[0.3em]" placeholder="6-digit code" /></label>
            {error ? <p role="alert" className="text-sm text-rose-700">{error}</p> : null}
            {message ? <p role="status" className="text-sm text-emerald-700">{message}</p> : null}
            <button type="submit" disabled={isSubmitting} className="service-primary-button w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">{isSubmitting ? "Verifying..." : "Verify email and request access"}</button>
            <button type="button" disabled={isResendingCode || isSubmitting} onClick={() => void handleResendSignupCode()} className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 disabled:opacity-60">{isResendingCode ? "Sending..." : "Resend code"}</button>
          </form>
          <button type="button" onClick={() => { setAwaitingEmailCode(false); setMode("login"); setError(""); setMessage(""); }} className="mt-4 text-sm font-medium text-sky-700 underline">Back to sign in</button>
        </> : <>
          <h2 className="text-xl font-semibold text-slate-900">{mode === "register" ? "Create technician account" : "Technician sign in"}</h2>
          <p className="mt-2 text-sm text-slate-600">{mode === "register" ? "Create an account and verify your email with a six-digit code. Scanning stays locked until an administrator approves you." : "Sign in to check your technician access or use the account created for you."}</p>
          <form onSubmit={handleAuth} className="mt-5 space-y-4">
            {mode === "register" ? <label className="block text-sm font-medium text-slate-700">Your name<input name="name" required minLength={2} maxLength={100} autoComplete="name" className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5" /></label> : null}
            <label className="block text-sm font-medium text-slate-700">Email<input name="email" required type="email" autoComplete="email" className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5" /></label>
            <label className="block text-sm font-medium text-slate-700">Password<input name="password" required type="password" minLength={6} autoComplete={mode === "register" ? "new-password" : "current-password"} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5" /></label>
            {error ? <p role="alert" className="text-sm text-rose-700">{error}</p> : null}
            {message ? <p role="status" className="text-sm text-emerald-700">{message}</p> : null}
            <button type="submit" disabled={isSubmitting} className="service-primary-button w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">{isSubmitting ? "Please wait..." : mode === "register" ? "Create account and request approval" : "Sign in"}</button>
          </form>
          <button type="button" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); setMessage(""); }} className="mt-4 text-sm font-medium text-sky-700 underline">{mode === "login" ? "Need an account? Create one" : "Already registered? Sign in"}</button>
        </>}
      </section> : null}

      {!isLoading && user && !staff ? <section className="max-w-xl rounded-2xl border border-amber-200 bg-amber-50 p-6">
        <h2 className="text-xl font-semibold text-slate-900">Request technician access</h2>
        <p className="mt-2 text-sm leading-6 text-slate-700">You are signed in as {user.email}. Submit your name for admin approval. The QR scanner will stay unavailable until you are approved.</p>
        <label className="mt-4 block text-sm font-medium text-slate-700">Name<input value={displayName} onChange={(event) => setDisplayName(event.target.value)} required minLength={2} maxLength={100} className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5" /></label>
        {error ? <p role="alert" className="mt-3 text-sm text-rose-700">{error}</p> : null}
        {message ? <p role="status" className="mt-3 text-sm text-emerald-700">{message}</p> : null}
        <button type="button" onClick={() => void handleRequestAccess()} disabled={isSubmitting} className="service-primary-button mt-4 rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">{isSubmitting ? "Sending request..." : "Request access"}</button>
        <button type="button" onClick={() => void handleLogout()} className="ml-3 rounded-lg border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700">Sign out</button>
      </section> : null}

      {!isLoading && user && staff?.status === "pending" ? <section className="max-w-xl rounded-2xl border border-amber-200 bg-amber-50 p-6">
        <h2 className="text-xl font-semibold text-slate-900">Approval pending</h2>
        <p className="mt-2 text-sm leading-6 text-slate-700">Technician access for <span className="font-semibold">{staff.display_name}</span> is waiting for administrator approval. QR scanning is not available yet.</p>
        <button type="button" onClick={() => void handleLogout()} className="mt-4 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700">Sign out</button>
      </section> : null}

      {!isLoading && user && staff?.status === "rejected" ? <section className="max-w-xl rounded-2xl border border-rose-200 bg-rose-50 p-6">
        <h2 className="text-xl font-semibold text-slate-900">Access not approved</h2>
        <p className="mt-2 text-sm leading-6 text-slate-700">Technician access for {staff.display_name} was not approved. Please contact the administrator if you believe this is an error.</p>
        <button type="button" onClick={() => void handleLogout()} className="mt-4 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700">Sign out</button>
      </section> : null}

      {!isLoading && user && staff?.status === "approved" ? <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm text-emerald-900">Signed in as <span className="font-semibold">{staff.display_name}</span> · access approved</p>
          <button type="button" onClick={() => void handleLogout()} className="rounded-lg border border-emerald-300 bg-white px-3 py-2 text-sm font-semibold text-emerald-900">Sign out</button>
        </div>
        {error ? <p role="alert" className="text-sm text-rose-700">{error}</p> : null}
        <ServiceQrScanner mode="technician" />
      </section> : null}
    </main>
  );
}
