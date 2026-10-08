"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { ProductDetailExperience, type ProductDetailRecommendation } from "@/components/product-detail-experience";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  type Brand,
  type Product,
  type ProductModel,
  type ProductModelSummary,
  getBrandList,
  getBrandListFromStore,
  getModelList,
  getModelByIdFromStore,
  getModelSummaryList,
  getModelSummaryListFromStore,
  getProductsFromStoreSync,
  getProductsFromStore,
} from "@/lib/catalog";

type ModelColorOption = { name: string; image: string; price?: number; isPrimary?: boolean };

function normalizeRouteSlug(value: string) {
  let decodedValue = value;
  try {
    decodedValue = decodeURIComponent(value);
  } catch {
    // Keep the original route value if it contains malformed encoding.
  }
  return decodedValue.trim().toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function formatModelSlug(value: string) {
  try {
    return decodeURIComponent(value).replace(/[-_]+/g, " ");
  } catch {
    return value.replace(/[-_]+/g, " ");
  }
}

function findBrandForRoute(brands: Brand[], brandSlug: string) {
  const normalizedBrandSlug = normalizeRouteSlug(brandSlug);
  return brands.find((item) =>
    item.id === brandSlug
    || normalizeRouteSlug(item.id) === normalizedBrandSlug
    || item.slug === brandSlug
    || normalizeRouteSlug(item.slug) === normalizedBrandSlug
    || normalizeRouteSlug(item.name) === normalizedBrandSlug,
  ) ?? null;
}

function findModelForRoute(models: ProductModelSummary[], modelSlug: string) {
  const normalizedModelSlug = normalizeRouteSlug(modelSlug);
  return models.find((item) =>
    item.id === modelSlug
    || normalizeRouteSlug(item.id) === normalizedModelSlug
    || item.slug === modelSlug
    || normalizeRouteSlug(item.slug) === normalizedModelSlug
    || normalizeRouteSlug(item.name) === normalizedModelSlug,
  ) ?? null;
}

export default function BrandModelDetailPage() {
  const params = useParams<{ brand: string; model: string }>();
  const brandSlug = params?.brand ?? "";
  const modelSlug = params?.model ?? "";
  const [brand, setBrand] = useState<Brand | null>(null);
  const [model, setModel] = useState<ProductModel | null>(null);
  const [models, setModels] = useState<ProductModelSummary[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [hasLoadedCatalog, setHasLoadedCatalog] = useState(false);
  const [catalogError, setCatalogError] = useState("");
  const loadingModelName = model?.name
    ?? getModelList().find((item) => normalizeRouteSlug(item.slug) === normalizeRouteSlug(modelSlug))?.name
    ?? (formatModelSlug(modelSlug) || "this model");

  useEffect(() => {
    let active = true;
    const syncCatalog = async () => {
      try {
        const [nextBrands, allModels, nextProducts] = await Promise.all([
          getBrandListFromStore(),
          getModelSummaryListFromStore(),
          getProductsFromStore(),
        ]);
        const nextBrand = findBrandForRoute(nextBrands, brandSlug);
        const nextModels = nextBrand ? allModels.filter((item) => item.brandId === nextBrand.id) : [];
        const modelSummary = findModelForRoute(nextModels, modelSlug);
        const selectedModel = modelSummary ? await getModelByIdFromStore(modelSummary.id) : undefined;
        if (!active) return;
        applyCatalog(nextBrands, allModels, nextProducts, selectedModel);
        setCatalogError("");
      } catch (error) {
        if (!active) return;
        console.error("Could not refresh the model catalog:", error);
        setCatalogError(error instanceof Error ? error.message : "Could not refresh the model catalog.");
      }
    };

    const applyCatalog = (nextBrands: Brand[], allModels: ProductModelSummary[], nextProducts: Product[], selectedModel?: ProductModel, isFinal = false) => {
      if (!active) return;
      const nextBrand = findBrandForRoute(nextBrands, brandSlug);
      const nextModels = nextBrand ? allModels.filter((item) => item.brandId === nextBrand.id) : [];
      const modelSummary = findModelForRoute(nextModels, modelSlug);
      const nextModel = selectedModel && selectedModel.id === modelSummary?.id ? selectedModel : null;

      setBrand(nextBrand);
      setModel(nextModel);
      setModels(nextModels);
      setProducts(nextProducts);
      setSelectedColorIndex(0);
      if (nextBrand && nextModel || isFinal) setHasLoadedCatalog(true);
    };

    const initialBrands = getBrandList();
    const initialModels = getModelList();
    const initialBrand = findBrandForRoute(initialBrands, brandSlug);
    const initialBrandModels = initialBrand ? initialModels.filter((item) => item.brandId === initialBrand.id) : [];
    const initialModelSummary = findModelForRoute(initialBrandModels, modelSlug);
    const initialModel = initialModels.find((item) => item.id === initialModelSummary?.id);
    applyCatalog(
      initialBrands,
      getModelSummaryList(),
      getProductsFromStoreSync(),
      initialModel,
    );
    void syncCatalog().then(() => setHasLoadedCatalog(true));
    const handleCatalogChange = () => { void syncCatalog(); };
    window.addEventListener("vini-catalog-updated", handleCatalogChange);
    return () => {
      active = false;
      window.removeEventListener("vini-catalog-updated", handleCatalogChange);
    };
  }, [brandSlug, modelSlug]);

  const modelProduct = useMemo(() => {
    if (!brand || !model) return null;
    return products.find((product) => product.brandId === brand.id && (product.modelSlug === model.slug || product.model === model.name))
      ?? products.find((product) => product.brandId === brand.id && product.slug.includes(modelSlug))
      ?? products.find((product) => product.brand === brand.name && product.slug.includes(modelSlug))
      ?? null;
  }, [brand, model, modelSlug, products]);

  if (!hasLoadedCatalog) {
    return <><SiteHeader compact /><main className="product-detail-loading" role="status" aria-live="polite">Loading model: {loadingModelName}…</main></>;
  }

  if (!brand || !model) {
    return (
      <>
        <SiteHeader compact />
        <main className="product-detail-not-found">
          <p>MODEL UNAVAILABLE</p>
          <h1>This model is not available yet.</h1>
          <span>The brand or model may have been added recently and is still syncing to the storefront.</span>
          <div><Link href="/brands">Back to brands</Link><Link href="/products">Browse products</Link></div>
        </main>
        <SiteFooter />
      </>
    );
  }

  const basePrice = modelProduct?.price ?? model.price ?? 0;
  const colorOptions: ModelColorOption[] = model.colorName || model.colors?.length ? [
    { name: model.colorName || "Standard", image: model.image, price: basePrice, isPrimary: true },
    ...(model.colors ?? []),
  ] : [];
  const selectedColor = colorOptions[selectedColorIndex];
  const baseCartProduct: Product = modelProduct ?? {
    id: `model:${model.id}`,
    name: model.name,
    slug: `model-${model.slug}`,
    category: "ro",
    brand: brand.name,
    brandId: brand.id,
    model: model.name,
    modelId: model.id,
    modelSlug: model.slug,
    price: model.price ?? 0,
    inventory: model.inventory ?? 0,
    image: model.image,
    gallery: model.gallery?.length ? model.gallery : [model.image],
    description: model.description,
    shortDescription: model.description,
    sku: `MODEL-${model.id}`,
    stockStatus: model.inventory && model.inventory > 0
      ? model.inventory <= 10 ? "low-stock" : "in-stock"
      : "out-of-stock",
    status: model.status,
  };
  const selectedColorSlug = selectedColor && !selectedColor.isPrimary
    ? selectedColor.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
    : "";
  const modelCartProduct: Product = selectedColor ? {
    ...baseCartProduct,
    name: selectedColor.isPrimary ? baseCartProduct.name : `${baseCartProduct.name} - ${selectedColor.name}`,
    slug: selectedColor.isPrimary ? baseCartProduct.slug : `${baseCartProduct.slug}-${selectedColorSlug}`,
    selectedColorName: model.colorName ? selectedColor.name : undefined,
    price: selectedColor.price ?? baseCartProduct.price,
    compareAtPrice: selectedColor.isPrimary ? baseCartProduct.compareAtPrice : undefined,
    image: selectedColor.image || baseCartProduct.image,
    gallery: [...new Set([selectedColor.image || baseCartProduct.image, ...baseCartProduct.gallery])],
    sku: selectedColor.isPrimary ? baseCartProduct.sku : `${baseCartProduct.sku}-${selectedColorSlug.toUpperCase()}`,
  } : baseCartProduct;
  const recommendations: ProductDetailRecommendation[] = models
    .filter((item) => item.id !== model.id)
    .map((item) => {
      const product = products.find((entry) => entry.brandId === brand.id && (entry.modelSlug === item.slug || entry.model === item.name));
      return {
        id: item.id,
        name: item.name,
        brand: brand.name,
        href: `/brands/${encodeURIComponent(brand.slug)}/${encodeURIComponent(item.slug)}`,
        image: item.image,
        price: product?.price ?? item.price,
        description: item.description,
      };
    });

  return (
    <>
      <SiteHeader compact />
      <ProductDetailExperience
        product={modelCartProduct}
        title={model.name}
        brandName={brand.name}
        brandHref={`/brands/${encodeURIComponent(brand.slug)}`}
        subtitle="Premium RO Water Purifier"
        catalogError={catalogError}
        recommendations={recommendations}
        priceAvailable={model.status === "active" && modelCartProduct.price > 0}
        colorOptions={colorOptions}
        selectedColorIndex={selectedColorIndex}
        onColorSelect={setSelectedColorIndex}
        modelId={model.id}
      />
      <SiteFooter />
    </>
  );
}
