"use client";

import { useEffect, useMemo, useState } from "react";
import { Accessory, getAccessoryList, saveAccessoryList, upsertAccessory } from "@/lib/catalog";

export default function AdminAccessoriesPage() {
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [form, setForm] = useState({
    id: "",
    name: "",
    slug: "",
    category: "general",
    price: "",
    stock: "",
    image: "/RO1.jpeg",
    shortDescription: "",
    description: "",
    features: "",
    status: "active" as Accessory["status"],
    featured: false,
  });

  useEffect(() => {
    setAccessories(getAccessoryList());
  }, []);

  const sortedAccessories = useMemo(() => [...accessories].sort((a, b) => a.name.localeCompare(b.name)), [accessories]);

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

    const next = upsertAccessory({
      id: form.id || undefined,
      name: form.name,
      slug: form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      category: form.category,
      price: Number(form.price) || 0,
      stock: Number(form.stock) || 0,
      image: form.image || "/RO1.jpeg",
      shortDescription: form.shortDescription,
      description: form.description,
      features: form.features
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
      status: form.status,
      featured: form.featured,
    });

    const updated = [...getAccessoryList().filter((item) => item.id !== next.id), next].sort((a, b) => a.name.localeCompare(b.name));
    setAccessories(updated);
    saveAccessoryList(updated);
    setForm({
      id: "",
      name: "",
      slug: "",
      category: "general",
      price: "",
      stock: "",
      image: "/RO1.jpeg",
      shortDescription: "",
      description: "",
      features: "",
      status: "active",
      featured: false,
    });
  }

  function handleEdit(item: Accessory) {
    setForm({
      id: item.id,
      name: item.name,
      slug: item.slug,
      category: item.category,
      price: String(item.price),
      stock: String(item.stock),
      image: item.image,
      shortDescription: item.shortDescription,
      description: item.description,
      features: item.features.join("\n"),
      status: item.status,
      featured: Boolean(item.featured),
    });
  }

  function handleDelete(id: string) {
    const updated = getAccessoryList().filter((item) => item.id !== id);
    saveAccessoryList(updated);
    setAccessories(updated);
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Accessories</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Accessory management</h1>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <form onSubmit={handleSubmit} className="rounded-[28px] border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">{form.id ? "Edit accessory" : "Add accessory"}</h2>
          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Accessory name</label>
              <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none ring-0" placeholder="RO Membrane" required />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Slug</label>
              <input value={form.slug} onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none ring-0" placeholder="ro-membrane" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Category</label>
                <select value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none ring-0">
                  <option value="general">General</option>
                  <option value="filters">Filters</option>
                  <option value="membranes">Membranes</option>
                  <option value="fittings">Fittings</option>
                  <option value="service">Service</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Status</label>
                <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as Accessory["status"] }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none ring-0">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Price (₹)</label>
                <input type="number" min="0" value={form.price} onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none ring-0" placeholder="1450" required />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Stock</label>
                <input type="number" min="0" value={form.stock} onChange={(event) => setForm((current) => ({ ...current, stock: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none ring-0" placeholder="25" required />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Accessory image</label>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="mb-3 block w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700" />
              <input value={form.image} onChange={(event) => setForm((current) => ({ ...current, image: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none ring-0" placeholder="/RO1.jpeg" />
              {form.image ? <img src={form.image} alt="Accessory preview" className="mt-3 h-20 w-20 rounded-2xl object-cover" /> : null}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Short description</label>
              <input value={form.shortDescription} onChange={(event) => setForm((current) => ({ ...current, shortDescription: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none ring-0" placeholder="Replacement membrane for RO maintenance." />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
              <textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} className="min-h-28 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none ring-0" placeholder="Premium replacement filter with consistent water flow." />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Key features (one per line)</label>
              <textarea value={form.features} onChange={(event) => setForm((current) => ({ ...current, features: event.target.value }))} className="min-h-24 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none ring-0" placeholder="Reliable performance&#10;Easy replacement&#10;Durable build" />
            </div>

            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input type="checkbox" checked={form.featured} onChange={(event) => setForm((current) => ({ ...current, featured: event.target.checked }))} className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500" />
              Featured accessory
            </label>

            <div className="flex gap-3 pt-2">
              <button type="submit" className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white">Save accessory</button>
              <button type="button" onClick={() => setForm({ id: "", name: "", slug: "", category: "general", price: "", stock: "", image: "/RO1.jpeg", shortDescription: "", description: "", features: "", status: "active", featured: false })} className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700">Reset</button>
            </div>
          </div>
        </form>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">Accessory list</h2>
          <div className="mt-5 space-y-3">
            {sortedAccessories.length ? sortedAccessories.map((item) => (
              <div key={item.id} className="admin-list-item rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="admin-list-item-main">
                  <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-white">
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="admin-list-item-meta">
                    <p className="font-medium text-slate-900">{item.name}</p>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{item.category}</p>
                  </div>
                </div>
                <div className="admin-list-item-actions">
                  <span className="rounded-full bg-sky-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-700">₹{item.price}</span>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${item.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>
                    {item.status}
                  </span>
                  <button type="button" onClick={() => handleEdit(item)} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700">Edit</button>
                  <button type="button" onClick={() => handleDelete(item.id)} className="rounded-full border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-700">Delete</button>
                </div>
              </div>
            )) : <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-600">No accessories added yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
