"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { ProductActions } from "@/components/product-actions";
import { Brand, Product, ProductModel, getBrandListFromStore, getModelListFromStore, getProductsFromStore } from "@/lib/catalog";

export default function BrandModelDetailPage() {
  const params = useParams<{ brand: string; model: string }>();
  const brandSlug = params?.brand ?? "";
  const modelSlug = params?.model ?? "";

  const [brand, setBrand] = useState<Brand | null>(null);
  const [model, setModel] = useState<ProductModel | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [hasLoadedCatalog, setHasLoadedCatalog] = useState(false);

  useEffect(() => {
    const syncCatalog = async () => {
      const [nextBrands, allModels, nextProducts] = await Promise.all([getBrandListFromStore(), getModelListFromStore(), getProductsFromStore()]);
      const nextBrand = nextBrands.find((item) => item.slug === brandSlug) ?? null;
      const nextModels = nextBrand ? allModels.filter((item) => item.brandId === nextBrand.id) : [];
      const nextModel = nextModels.find((item) => item.slug === modelSlug) ?? null;

      setBrand(nextBrand);
      setModel(nextModel);
      setProducts(nextProducts);
      setHasLoadedCatalog(true);
    };

    void syncCatalog();
    const handleCatalogChange = () => { void syncCatalog(); };
    window.addEventListener("vini-catalog-updated", handleCatalogChange);
    window.addEventListener("storage", handleCatalogChange);

    return () => {
      window.removeEventListener("vini-catalog-updated", handleCatalogChange);
      window.removeEventListener("storage", handleCatalogChange);
    };
  }, [brandSlug, modelSlug]);

  const modelProducts = useMemo(() => {
    if (!brand || !model) return [];
    return products.filter((product) => product.brandId === brand.id && (product.modelSlug === model.slug || product.model === model.name));
  }, [brand, model, products]);

  const mainProduct = useMemo(() => {
    if (!brand || !model) return null;
    return modelProducts[0] ?? products.find((product) => product.brandId === brand.id && product.slug.includes(modelSlug)) ?? products.find((product) => product.brand === brand.name && product.slug.includes(modelSlug)) ?? null;
  }, [brand, model, modelProducts, modelSlug, products]);

  if (!hasLoadedCatalog) {
    return <main className="mx-auto max-w-4xl px-4 py-16 text-center text-sm text-slate-500">Loading model...</main>;
  }

  if (!brand || !model) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Model unavailable</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">This model is not available yet.</h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">The brand or model may have been added recently and is still syncing to the storefront.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/brands" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700">Back to brands</Link>
            <Link href="/products" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white">Browse products</Link>
          </div>
        </div>
      </main>
    );
  }

  const selectedColor = model.colors?.[selectedColorIndex];
  const heroImage = selectedColor?.image ?? mainProduct?.image ?? model.image;
  const galleryImages = (mainProduct?.gallery?.length ? mainProduct.gallery : model.gallery?.length ? model.gallery : [model.image]).filter(Boolean);
  const displayTitle = mainProduct?.name ?? model.name;
  const displayDescription = mainProduct?.description ?? model.description;

  if (!mainProduct) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{brand.name} / {model.name}</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.18fr_0.82fr]">
          <div>
            <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white p-3 shadow-sm">
              <img src={heroImage} alt={model.name} className="h-[520px] w-full rounded-[24px] object-cover" />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {galleryImages.map((image) => (
                <div key={image} className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-2">
                  <img src={image} alt={model.name} className="h-28 w-full rounded-xl object-cover" />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">{displayTitle}</h1>
              <p className="mt-3 text-sm leading-7 text-slate-600">{displayDescription}</p>
              {model.colors?.length ? <div className="mt-5"><p className="text-sm font-medium text-slate-900">Colour</p><div className="mt-3 flex flex-wrap gap-2">{model.colors.map((color, index) => <button key={`${color.name}-${index}`} type="button" onClick={() => setSelectedColorIndex(index)} className={`flex items-center gap-2 rounded-full border px-3 py-2 text-sm ${selectedColorIndex === index ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-700"}`}><img src={color.image} alt="" className="h-6 w-6 rounded-full object-cover" />{color.name}</button>)}</div></div> : null}
              {model.price !== undefined ? <p className="mt-5 text-3xl font-semibold text-slate-900">₹{model.price.toLocaleString("en-IN")}</p> : null}
            </div>

            <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Model details</p>
              <ul className="mt-4 space-y-3 text-sm text-slate-700">
                <li><span className="font-medium text-slate-900">Brand:</span> {brand.name}</li>
                <li><span className="font-medium text-slate-900">Model:</span> {model.name}</li>
                <li><span className="font-medium text-slate-900">Status:</span> This model is available for selection but no product variant has been created yet.</li>
              </ul>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/products" className="rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white">Shop available products</Link>
              <Link href={`/brands/${brand.slug}`} className="rounded-full border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700">View all models</Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{brand.name} / {model.name}</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900 sm:text-4xl">{displayTitle}</h1>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1.18fr_0.82fr]">
        <div>
          <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white p-3 shadow-sm">
            <img src={heroImage} alt={displayTitle} className="h-[520px] w-full rounded-[24px] object-cover" />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {galleryImages.map((image) => (
              <div key={image} className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-2">
                <img src={image} alt={displayTitle} className="h-28 w-full rounded-xl object-cover" />
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm leading-7 text-slate-600">{displayDescription}</p>
          {model.colors?.length ? <div className="mt-5"><p className="text-sm font-medium text-slate-900">Colour</p><div className="mt-3 flex flex-wrap gap-2">{model.colors.map((color, index) => <button key={`${color.name}-${index}`} type="button" onClick={() => setSelectedColorIndex(index)} className={`flex items-center gap-2 rounded-full border px-3 py-2 text-sm ${selectedColorIndex === index ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-700"}`}><img src={color.image} alt="" className="h-6 w-6 rounded-full object-cover" />{color.name}</button>)}</div></div> : null}
          <div className="mt-6 flex items-center gap-3">
            <span className="text-3xl font-semibold text-slate-900">₹{mainProduct.price.toLocaleString("en-IN")}</span>
            {mainProduct.compareAtPrice ? <span className="text-lg text-slate-400 line-through">₹{mainProduct.compareAtPrice.toLocaleString("en-IN")}</span> : null}
          </div>

          <div className="mt-6">
            <ProductActions product={mainProduct} />
          </div>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700">
            <p className="font-medium text-slate-900">Model details</p>
            <ul className="mt-3 space-y-2">
              <li>Brand: {brand.name}</li>
              <li>Model: {model.name}</li>
              <li>Availability: {mainProduct.stockStatus === "in-stock" ? "In stock" : "Limited stock"}</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-semibold text-slate-900">Other {brand.name} options</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {modelProducts.filter((item) => item.id !== mainProduct.id).map((product) => (
            <Link key={product.id} href={`/products/${product.slug}`} className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
              <img src={product.image} alt={product.name} className="h-48 w-full rounded-2xl object-cover" />
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-slate-900">{product.name}</h3>
                <p className="mt-2 text-sm text-slate-600">{product.shortDescription}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
