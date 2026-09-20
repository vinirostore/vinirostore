"use client";

import { useEffect, useMemo, useState } from "react";
import { Brand, Product, getBrandList, getProductsFromStoreSync, saveProductsToStore, upsertProduct } from "@/lib/catalog";

const defaultForm = {
  id: "",
  name: "",
  slug: "",
  brandId: "",
  brand: "",
  category: "ro",
  model: "",
  modelId: "",
  modelSlug: "",
  price: 0,
  compareAtPrice: 0,
  inventory: 1,
  image: "/RO1.jpeg",
  gallery: "/RO1.jpeg\n/RO2.jpeg\n/RO3.jpeg",
  shortDescription: "",
  description: "",
  stockStatus: "in-stock" as Product["stockStatus"],
  status: "active" as Product["status"],
  sku: "",
  badge: "",
  featured: false,
  technology: "",
  capacity: "",
  warranty: "",
  features: "",
  specifications: "{}",
};

export default function AdminProductsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    setBrands(getBrandList());
    setProducts(getProductsFromStoreSync());
  }, []);

  const sortedProducts = useMemo(() => [...products].sort((a, b) => a.name.localeCompare(b.name)), [products]);

  function parseFeatures(raw: string): string[] {
    return raw.split(/\n|,/).map((item) => item.trim()).filter(Boolean);
  }

  function parseSpecifications(raw: string): Record<string, string> {
    if (!raw.trim()) return {};

    try {
      const parsed = JSON.parse(raw);
      return typeof parsed === "object" && parsed ? parsed as Record<string, string> : {};
    } catch {
      const entries: Record<string, string> = {};
      raw.split(/\n/).forEach((line) => {
        const [key, ...rest] = line.split(":");
        if (key && rest.length) {
          entries[key.trim()] = rest.join(":").trim();
        }
      });
      return entries;
    }
  }

  function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "/RO1.jpeg";
      setForm((current) => ({ ...current, image: result, gallery: current.gallery ? `${result}\n${current.gallery}` : result }));
    };
    reader.readAsDataURL(file);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.brandId) return;

    const selectedBrand = brands.find((brand) => brand.id === form.brandId);
    const galleryImages = form.gallery.split(/\n|,/).map((item) => item.trim()).filter(Boolean);
    const next = upsertProduct({
      id: form.id || undefined,
      name: form.name,
      slug: form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      brand: selectedBrand?.name ?? form.brand,
      brandId: form.brandId,
      category: form.category,
      model: form.model || form.name,
      modelId: form.modelId || `model-${(form.model || form.name).toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${form.brandId}`,
      modelSlug: form.modelSlug || (form.model || form.name).toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      price: Number(form.price),
      compareAtPrice: Number(form.compareAtPrice) || undefined,
      inventory: Number(form.inventory),
      image: form.image || "/RO1.jpeg",
      gallery: galleryImages.length ? galleryImages : [form.image || "/RO1.jpeg"],
      shortDescription: form.shortDescription || form.description,
      description: form.description,
      stockStatus: form.stockStatus,
      status: form.status,
      sku: form.sku || `SKU-${(form.name || "product").toUpperCase().replace(/[^A-Z0-9]+/g, "-")}`,
      badge: form.badge || undefined,
      featured: form.featured,
      features: parseFeatures(form.features),
      specifications: parseSpecifications(form.specifications),
      technology: form.technology || undefined,
      capacity: form.capacity || undefined,
      warranty: form.warranty || undefined,
    });

    const updated = [...getProductsFromStoreSync().filter((product) => product.id !== next.id), next].sort((a, b) => a.name.localeCompare(b.name));
    setProducts(updated);
    saveProductsToStore(updated);
    setForm(defaultForm);
  }

  function handleEdit(product: Product) {
    setForm({
      id: product.id,
      name: product.name,
      slug: product.slug,
      brandId: product.brandId ?? "",
      brand: product.brand,
      category: product.category,
      model: product.model ?? product.name,
      modelId: product.modelId ?? "",
      modelSlug: product.modelSlug ?? "",
      price: product.price,
      compareAtPrice: product.compareAtPrice ?? 0,
      inventory: product.inventory,
      image: product.image,
      gallery: (product.gallery ?? [product.image]).join("\n"),
      shortDescription: product.shortDescription,
      description: product.description,
      stockStatus: product.stockStatus,
      status: product.status ?? "active",
      sku: product.sku ?? "",
      badge: product.badge ?? "",
      featured: product.featured ?? false,
      technology: product.technology ?? "",
      capacity: product.capacity ?? "",
      warranty: product.warranty ?? "",
      features: (product.features ?? []).join("\n"),
      specifications: JSON.stringify(product.specifications ?? {}, null, 2),
    });
  }

  function handleDelete(id: string) {
    const updated = getProductsFromStoreSync().filter((product) => product.id !== id);
    setProducts(updated);
    saveProductsToStore(updated);
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Products</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Catalog management</h1>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <form onSubmit={handleSubmit} className="rounded-[28px] border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">{form.id ? "Edit product" : "Add product"}</h2>
          <div className="mt-5 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Brand</label>
                <select value={form.brandId} onChange={(event) => setForm((current) => ({ ...current, brandId: event.target.value, brand: brands.find((brand) => brand.id === event.target.value)?.name ?? current.brand }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none ring-0" required>
                  <option value="">Select brand</option>
                  {brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Status</label>
                <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as Product["status"] }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none ring-0">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Product name</label>
              <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none ring-0" placeholder="VINI Compact RO Unit" required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Slug</label>
              <input value={form.slug} onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none ring-0" placeholder="vini-compact-ro-unit" />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Model</label>
                <input value={form.model} onChange={(event) => setForm((current) => ({ ...current, model: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none ring-0" placeholder="VINI Compact" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Category</label>
                <select value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none ring-0">
                  <option value="ro">RO</option>
                  <option value="accessories">Accessories</option>
                  <option value="amc">AMC</option>
                  <option value="combo-offers">Combo Offers</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Price</label>
                <input type="number" value={form.price} onChange={(event) => setForm((current) => ({ ...current, price: Number(event.target.value) }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none ring-0" min={0} required />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Compare at price</label>
                <input type="number" value={form.compareAtPrice} onChange={(event) => setForm((current) => ({ ...current, compareAtPrice: Number(event.target.value) }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none ring-0" min={0} />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Inventory</label>
                <input type="number" value={form.inventory} onChange={(event) => setForm((current) => ({ ...current, inventory: Number(event.target.value) }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none ring-0" min={0} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Stock status</label>
                <select value={form.stockStatus} onChange={(event) => setForm((current) => ({ ...current, stockStatus: event.target.value as Product["stockStatus"] }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none ring-0">
                  <option value="in-stock">In stock</option>
                  <option value="low-stock">Low stock</option>
                  <option value="out-of-stock">Out of stock</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Product image</label>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="mb-3 block w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700" />
              <input value={form.image} onChange={(event) => setForm((current) => ({ ...current, image: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none ring-0" placeholder="/RO1.jpeg" />
              {form.image ? <img src={form.image} alt="Product preview" className="mt-3 h-20 w-20 rounded-2xl object-cover" /> : null}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Gallery images (one per line)</label>
              <textarea value={form.gallery} onChange={(event) => setForm((current) => ({ ...current, gallery: event.target.value }))} className="min-h-24 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none ring-0" placeholder="/RO1.jpeg\n/RO2.jpeg" />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Short description</label>
              <textarea value={form.shortDescription} onChange={(event) => setForm((current) => ({ ...current, shortDescription: event.target.value }))} className="min-h-20 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none ring-0" placeholder="Compact RO purification for everyday use." />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
              <textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} className="min-h-28 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none ring-0" placeholder="Detailed product description." />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">SKU</label>
                <input value={form.sku} onChange={(event) => setForm((current) => ({ ...current, sku: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none ring-0" placeholder="SKU-RO-01" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Badge</label>
                <input value={form.badge} onChange={(event) => setForm((current) => ({ ...current, badge: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none ring-0" placeholder="Popular" />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Technology</label>
                <input value={form.technology} onChange={(event) => setForm((current) => ({ ...current, technology: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none ring-0" placeholder="RO + Carbon" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Capacity</label>
                <input value={form.capacity} onChange={(event) => setForm((current) => ({ ...current, capacity: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none ring-0" placeholder="8 L/hr" />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Warranty</label>
              <input value={form.warranty} onChange={(event) => setForm((current) => ({ ...current, warranty: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none ring-0" placeholder="12 months" />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Features (one per line)</label>
                <textarea value={form.features} onChange={(event) => setForm((current) => ({ ...current, features: event.target.value }))} className="min-h-24 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none ring-0" placeholder="Low-maintenance design\nLeak-resistant body" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Specifications (JSON)</label>
                <textarea value={form.specifications} onChange={(event) => setForm((current) => ({ ...current, specifications: event.target.value }))} className="min-h-24 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none ring-0" placeholder='{"Capacity":"8 L/hr","Warranty":"12 months"}' />
              </div>
            </div>

            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700">
              <input type="checkbox" checked={form.featured} onChange={(event) => setForm((current) => ({ ...current, featured: event.target.checked }))} className="h-4 w-4 rounded border-slate-300" />
              Mark as featured product
            </label>

            <div className="flex gap-3 pt-2">
              <button type="submit" className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white">Save product</button>
              <button type="button" onClick={() => setForm(defaultForm)} className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700">Reset</button>
            </div>
          </div>
        </form>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">Product list</h2>
          <div className="mt-5 space-y-3">
            {sortedProducts.length ? sortedProducts.map((product) => (
              <div key={product.id} className="admin-list-item rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="admin-list-item-main">
                  <img src={product.image} alt={product.name} className="h-12 w-12 rounded-xl object-cover" />
                  <div className="admin-list-item-meta">
                    <p className="font-medium text-slate-900">{product.name}</p>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{product.brand}</p>
                  </div>
                </div>
                <div className="admin-list-item-actions">
                  <span className="rounded-full bg-sky-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-700">{product.category}</span>
                  <button type="button" onClick={() => handleEdit(product)} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700">Edit</button>
                  <button type="button" onClick={() => handleDelete(product.id)} className="rounded-full border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-700">Delete</button>
                </div>
                <div className="w-full pt-1 text-sm text-slate-600">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span>₹{product.price.toLocaleString("en-IN")}</span>
                    <span>{product.inventory} in stock</span>
                    <span>{product.stockStatus}</span>
                  </div>
                </div>
              </div>
            )) : <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-600">No products added yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
