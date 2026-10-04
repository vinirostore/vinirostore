"use client";

import { useParams } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { getModelList } from "@/lib/catalog";

function modelNameFromSlug(value: string) {
  try {
    return decodeURIComponent(value).replace(/[-_]+/g, " ");
  } catch {
    return value.replace(/[-_]+/g, " ");
  }
}

export default function LoadingModelPage() {
  const params = useParams<{ model: string }>();
  const modelSlug = params?.model ?? "";
  const modelName = getModelList().find((model) => model.slug.toLowerCase() === modelSlug.toLowerCase())?.name
    ?? modelNameFromSlug(modelSlug)
    ?? "your selected model";

  return (
    <>
      <SiteHeader compact />
      <main className="product-detail-loading" role="status" aria-live="polite">
        <span className="product-loading-spinner" aria-hidden="true" />
        <span>Loading model: {modelName || "your selected model"}…</span>
      </main>
    </>
  );
}
