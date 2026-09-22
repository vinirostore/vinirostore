"use client";

import { useRouter } from "next/navigation";

export function BrandBackButton() {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/brands");
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
    >
      Back to brands
    </button>
  );
}
