"use client";

import { useEffect, useMemo, useState } from "react";
import { Brand, deleteBrandById, getBrandList, saveBrandList, upsertBrand } from "@/lib/catalog";

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [form, setForm] = useState({ id: "", name: "", slug: "", logo: "/RO1.jpeg", description: "", status: "active" as Brand["status"] });

  useEffect(() => {
    setBrands(getBrandList());
  }, []);

  const sortedBrands = useMemo(() => [...brands].sort((a, b) => a.name.localeCompare(b.name)), [brands]);

  function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const source = typeof reader.result === "string" ? reader.result : "/RO1.jpeg";
      const image = new Image();
      image.onload = () => {
        const maxSize = 900;
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
        setForm((current) => ({ ...current, logo: canvas.toDataURL("image/jpeg", 0.78) }));
      };
      image.src = source;
    };
    reader.readAsDataURL(file);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = upsertBrand({
      id: form.id || undefined,
      name: form.name,
      slug: form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      logo: form.logo || "/RO1.jpeg",
      description: form.description,
      status: form.status,
    });

    const updated = [...getBrandList().filter((brand) => brand.id !== next.id), next].sort((a, b) => a.name.localeCompare(b.name));
    setBrands(updated);
    saveBrandList(updated);
    setForm({ id: "", name: "", slug: "", logo: "/RO1.jpeg", description: "", status: "active" });
  }

  function handleEdit(brand: Brand) {
    setForm({
      id: brand.id,
      name: brand.name,
      slug: brand.slug,
      logo: brand.logo,
      description: brand.description,
      status: brand.status,
    });
  }

  function handleDelete(id: string) {
    const brand = brands.find((item) => item.id === id);
    if (!brand || !window.confirm(`Delete ${brand.name}? This action cannot be undone.`)) return;

    const updated = deleteBrandById(id, brands);
    setBrands(updated);
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Brands</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Brand management</h1>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <form onSubmit={handleSubmit} className="rounded-[28px] border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">{form.id ? "Edit brand" : "Add brand"}</h2>
          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Brand name</label>
              <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none ring-0" placeholder="KENT" required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Slug</label>
              <input value={form.slug} onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none ring-0" placeholder="kent" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Brand logo</label>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="mb-3 block w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700" />
              <input value={form.logo} onChange={(event) => setForm((current) => ({ ...current, logo: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none ring-0" placeholder="/RO1.jpeg" />
              {form.logo ? <img src={form.logo} alt="Brand preview" className="mt-3 h-20 w-20 rounded-2xl object-cover" /> : null}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
              <textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} className="min-h-28 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none ring-0" placeholder="Premium RO systems known for dependable performance." />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Status</label>
              <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as Brand["status"] }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none ring-0">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white">Save brand</button>
              <button type="button" onClick={() => setForm({ id: "", name: "", slug: "", logo: "/RO1.jpeg", description: "", status: "active" })} className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700">Reset</button>
            </div>
          </div>
        </form>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">Brand list</h2>
          <div className="mt-5 space-y-3">
            {sortedBrands.length ? sortedBrands.map((brand) => (
              <div key={brand.id} className="admin-list-item rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="admin-list-item-main">
                  <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-white">
                    <img src={brand.logo} alt={brand.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="admin-list-item-meta">
                    <p className="font-medium text-slate-900">{brand.name}</p>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{brand.slug}</p>
                  </div>
                </div>
                <div className="admin-list-item-actions">
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${brand.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>
                    {brand.status}
                  </span>
                  <button type="button" onClick={() => handleEdit(brand)} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700">Edit</button>
                  <button type="button" onClick={() => handleDelete(brand.id)} className="rounded-full border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-700">Delete</button>
                </div>
              </div>
            )) : <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-600">No brands added yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
