"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

type ScanResult = { message: string; success: boolean };

export function ServiceQrScanner({ mode = "admin" }: { mode?: "admin" | "technician" }) {
  const scannerRef = useRef<import("html5-qrcode").Html5Qrcode | null>(null);
  const processingRef = useRef(false);
  const [isReady, setIsReady] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);

  async function completeRequest(qrValue: string) {
    setResult(null);
    try {
      if (!supabase) throw new Error("Supabase is not configured.");
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !data.session) throw new Error("Your session expired. Sign in again.");

      const response = await fetch(mode === "technician" ? "/api/service-staff/complete" : "/api/admin/service-requests", {
        method: mode === "technician" ? "POST" : "PATCH",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${data.session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ qrValue: qrValue.trim() }),
      });
      const payload = await response.json() as { request?: { subject?: string; completed_by_name?: string | null }; alreadyCompleted?: boolean; error?: string };
      if (!response.ok) throw new Error(payload.error || "Could not complete this booking.");
      setResult({
        message: payload.alreadyCompleted
          ? `This booking was already completed${payload.request?.completed_by_name ? ` by ${payload.request.completed_by_name}` : ""}.`
          : `${payload.request?.subject || "Service"} marked completed${payload.request?.completed_by_name ? ` by ${payload.request.completed_by_name}` : ""}.`,
        success: true,
      });
    } catch (scanError) {
      setResult({ message: scanError instanceof Error ? scanError.message : "Could not complete this booking.", success: false });
    }
  }

  useEffect(() => {
    let active = true;
    void import("html5-qrcode").then(({ Html5Qrcode }) => {
      if (!active) return;
      const scanner = new Html5Qrcode("service-qr-reader", { verbose: false });
      scannerRef.current = scanner;
      setIsReady(true);
    }).catch(() => {
      if (active) setResult({ message: "Could not load the QR scanner. Reload the page and allow camera access.", success: false });
    });

    return () => {
      active = false;
      const scanner = scannerRef.current;
      scannerRef.current = null;
      if (scanner) {
        void (async () => {
          if (scanner.isScanning) await scanner.stop();
          scanner.clear();
        })().catch(() => undefined);
      }
    };
  }, []);

  async function startScanner() {
    const scanner = scannerRef.current;
    if (!scanner || isStarting || isScanning) return;
    setIsStarting(true);
    setResult(null);
    processingRef.current = false;

    try {
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decodedText) => {
          if (processingRef.current) return;
          processingRef.current = true;
          void completeRequest(decodedText);
        },
        () => undefined,
      );
      setIsScanning(true);
    } catch (cameraError) {
      const errorName = cameraError instanceof Error ? cameraError.name : "";
      const message = errorName === "NotAllowedError" || errorName === "PermissionDeniedError"
        ? "Chrome has blocked camera access for this site. Open the site controls beside the address bar, allow Camera for this exact website, then tap Start camera again."
        : errorName === "NotFoundError" || errorName === "DevicesNotFoundError"
          ? "No camera was found on this device."
          : errorName === "NotReadableError" || errorName === "TrackStartError"
            ? "The camera is already in use by another app. Close that app and retry."
            : cameraError instanceof Error ? cameraError.message : "Could not start the camera. Check this site’s camera permission and retry.";
      setResult({ message, success: false });
    } finally {
      setIsStarting(false);
    }
  }

  function scanNext() {
    processingRef.current = false;
    setResult(null);
  }

  async function stopScanner() {
    const scanner = scannerRef.current;
    if (!scanner?.isScanning) return;
    try {
      await scanner.stop();
      scanner.clear();
      setIsScanning(false);
      processingRef.current = false;
      setResult(null);
    } catch (stopError) {
      setResult({ message: stopError instanceof Error ? stopError.message : "Could not stop the camera.", success: false });
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{mode === "technician" ? "Service technician portal" : "Admin technician tool"}</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Complete service by QR</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">Scan the customer&apos;s QR only after the service visit or AMC work is finished. Scanning updates the booking to completed.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
        <div id="service-qr-reader" className="mx-auto w-full max-w-lg" />
        {!isReady ? <p className="mt-3 text-center text-xs text-slate-500">Preparing scanner...</p> : null}
        {isReady && !isScanning ? <button type="button" onClick={() => void startScanner()} disabled={isStarting} className="service-primary-button mt-4 w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-60">{isStarting ? "Opening camera..." : "Start camera"}</button> : null}
        {isScanning ? <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><p className="text-sm font-medium text-emerald-800">Camera ready. Point it at the customer&apos;s QR.</p><button type="button" onClick={() => void stopScanner()} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700">Stop camera</button></div> : null}
      </div>

      {result ? <div role={result.success ? "status" : "alert"} className={`rounded-xl border p-4 ${result.success ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-rose-200 bg-rose-50 text-rose-800"}`}>
        <p className="font-semibold">{result.message}</p>
        <button type="button" onClick={scanNext} className="mt-3 rounded-lg border border-current px-3 py-2 text-sm font-medium">Scan next QR</button>
      </div> : null}
    </div>
  );
}