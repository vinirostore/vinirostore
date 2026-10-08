"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

export type ServiceRequestStatus = "open" | "in_progress" | "completed" | "cancelled";
export type ServiceRequestType = "service" | "amc";

type ServiceBooking = {
  id: string;
  customer_id: string | null;
  request_type: ServiceRequestType;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  city: string | null;
  address: string | null;
  qr_value: string;
  status: ServiceRequestStatus;
  completed_by_name: string | null;
  completed_at: string | null;
  created_at: string;
};

const statuses: Array<{ value: ServiceRequestStatus; label: string; description: string }> = [
  { value: "open", label: "New bookings", description: "Requests waiting for a technician." },
  { value: "in_progress", label: "In progress", description: "Service visits currently underway." },
  { value: "completed", label: "Completed", description: "Completed by scanning the customer's QR." },
  { value: "cancelled", label: "Cancelled", description: "Cancelled service bookings." },
];

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

export function AdminServiceRequestsPanel({ requestType, statusFilter }: { requestType: ServiceRequestType; statusFilter?: ServiceRequestStatus }) {
  const [requests, setRequests] = useState<ServiceBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const loadInProgress = useRef(false);

  useEffect(() => {
    let active = true;
    async function loadRequests() {
      if (document.visibilityState !== "visible") return;
      if (loadInProgress.current) return;
      loadInProgress.current = true;
      try {
        await performLoadRequests();
      } finally {
        loadInProgress.current = false;
      }
    }
    async function performLoadRequests() {
      if (!supabase) {
        if (active) {
          setError("Supabase is not configured.");
          setIsLoading(false);
        }
        return;
      }
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !data.session) {
        if (active) {
          setError("Admin session expired. Sign in again to load bookings.");
          setIsLoading(false);
        }
        return;
      }
      try {
        const response = await fetch("/api/admin/service-requests", {
          credentials: "include",
          cache: "no-store",
          headers: { Authorization: `Bearer ${data.session.access_token}` },
        });
        const result = await response.json() as { requests?: ServiceBooking[]; error?: string };
        if (!response.ok) throw new Error(result.error || "Could not load service bookings.");
        if (active) {
          setRequests(result.requests || []);
          setError("");
          setUpdatedAt(new Date().toLocaleTimeString());
        }
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : "Could not load service bookings.");
      } finally {
        if (active) setIsLoading(false);
      }
    }
    void loadRequests();
    let interval: number | null = null;
    const startPolling = () => {
      if (document.visibilityState === "visible" && interval === null) {
        interval = window.setInterval(() => void loadRequests(), 30000);
      }
    };
    const stopPolling = () => {
      if (interval !== null) {
        window.clearInterval(interval);
        interval = null;
      }
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        stopPolling();
        return;
      }
      void loadRequests();
      startPolling();
    };
    const handleFocus = () => {
      if (document.visibilityState === "visible") void loadRequests();
    };
    startPolling();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    return () => {
      active = false;
      stopPolling();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [refreshKey]);

  async function deleteRequest(request: ServiceBooking) {
    if (!window.confirm(`Permanently delete the booking for ${request.name} (${request.subject})?`)) return;
    if (!supabase) return;
    setError("");
    try {
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !data.session) throw new Error("Admin session expired. Sign in again.");
      const response = await fetch("/api/admin/service-requests", {
        method: "DELETE",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${data.session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: request.id }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "Could not delete booking.");
      setRequests((current) => current.filter((entry) => entry.id !== request.id));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Could not delete booking.");
    }
  }

  const relevantRequests = requests.filter((request) => request.request_type === requestType);
  const visibleRequests = statusFilter ? relevantRequests.filter((request) => request.status === statusFilter) : relevantRequests;
  const title = requestType === "amc" ? "AMC bookings" : "Service bookings";
  const basePath = requestType === "amc" ? "/admin/amc" : "/admin/services";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{title} · Supabase</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">{statusFilter ? statuses.find((item) => item.value === statusFilter)?.label : title}</h1>
          <p className="mt-2 text-xs text-slate-500">Refreshes every 30 seconds{updatedAt ? ` · updated ${updatedAt}` : ""}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/services/scan" className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white">Scan completion QR</Link>
          <button type="button" onClick={() => setRefreshKey((key) => key + 1)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700">Refresh</button>
        </div>
      </div>

      {error ? <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</p> : null}
      {isLoading ? <p className="py-8 text-center text-sm text-slate-500">Loading bookings...</p> : null}

      {!statusFilter ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statuses.map((item) => <Link key={item.value} href={`${basePath}/${item.value === "open" ? "open-tickets" : item.value === "in_progress" ? "in-progress" : item.value}`} className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-sky-300">
          <p className="text-xs uppercase tracking-[0.15em] text-slate-500">{item.label}</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{isLoading && !updatedAt ? "—" : relevantRequests.filter((request) => request.status === item.value).length}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
        </Link>)}
      </div> : <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4">
        <div><p className="text-xs uppercase tracking-[0.15em] text-slate-500">Bookings</p><p className="mt-1 text-2xl font-semibold text-slate-900">{visibleRequests.length}</p></div>
        <Link href={basePath} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700">All bookings</Link>
      </div>}

      {visibleRequests.length ? <div className="space-y-4">
        {visibleRequests.map((request) => <article key={request.id} className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="break-all font-mono text-xs text-slate-500">VINI-SVC-{request.id.toUpperCase()}</p>
              <h2 className="mt-1 text-lg font-semibold text-slate-900">{request.name} · {request.subject}</h2>
              <p className="mt-1 text-sm text-slate-600">{request.email} · {request.phone || "No phone"}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-700">{request.status.replace("_", " ")}</span>
              <button type="button" onClick={() => void deleteRequest(request)} className="rounded-lg border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700">Delete false booking</button>
            </div>
          </div>
          {request.status === "completed" && request.completed_by_name ? <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900">Service completed by <span className="font-semibold">{request.completed_by_name}</span>{request.completed_at ? ` · ${formatDate(request.completed_at)}` : ""}</p> : null}
          <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
            <div><p className="text-xs uppercase tracking-[0.14em] text-slate-500">Address</p><p className="mt-1 text-slate-700">{request.address || "Not provided"}, {request.city || ""}</p></div>
            <div><p className="text-xs uppercase tracking-[0.14em] text-slate-500">Booked</p><p className="mt-1 text-slate-700">{formatDate(request.created_at)}</p></div>
          </div>
          <p className="mt-4 whitespace-pre-wrap rounded-xl bg-slate-50 p-3 text-sm text-slate-700">{request.message}</p>
        </article>)}
      </div> : !isLoading ? <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">No {requestType === "amc" ? "AMC" : "service"} bookings in this status.</p> : null}
    </div>
  );
}