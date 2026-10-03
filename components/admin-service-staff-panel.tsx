"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type TechnicianAccount = {
  user_id: string;
  email: string;
  display_name: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

export function AdminServiceStaffPanel() {
  const [staff, setStaff] = useState<TechnicianAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState("");
  const [error, setError] = useState("");

  const loadStaff = useCallback(async () => {
    if (!supabase) {
      setError("Supabase is not configured.");
      setIsLoading(false);
      return;
    }
    try {
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !data.session) throw new Error("Admin session expired. Sign in again.");
      const response = await fetch("/api/admin/service-staff", {
        cache: "no-store",
        credentials: "include",
        headers: { Authorization: `Bearer ${data.session.access_token}` },
      });
      const result = await response.json() as { staff?: TechnicianAccount[]; error?: string };
      if (!response.ok) throw new Error(result.error || "Could not load technician accounts.");
      setStaff(result.staff || []);
      setError("");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load technician accounts.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void loadStaff(), 0);
    const interval = window.setInterval(() => void loadStaff(), 30000);
    return () => {
      window.clearTimeout(initialLoad);
      window.clearInterval(interval);
    };
  }, [loadStaff]);

  async function reviewTechnician(technician: TechnicianAccount, status: "approved" | "rejected") {
    if (!supabase || isUpdating) return;
    setIsUpdating(technician.user_id);
    setError("");
    try {
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !data.session) throw new Error("Admin session expired. Sign in again.");
      const response = await fetch("/api/admin/service-staff", {
        method: "PATCH",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${data.session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: technician.user_id, status }),
      });
      const result = await response.json() as { staff?: TechnicianAccount; error?: string };
      if (!response.ok || !result.staff) throw new Error(result.error || "Could not update technician access.");
      setStaff((current) => current.map((entry) => entry.user_id === result.staff!.user_id ? result.staff! : entry));
    } catch (reviewError) {
      setError(reviewError instanceof Error ? reviewError.message : "Could not update technician access.");
    } finally {
      setIsUpdating("");
    }
  }

  const pending = staff.filter((technician) => technician.status === "pending");

  return (
    <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Technician accounts</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900">Access requests</h2>
          <p className="mt-1 text-sm text-slate-600">{pending.length} pending · approve only your service technicians</p>
        </div>
        <button type="button" onClick={() => void loadStaff()} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700">Refresh</button>
      </div>
      {error ? <p role="alert" className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-800">{error}</p> : null}
      {isLoading ? <p className="mt-4 text-sm text-slate-500">Loading technician accounts...</p> : null}
      {!isLoading && !pending.length ? <p className="mt-4 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">There are no pending technician access requests.</p> : null}
      {pending.length ? <div className="mt-4 divide-y divide-slate-200">
        {pending.map((technician) => <div key={technician.user_id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-slate-900">{technician.display_name}</p>
            <p className="mt-1 text-sm text-slate-600">{technician.email}</p>
            <p className="mt-1 text-xs text-slate-500">Requested {formatDate(technician.created_at)}</p>
          </div>
          <div className="flex gap-2">
            <button type="button" disabled={Boolean(isUpdating)} onClick={() => void reviewTechnician(technician, "approved")} className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">{isUpdating === technician.user_id ? "Saving..." : "Approve"}</button>
            <button type="button" disabled={Boolean(isUpdating)} onClick={() => void reviewTechnician(technician, "rejected")} className="rounded-lg border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700 disabled:opacity-60">Reject</button>
          </div>
        </div>)}
      </div> : null}
    </section>
  );
}
