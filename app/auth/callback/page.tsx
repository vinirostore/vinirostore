"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Confirming your email...");

  useEffect(() => {
    let active = true;

    async function confirmSession() {
      if (!supabase) {
        setMessage("Authentication is not configured on this website.");
        return;
      }

      const searchParams = new URLSearchParams(window.location.search);
      const errorDescription = searchParams.get("error_description");
      if (errorDescription) {
        setMessage(decodeURIComponent(errorDescription.replace(/\+/g, " ")));
        return;
      }

      const code = searchParams.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setMessage(error.message);
          return;
        }
      }

      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) {
        setMessage(error?.message || "Your email could not be confirmed. Please try logging in again.");
        return;
      }

      if (active) router.replace("/account");
    }

    void confirmSession();
    return () => {
      active = false;
    };
  }, [router]);

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl items-center justify-center px-4 py-16 text-center">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Email confirmation</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">{message}</p>
      </div>
    </main>
  );
}
