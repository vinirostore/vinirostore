"use client";

import { useEffect, useMemo, useState } from "react";
import { Brand, ProductModel, deleteModelById, getBrandList, getModelList, saveModelList, upsertModel } from "@/lib/catalog";

export default function AdminModelsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<ProductModel[]>([]);
  const [form, setForm] = useState({ id: "", brandId: "", name: "", slug: "", description: "", image: "/RO1.jpeg", gallery: ["/RO1.jpeg"], colors: [] as Array<{ name: string; image: string }>, price: "", newArrival: false, bestSeller: false, deal: false, featured: false, status: "active" as ProductModel["status"] });

  useEffect(() => {
    setBrands(getBrandList());
    setModels(getModelList());
  }, []);

  const sortedModels = useMemo(() => [...models].sort((a, b) => a.name.localeCompare(b.name)), [models]);

  function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;

    Promise.all(files.map((file) => new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "/RO1.jpeg");
      reader.onerror = () => resolve("/RO1.jpeg");
      reader.readAsDataURL(file);
    }))).then((images) => {
      setForm((current) => ({ ...current, image: images[0], gallery: images }));
    });
  }

  function handleColorImageUpload(index: number, event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const image = typeof reader.result === "string" ? reader.result : "/RO1.jpeg";
      setForm((current) => ({
        ...current,
        colors: current.colors.map((color, colorIndex) => colorIndex === index ? { ...color, image } : color),
      }));
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
      gallery: form.gallery.length ? form.gallery : [form.image || "/RO1.jpeg"],
      colors: form.colors.filter((color) => color.name.trim() && color.image),
      price: form.price ? Number(form.price) : undefined,
      newArrival: form.newArrival,
      bestSeller: form.bestSeller,
      deal: form.deal,
      featured: form.featured,
      status: form.status,
    });

    const updated = [...getModelList().filter((model) => model.id !== next.id), next].sort((a, b) => a.name.localeCompare(b.name));
    setModels(updated);
    saveModelList(updated);
    setForm({ id: "", brandId: "", name: "", slug: "", description: "", image: "/RO1.jpeg", gallery: ["/RO1.jpeg"], colors: [], price: "", newArrival: false, bestSeller: false, deal: false, featured: false, status: "active" });
  }

  function handleEdit(model: ProductModel) {
    setForm({
      id: model.id,
      brandId: model.brandId,
      name: model.name,
      slug: model.slug,
      description: model.description,
      image: model.image,
      gallery: model.gallery?.length ? model.gallery : [model.image],
      colors: model.colors ?? [],
      price: model.price === undefined ? "" : String(model.price),
      newArrival: Boolean(model.newArrival),
      bestSeller: Boolean(model.bestSeller),
      deal: Boolean(model.deal),
      featured: Boolean(model.featured),
      status: model.status,
    });
  }

  function handleDelete(id: string) {
    const model = models.find((item) => item.id === id);
    if (!model || !window.confirm(`Delete ${model.name}? This action cannot be undone.`)) return;

    const updated = deleteModelById(id, models);
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
              <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="mb-3 block w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700" />
              <input value={form.image} onChange={(event) => setForm((current) => ({ ...current, image: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none ring-0" placeholder="/RO1.jpeg" />
              {form.gallery.length ? <div className="mt-3 grid grid-cols-4 gap-2">{form.gallery.map((image, index) => <img key={`${image}-${index}`} src={image} alt={`Model preview ${index + 1}`} className="h-20 w-full rounded-2xl object-cover" />)}</div> : null}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
              <textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} className="min-h-28 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none ring-0" placeholder="Compact model for families and small offices." />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Price</label>
              <input type="number" min="0" step="0.01" value={form.price} onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none ring-0" placeholder="49999" />
            </div>
            <div>
              <div className="flex items-center justify-between gap-3">
                <label className="block text-sm font-medium text-slate-700">Colour options</label>
                <button type="button" onClick={() => setForm((current) => ({ ...current, colors: [...current.colors, { name: "", image: "/RO1.jpeg" }] }))} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700">Add colour</button>
              </div>
              {form.colors.length ? <div className="mt-3 space-y-3">{form.colors.map((color, index) => <div key={`color-option-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex gap-2">
                  <input value={color.name} onChange={(event) => setForm((current) => ({ ...current, colors: current.colors.map((item, itemIndex) => itemIndex === index ? { ...item, name: event.target.value } : item) }))} className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900" placeholder="Colour name, e.g. White" />
                  <button type="button" onClick={() => setForm((current) => ({ ...current, colors: current.colors.filter((_, itemIndex) => itemIndex !== index) }))} className="rounded-full border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-700">Remove</button>
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <input type="file" accept="image/*" onChange={(event) => handleColorImageUpload(index, event)} className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700" />
                  <img src={color.image} alt={`${color.name || "Colour"} preview`} className="h-12 w-12 rounded-xl object-cover" />
                </div>
                <input value={color.image} onChange={(event) => setForm((current) => ({ ...current, colors: current.colors.map((item, itemIndex) => itemIndex === index ? { ...item, image: event.target.value } : item) }))} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900" placeholder="/RO1.jpeg" />
              </div>)}</div> : <p className="mt-2 text-xs text-slate-500">Add colour names and one image for each option.</p>}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Status</label>
              <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as ProductModel["status"] }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none ring-0">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm text-slate-700">
              {([['newArrival', 'New arrival'], ['bestSeller', 'Best seller'], ['deal', 'Deal'], ['featured', 'Featured']] as const).map(([key, label]) => <label key={key} className="flex items-center gap-2"><input type="checkbox" checked={form[key]} onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.checked }))} />{label}</label>)}
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white">Save model</button>
              <button type="button" onClick={() => setForm({ id: "", brandId: "", name: "", slug: "", description: "", image: "/RO1.jpeg", gallery: ["/RO1.jpeg"], colors: [], price: "", newArrival: false, bestSeller: false, deal: false, featured: false, status: "active" })} className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700">Reset</button>
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
