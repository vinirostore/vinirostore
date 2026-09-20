"use client";

import { useEffect, useMemo, useState } from "react";
import { Brand, ProductModel, getBrandList, getModelList, saveModelList, upsertModel } from "@/lib/catalog";

export default function AdminModelsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<ProductModel[]>([]);
  const [form, setForm] = useState({ id: "", brandId: "", name: "", slug: "", description: "", image: "/RO1.jpeg", status: "active" as ProductModel["status"] });

  useEffect(() => {
    setBrands(getBrandList());
    setModels(getModelList());
  }, []);

  const sortedModels = useMemo(() => [...models].sort((a, b) => a.name.localeCompare(b.name)), [models]);

  function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "/RO1.jpeg";
      setForm((current) => ({ ...current, image: result }));
    };
    reader.readAsDataURL(file);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.brandId) return;

    const next = upsertModel({
      id: form.id || undefined,
      brandId: form.brandId,
      name: form.name,
      slug: form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description: form.description,
      image: form.image || "/RO1.jpeg",
      status: form.status,
    });

    const updated = [...getModelList().filter((model) => model.id !== next.id), next].sort((a, b) => a.name.localeCompare(b.name));
    setModels(updated);
    saveModelList(updated);
    setForm({ id: "", brandId: "", name: "", slug: "", description: "", image: "/RO1.jpeg", status: "active" });
  }

  function handleEdit(model: ProductModel) {
    setForm({
      id: model.id,
      brandId: model.brandId,
      name: model.name,
      slug: model.slug,
      description: model.description,
      image: model.image,
      status: model.status,
    });
  }

  function handleDelete(id: string) {
    const updated = getModelList().filter((model) => model.id !== id);
    saveModelList(updated);
    setModels(updated);
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Models</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Model management</h1>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <form onSubmit={handleSubmit} className="rounded-[28px] border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">{form.id ? "Edit model" : "Add model"}</h2>
          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Brand</label>
              <select value={form.brandId} onChange={(event) => setForm((current) => ({ ...current, brandId: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none ring-0" required>
                <option value="">Select brand</option>
                {brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Model name</label>
              <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none ring-0" placeholder="VINI Compact" required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Slug</label>
              <input value={form.slug} onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none ring-0" placeholder="vini-compact" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Model image</label>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="mb-3 block w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700" />
              <input value={form.image} onChange={(event) => setForm((current) => ({ ...current, image: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none ring-0" placeholder="/RO1.jpeg" />
              {form.image ? <img src={form.image} alt="Model preview" className="mt-3 h-20 w-20 rounded-2xl object-cover" /> : null}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
              <textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} className="min-h-28 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none ring-0" placeholder="Compact model for families and small offices." />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Status</label>
              <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as ProductModel["status"] }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none ring-0">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white">Save model</button>
              <button type="button" onClick={() => setForm({ id: "", brandId: "", name: "", slug: "", description: "", image: "/RO1.jpeg", status: "active" })} className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700">Reset</button>
            </div>
          </div>
        </form>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">Model list</h2>
          <div className="mt-5 space-y-3">
            {sortedModels.length ? sortedModels.map((model) => (
              <div key={model.id} className="admin-list-item rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="admin-list-item-main">
                  <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-white">
                    <img src={model.image} alt={model.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="admin-list-item-meta">
                    <p className="font-medium text-slate-900">{model.name}</p>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{brands.find((brand) => brand.id === model.brandId)?.name ?? "Unknown brand"}</p>
                  </div>
                </div>
                <div className="admin-list-item-actions">
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${model.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>
                    {model.status}
                  </span>
                  <button type="button" onClick={() => handleEdit(model)} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700">Edit</button>
                  <button type="button" onClick={() => handleDelete(model.id)} className="rounded-full border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-700">Delete</button>
                </div>
              </div>
            )) : <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-600">No models added yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
