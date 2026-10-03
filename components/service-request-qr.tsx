"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export function ServiceRequestQr({ value }: { value: string }) {
  const [qrImage, setQrImage] = useState("");

  useEffect(() => {
    let active = true;
    void QRCode.toDataURL(value, { width: 192, margin: 1, errorCorrectionLevel: "Q" })
      .then((image) => { if (active) setQrImage(image); })
      .catch(() => { if (active) setQrImage(""); });
    return () => { active = false; };
  }, [value]);

  return qrImage ? <img src={qrImage} alt="Service completion QR code" className="h-48 w-48 rounded-lg border border-slate-200 bg-white p-2" /> : <div className="flex h-48 w-48 items-center justify-center rounded-lg border border-slate-200 bg-white text-xs text-slate-500">Preparing QR code...</div>;
}