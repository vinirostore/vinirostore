export type Brand = {
  id: string;
  name: string;
  slug: string;
  logo: string;
  description: string;
  status: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
};

export type ProductModel = {
  id: string;
  name: string;
  slug: string;
  brandId: string;
  description: string;
  image: string;
  gallery: string[];
  colors?: Array<{ name: string; image: string }>;
  price?: number;
  newArrival?: boolean;
  bestSeller?: boolean;
  featured?: boolean;
  deal?: boolean;
  status: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
};

export type Accessory = {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  stock: number;
  image: string;
  shortDescription: string;
  description: string;
  features: string[];
  status: "active" | "inactive";
  featured?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  featured?: boolean;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  category: string;
  brand: string;
  brandId?: string;
  model?: string;
  modelId?: string;
  modelSlug?: string;
  price: number;
  compareAtPrice?: number;
  inventory: number;
  image: string;
  gallery: string[];
  description: string;
  shortDescription: string;
  badge?: string;
  featured?: boolean;
  newArrival?: boolean;
  bestSeller?: boolean;
  deal?: boolean;
  sku: string;
  stockStatus: "in-stock" | "low-stock" | "out-of-stock" | "unavailable";
  status?: "active" | "inactive";
  specifications?: Record<string, string>;
  features?: string[];
  technology?: string;
  capacity?: string;
  warranty?: string;
};

export const categories: Category[] = [
  { id: "ro", name: "RO", slug: "ro", description: "Water purification solutions" },
  { id: "accessories", name: "Accessories", slug: "accessories", description: "Replacement and support parts" },
  { id: "amc", name: "AMC", slug: "amc", description: "Annual maintenance contracts" },
  { id: "combo-offers", name: "Combo Offers", slug: "combo-offers", description: "Smart value bundles" },
];

export const brands: Brand[] = [
  { id: "brand-kent", name: "KENT", slug: "kent", logo: "/RO1.jpeg", description: "Premium RO systems known for dependable performance and modern design.", status: "active" },
  { id: "brand-aquaguard", name: "AQUAGUARD", slug: "aquaguard", logo: "/RO2.jpeg", description: "Trusted RO solutions for homes and small commercial spaces.", status: "active" },
  { id: "brand-pureit", name: "PUREIT", slug: "pureit", logo: "/RO3.jpeg", description: "Efficient RO purification systems tuned for everyday use.", status: "active" },
  { id: "brand-vini", name: "VINI", slug: "vini", logo: "/RO4.jpeg", description: "VINI RO systems built for durable service and clean water output.", status: "active" },
];

export const defaultModels: ProductModel[] = [
  { id: "model-kent-supreme-plus", name: "Kent Supreme Plus", slug: "kent-supreme-plus", brandId: "brand-kent", description: "High-capacity RO unit designed for family convenience and consistent output.", image: "/RO1.jpeg", gallery: ["/RO1.jpeg"], status: "active" },
  { id: "model-aquaguard-essence", name: "AQUAGUARD Essence", slug: "aquaguard-essence", brandId: "brand-aquaguard", description: "Compact countertop RO solution for clean and safe drinking water.", image: "/RO2.jpeg", gallery: ["/RO2.jpeg"], status: "active" },
  { id: "model-pureit-classic", name: "Pureit Classic", slug: "pureit-classic", brandId: "brand-pureit", description: "Designed for daily filtration needs with simpler service maintenance.", image: "/RO3.jpeg", gallery: ["/RO3.jpeg"], status: "active" },
  { id: "model-vini-compact", name: "VINI Compact", slug: "vini-compact", brandId: "brand-vini", description: "Value-first RO model built with dependable service support and essential performance.", image: "/RO4.jpeg", gallery: ["/RO4.jpeg"], status: "active" },
];

export const defaultAccessories: Accessory[] = [];

export const products: Product[] = [
  {
    id: "prod-1",
    name: "VINI Compact RO Unit",
    slug: "vini-compact-ro-unit",
    category: "ro",
    brand: "VINI",
    brandId: "brand-vini",
    model: "VINI Compact",
    modelId: "model-vini-compact",
    modelSlug: "vini-compact",
    price: 6999,
    compareAtPrice: 7999,
    inventory: 18,
    image: "/RO1.jpeg",
    gallery: ["/RO1.jpeg", "/RO4.jpeg", "/RO5.jpeg"],
    description: "Compact RO unit for homes and small offices, built for clean and reliable water purification.",
    shortDescription: "Compact RO purification for everyday use.",
    sku: "VRO-CMP-01",
    stockStatus: "in-stock",
    badge: "Popular",
    featured: true,
    bestSeller: true,
    specifications: {
      Capacity: "8 L/hr",
      Technology: "RO + Carbon filtration",
      Warranty: "12 months on manufacturing defects"
    },
    features: ["Low-maintenance design", "Leak-resistant body", "Easy service access"],
    technology: "RO + sediment + carbon",
    capacity: "8 L/hr",
    warranty: "12 months on manufacturing defects"
  },
  {
    id: "prod-2",
    name: "RO Membrane",
    slug: "ro-membrane",
    category: "accessories",
    brand: "VINI",
    brandId: "brand-vini",
    price: 1450,
    inventory: 42,
    image: "/RO6.jpeg",
    gallery: ["/RO6.jpeg", "/RO9.jpeg"],
    description: "Replacement membrane for RO systems, suitable for routine maintenance and better output quality.",
    shortDescription: "Replacement membrane for RO maintenance.",
    sku: "VRO-MEM-02",
    stockStatus: "in-stock",
    newArrival: true,
    features: ["Reliable performance", "Easy replacement", "Durable build"],
    technology: "Thin-film composite",
    capacity: "Variable by system",
  },
  {
    id: "prod-3",
    name: "Pre Carbon Filter",
    slug: "pre-carbon-filter",
    category: "accessories",
    brand: "VINI",
    brandId: "brand-vini",
    price: 650,
    inventory: 8,
    image: "/RO7.jpeg",
    gallery: ["/RO7.jpeg", "/RO8.jpeg"],
    description: "Pre-treatment carbon filter to support consistent water flow and cleaner output.",
    shortDescription: "Carbon pre-filter for RO systems.",
    sku: "VRO-PC-03",
    stockStatus: "low-stock",
    features: ["Improves taste", "Reduces chlorine presence", "Service-friendly"],
    technology: "Activated carbon",
    capacity: "Standard RO filter size",
  },
  {
    id: "prod-4",
    name: "AMC Annual Maintenance",
    slug: "amc-annual-maintenance",
    category: "amc",
    brand: "VINI",
    brandId: "brand-vini",
    price: 2900,
    inventory: 999,
    image: "/RO8.jpeg",
    gallery: ["/RO8.jpeg", "/RO9.jpeg"],
    description: "Annual maintenance contract for Ahmedabad customers with service and visit coverage included.",
    shortDescription: "Annual maintenance contract for Ahmedabad.",
    sku: "VAMC-STD-01",
    stockStatus: "in-stock",
    badge: "Ahmedabad only",
    specifications: {
      Service: "Included",
      Visit: "Included",
      Area: "Ahmedabad only",
      Replacement: "Chargeable at applicable MRP"
    },
    features: ["Service + visit included", "Replacement parts charged separately", "Renewal available after expiry"],
    technology: "Operational support",
    capacity: "1-year coverage",
  },
  {
    id: "prod-5",
    name: "Home Care Combo",
    slug: "home-care-combo",
    category: "combo-offers",
    brand: "VINI",
    brandId: "brand-vini",
    price: 8399,
    compareAtPrice: 8999,
    inventory: 12,
    image: "/RO3.jpeg",
    gallery: ["/RO3.jpeg", "/RO2.jpeg", "/RO5.jpeg"],
    description: "A value bundle including essential RO support components and installation assistance.",
    shortDescription: "Value combo for RO support and maintenance.",
    sku: "VCOMBO-HOME-01",
    stockStatus: "in-stock",
    badge: "Combo",
    deal: true,
    features: ["Bundle savings", "Essential maintenance kit", "Installation guidance"],
    technology: "RO support package",
    capacity: "Home-ready bundle",
  },
];

export const productsBySlug = Object.fromEntries(products.map((product) => [product.slug, product]));

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function readLocalCatalog<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function hasSupabaseConfig() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

async function writeSupabaseRows<T>(table: string, rows: T[]) {
  if (!hasSupabaseConfig()) return "Supabase is not configured.";

  try {
    const { supabase } = await import("@/lib/supabase");
    if (!supabase) return "Supabase is not configured.";
    const payload = rows as unknown as Record<string, unknown>[];
    const { error } = await supabase.from(table).upsert(payload, { onConflict: "id" });
    return error?.message ?? null;
  } catch (error) {
    return error instanceof Error ? error.message : "Unable to save data to Supabase.";
  }
}

async function deleteSupabaseRows(table: string, ids: string[]) {
  if (!hasSupabaseConfig() || !ids.length) return false;

  try {
    const { supabase } = await import("@/lib/supabase");
    if (!supabase) return false;
    const { error } = await supabase.from(table).delete().in("id", ids);
    return !error;
  } catch {
    return false;
  }
}

const MAX_LOCAL_STORAGE_IMAGE_CHARS = 180000;

function sanitizeStoredImage(value: string | undefined | null): string | undefined | null {
  if (!value || typeof value !== "string") return value ?? null;

  if (!value.startsWith("data:image/")) return value;
  if (value.length <= MAX_LOCAL_STORAGE_IMAGE_CHARS) return value;

  return "/RO1.jpeg";
}

function sanitizeCatalogValue<T>(value: T): T {
  if (!value || typeof value !== "object") return value;

  const seen = new WeakSet<object>();

  const visit = (item: unknown): unknown => {
    if (!item || typeof item !== "object") return item;
    if (seen.has(item as object)) return item;
    seen.add(item as object);

    if (Array.isArray(item)) {
      return item.map((entry) => visit(entry));
    }

    const result: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(item as Record<string, unknown>)) {
      if ((key === "image" || key === "logo") && typeof entry === "string") {
        result[key] = sanitizeStoredImage(entry);
      } else if (key === "gallery" && Array.isArray(entry)) {
        result[key] = entry.map((image) => typeof image === "string" ? sanitizeStoredImage(image) : image).filter(Boolean);
      } else if (key === "colors" && Array.isArray(entry)) {
        result[key] = entry.map((color) => ({
          ...(color as Record<string, unknown>),
          image: typeof (color as Record<string, unknown>).image === "string" ? sanitizeStoredImage((color as Record<string, unknown>).image as string) : (color as Record<string, unknown>).image,
        }));
      } else if (entry && typeof entry === "object") {
        result[key] = visit(entry);
      } else {
        result[key] = entry;
      }
    }

    return result;
  };

  return visit(value) as T;
}

export function writeLocalCatalog<T>(key: string, value: T) {
  if (typeof window === "undefined") return;

  const attemptSave = (payload: string) => {
    window.localStorage.setItem(key, payload);
    window.dispatchEvent(new CustomEvent("vini-catalog-updated", { detail: { key } }));
  };

  try {
    const sanitized = sanitizeCatalogValue(value);
    const payload = JSON.stringify(sanitized);
    attemptSave(payload);
    return;
  } catch (error) {
    console.warn("Catalog storage quota exceeded; retrying with a sanitized payload for", key, error);
  }

  try {
    const sanitized = sanitizeCatalogValue(value);
    const fallback = JSON.stringify(sanitized, (_, item) => {
      if (typeof item === "string" && item.startsWith("data:image/")) {
        return "/RO1.jpeg";
      }
      return item;
    });
    attemptSave(fallback);
    return;
  } catch (error) {
    console.warn("Catalog storage retry failed; clearing stale local catalog entry for", key, error);
  }

  try {
    const catalogKeys = ["vini-products", "vini-brands", "vini-models", "vini-accessories"];
    for (const catalogKey of catalogKeys) {
      if (catalogKey !== key) {
        window.localStorage.removeItem(catalogKey);
      }
    }
    window.localStorage.removeItem(key);

    const sanitized = sanitizeCatalogValue(value);
    const finalPayload = JSON.stringify(sanitized, (_, item) => {
      if (typeof item === "string" && item.startsWith("data:image/")) {
        return "/RO1.jpeg";
      }
      return item;
    });
    attemptSave(finalPayload);
  } catch {
    // Ignore: preserve app functionality even when browser storage is full.
  }
}

export async function fetchSupabaseCatalog<T>(table: string): Promise<T[] | null> {
  if (!hasSupabaseConfig()) return null;

  try {
    const { supabase } = await import("@/lib/supabase");
    if (!supabase) return null;
    const { data, error } = await supabase.from(table).select("*");
    if (error || !data) return null;
    return data as T[];
  } catch {
    return null;
  }
}

export function getBrandList(): Brand[] {
  const saved = readLocalCatalog<Brand[] | null>("vini-brands", null);
  const source = saved === null ? brands : saved;
  return source.filter((brand) => brand.status !== "inactive");
}

export async function getBrandListFromStore(): Promise<Brand[]> {
  const remote = await fetchSupabaseCatalog<Brand>("brands");
  if (remote && remote.length) return remote.map((brand) => ({ ...brand, createdAt: brand.createdAt ?? (brand as Brand & { created_at?: string }).created_at, updatedAt: brand.updatedAt ?? (brand as Brand & { updated_at?: string }).updated_at })).filter((brand) => brand.status !== "inactive");
  return getBrandList();
}

export function getBrandBySlug(slug: string): Brand | undefined {
  return getBrandList().find((brand) => brand.slug === slug);
}

export function getModelList(): ProductModel[] {
  const saved = readLocalCatalog<ProductModel[] | null>("vini-models", null);
  const source = saved === null ? defaultModels : saved;
  return source.filter((model) => model.status !== "inactive");
}

export async function getModelListFromStore(): Promise<ProductModel[]> {
  const remote = await fetchSupabaseCatalog<ProductModel>("models");
  if (remote && remote.length) return remote.map((model) => {
    const row = model as ProductModel & { brand_id?: string; created_at?: string; updated_at?: string; new_arrival?: boolean; best_seller?: boolean };
    return {
      ...model,
      brandId: model.brandId ?? row.brand_id,
      colors: Array.isArray(model.colors) ? model.colors : [],
      newArrival: model.newArrival ?? row.new_arrival ?? false,
      bestSeller: model.bestSeller ?? row.best_seller ?? false,
      createdAt: model.createdAt ?? row.created_at,
      updatedAt: model.updatedAt ?? row.updated_at,
    };
  }).filter((model) => model.status !== "inactive");
  return getModelList();
}

export function getModelBySlug(slug: string): ProductModel | undefined {
  return getModelList().find((model) => model.slug === slug);
}

export function getAccessoryList(): Accessory[] {
  const saved = readLocalCatalog<Accessory[] | null>("vini-accessories", null);
  const source = saved && saved.length ? saved : defaultAccessories;
  return source.filter((item) => item.status !== "inactive");
}

export async function getAccessoryListFromStore(): Promise<Accessory[]> {
  const remote = await fetchSupabaseCatalog<Accessory>("accessories");
  if (remote && remote.length) return remote.map((item) => ({ ...item, shortDescription: item.shortDescription ?? (item as Accessory & { short_description?: string }).short_description ?? "", createdAt: item.createdAt ?? (item as Accessory & { created_at?: string }).created_at, updatedAt: item.updatedAt ?? (item as Accessory & { updated_at?: string }).updated_at })).filter((item) => item.status !== "inactive");
  return getAccessoryList();
}

export function saveAccessoryList(nextAccessories: Accessory[]) {
  writeLocalCatalog("vini-accessories", nextAccessories);
  void writeSupabaseRows("accessories", nextAccessories.map((accessory) => ({
    id: accessory.id,
    name: accessory.name,
    slug: accessory.slug,
    category: accessory.category,
    price: accessory.price,
    stock: accessory.stock,
    image: accessory.image,
    shortDescription: accessory.shortDescription,
    description: accessory.description,
    features: accessory.features,
    status: accessory.status,
    featured: accessory.featured ?? false,
    created_at: accessory.createdAt ?? new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })));
}

export function upsertAccessory(input: Partial<Accessory> & Pick<Accessory, "name" | "price">): Accessory {
  const accessories = getAccessoryList();
  const nextAccessory: Accessory = {
    id: input.id ?? `accessory-${slugify(input.name)}`,
    name: input.name,
    slug: input.slug ?? slugify(input.name),
    category: input.category ?? "general",
    price: input.price,
    stock: input.stock ?? 0,
    image: input.image ?? "/RO1.jpeg",
    shortDescription: input.shortDescription ?? input.description ?? "",
    description: input.description ?? "",
    features: input.features ?? [],
    status: input.status ?? "active",
    featured: input.featured ?? false,
    createdAt: input.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const index = accessories.findIndex((item) => item.id === nextAccessory.id || item.slug === nextAccessory.slug);
  const updated = [...accessories];
  if (index >= 0) {
    updated[index] = nextAccessory;
  } else {
    updated.push(nextAccessory);
  }

  saveAccessoryList(updated);
  return nextAccessory;
}

export function deleteAccessoryById(id: string) {
  const next = getAccessoryList().filter((item) => item.id !== id);
  saveAccessoryList(next);
  void deleteSupabaseRows("accessories", [id]);
  return next;
}

export function getBrandModels(brandSlug: string): ProductModel[] {
  const brand = getBrandBySlug(brandSlug);
  if (!brand) return [];
  return getModelList().filter((model) => model.brandId === brand.id);
}

export function getProductsFromStoreSync(): Product[] {
  const saved = readLocalCatalog<Product[] | null>("vini-products", null);
  return (saved && saved.length ? saved : products).map((product) => ({
    ...product,
    brandId: product.brandId ?? "brand-vini",
    model: product.model ?? product.name,
    modelSlug: product.modelSlug ?? product.slug,
    gallery: product.gallery && product.gallery.length ? product.gallery : [product.image],
  }));
}

export function getProductsForBrand(brandSlug: string): Product[] {
  const targetBrand = getBrandBySlug(brandSlug);
  if (!targetBrand) return [];
  return getProductsFromStoreSync().filter((product) => product.category === "ro" && (product.brandId === targetBrand.id || product.brand === targetBrand.name || product.brand.toLowerCase() === targetBrand.name.toLowerCase()));
}

export function saveProductsToStore(nextProducts: Product[]) {
  writeLocalCatalog("vini-products", nextProducts);
  void writeSupabaseRows("products", nextProducts.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    category: product.category,
    brand: product.brand,
    brand_id: product.brandId,
    model: product.model,
    model_id: product.modelId,
    model_slug: product.modelSlug,
    price: product.price,
    compare_at_price: product.compareAtPrice ?? null,
    inventory: product.inventory,
    image: product.image,
    gallery: product.gallery,
    description: product.description,
    short_description: product.shortDescription,
    badge: product.badge ?? null,
    featured: product.featured ?? false,
    new_arrival: product.newArrival ?? false,
    best_seller: product.bestSeller ?? false,
    deal: product.deal ?? false,
    sku: product.sku,
    stock_status: product.stockStatus,
    status: product.status ?? "active",
    specifications: product.specifications ?? {},
    features: product.features ?? [],
    technology: product.technology ?? null,
    capacity: product.capacity ?? null,
    warranty: product.warranty ?? null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })));
}

export async function saveBrandList(nextBrands: Brand[]) {
  writeLocalCatalog("vini-brands", nextBrands);
  return writeSupabaseRows("brands", nextBrands.map((brand) => ({
    id: brand.id,
    name: brand.name,
    slug: brand.slug,
    logo: brand.logo,
    description: brand.description,
    status: brand.status,
    created_at: brand.createdAt ?? new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })));
}

export function saveModelList(nextModels: ProductModel[]) {
  writeLocalCatalog("vini-models", nextModels);
  void writeSupabaseRows("models", nextModels.map((model) => ({
    id: model.id,
    name: model.name,
    slug: model.slug,
    brand_id: model.brandId,
    description: model.description,
    image: model.image,
    gallery: model.gallery,
    colors: model.colors ?? [],
    price: model.price ?? null,
    new_arrival: model.newArrival ?? false,
    best_seller: model.bestSeller ?? false,
    featured: model.featured ?? false,
    deal: model.deal ?? false,
    status: model.status,
    created_at: model.createdAt ?? new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })));
}

export function deleteBrandById(id: string, currentBrands = getBrandList()) {
  const next = currentBrands.filter((brand) => brand.id !== id);
  saveBrandList(next);
  void deleteSupabaseRows("brands", [id]);
  return next;
}

export function deleteModelById(id: string, currentModels = getModelList()) {
  const next = currentModels.filter((model) => model.id !== id);
  saveModelList(next);
  void deleteSupabaseRows("models", [id]);
  return next;
}

export function deleteProductBySlug(slug: string) {
  const next = getProductsFromStoreSync().filter((product) => product.slug !== slug);
  saveProductsToStore(next);
  return next;
}

export function upsertBrand(input: Partial<Brand> & Pick<Brand, "name">): Brand {
  const brandsList = getBrandList();
  const nextBrand: Brand = {
    id: input.id ?? `brand-${slugify(input.name)}`,
    name: input.name,
    slug: input.slug ?? slugify(input.name),
    logo: input.logo ?? "/RO1.jpeg",
    description: input.description ?? "",
    status: input.status ?? "active",
    createdAt: input.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const index = brandsList.findIndex((brand) => brand.id === nextBrand.id || brand.slug === nextBrand.slug);
  const updated = [...brandsList];
  if (index >= 0) {
    updated[index] = nextBrand;
  } else {
    updated.push(nextBrand);
  }

  writeLocalCatalog("vini-brands", updated);
  return nextBrand;
}

export function upsertModel(input: Partial<ProductModel> & Pick<ProductModel, "name" | "brandId">): ProductModel {
  const models = getModelList();
  const nextModel: ProductModel = {
    id: input.id ?? `model-${slugify(input.name)}-${input.brandId}`,
    name: input.name,
    slug: input.slug ?? slugify(input.name),
    brandId: input.brandId,
    description: input.description ?? "",
    image: input.image ?? "/RO1.jpeg",
    gallery: input.gallery && input.gallery.length ? input.gallery : [input.image ?? "/RO1.jpeg"],
    colors: input.colors ?? [],
    price: input.price,
    newArrival: input.newArrival ?? false,
    bestSeller: input.bestSeller ?? false,
    featured: input.featured ?? false,
    deal: input.deal ?? false,
    status: input.status ?? "active",
    createdAt: input.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const index = models.findIndex((model) => model.id === nextModel.id || (model.slug === nextModel.slug && model.brandId === nextModel.brandId));
  const updated = [...models];
  if (index >= 0) {
    updated[index] = nextModel;
  } else {
    updated.push(nextModel);
  }

  saveModelList(updated);
  return nextModel;
}

export function upsertProduct(input: Partial<Product> & Pick<Product, "name" | "brand" | "brandId" | "price" | "category">): Product {
  const allProducts = getProductsFromStoreSync();
  const modelName = input.model ?? input.name;
  const nextProduct: Product = {
    id: input.id ?? `prod-${slugify(input.name)}-${input.brandId}`,
    name: input.name,
    slug: input.slug ?? slugify(input.name),
    category: input.category,
    brand: input.brand,
    brandId: input.brandId,
    model: modelName,
    modelId: input.modelId ?? `model-${slugify(modelName)}-${input.brandId}`,
    modelSlug: input.modelSlug ?? slugify(modelName),
    price: input.price,
    compareAtPrice: input.compareAtPrice,
    inventory: input.inventory ?? 1,
    image: input.image ?? "/RO1.jpeg",
    gallery: input.gallery && input.gallery.length ? input.gallery : [input.image ?? "/RO1.jpeg"],
    description: input.description ?? "",
    shortDescription: input.shortDescription ?? input.description ?? "",
    badge: input.badge,
    featured: input.featured ?? false,
    newArrival: input.newArrival ?? false,
    bestSeller: input.bestSeller ?? false,
    deal: input.deal ?? false,
    sku: input.sku ?? `SKU-${slugify(input.name).toUpperCase()}`,
    stockStatus: input.stockStatus ?? "in-stock",
    status: input.status ?? "active",
    specifications: input.specifications ?? {},
    features: input.features ?? [],
    technology: input.technology,
    capacity: input.capacity,
    warranty: input.warranty,
  };

  const index = allProducts.findIndex((product) => product.id === nextProduct.id || product.slug === nextProduct.slug);
  const updated = [...allProducts];
  if (index >= 0) {
    updated[index] = nextProduct;
  } else {
    updated.push(nextProduct);
  }

  saveProductsToStore(updated);
  return nextProduct;
}

export async function getProductsFromStore(): Promise<Product[]> {
  if (!hasSupabaseConfig()) {
    return getProductsFromStoreSync();
  }

  try {
    const { supabase } = await import("@/lib/supabase");
    if (!supabase) {
      return getProductsFromStoreSync();
    }
    const { data, error } = await supabase.from("products").select("*").limit(50);
    if (error || !data) {
      return getProductsFromStoreSync();
    }

    return data.map((row: Record<string, unknown>) => ({
      id: String(row.id ?? row.slug ?? row.name ?? "product"),
      name: String(row.name ?? "Product"),
      slug: String(row.slug ?? String(row.name ?? "product").toLowerCase().replace(/\s+/g, "-")),
      category: String(row.category ?? "ro"),
      brand: String(row.brand ?? "VINI"),
      brandId: row.brandId ? String(row.brandId) : undefined,
      model: row.model ? String(row.model) : undefined,
      modelId: row.modelId ? String(row.modelId) : undefined,
      modelSlug: row.modelSlug ? String(row.modelSlug) : undefined,
      price: Number(row.price ?? 0),
      compareAtPrice: row.compare_at_price !== undefined ? Number(row.compare_at_price) : row.compareAtPrice !== undefined ? Number(row.compareAtPrice) : undefined,
      inventory: Number(row.inventory ?? 0),
      image: String(row.image ?? row.image_url ?? "/RO1.jpeg"),
      gallery: Array.isArray(row.gallery) ? row.gallery.map((item) => String(item)) : [String(row.image ?? row.image_url ?? "/RO1.jpeg")],
      description: String(row.description ?? ""),
      shortDescription: String(row.short_description ?? row.shortDescription ?? String(row.description ?? "")),
      badge: row.badge ? String(row.badge) : undefined,
      featured: Boolean(row.featured),
      newArrival: Boolean(row.new_arrival ?? row.newArrival),
      bestSeller: Boolean(row.best_seller ?? row.bestSeller),
      deal: Boolean(row.deal),
      sku: String(row.sku ?? ""),
      stockStatus: (row.stock_status ?? row.stockStatus ?? "in-stock") as Product["stockStatus"],
      status: (row.status ?? "active") as Product["status"],
      specifications: typeof row.specifications === "object" && row.specifications ? (row.specifications as Record<string, string>) : undefined,
      features: Array.isArray(row.features) ? row.features.map((item) => String(item)) : undefined,
      technology: row.technology ? String(row.technology) : undefined,
      capacity: row.capacity ? String(row.capacity) : undefined,
      warranty: row.warranty ? String(row.warranty) : undefined,
    }));
  } catch {
    return getProductsFromStoreSync();
  }
}

export async function getProductBySlugFromStore(slug: string): Promise<Product | undefined> {
  const productsFromStore = await getProductsFromStore();
  return productsFromStore.find((product) => product.slug === slug);
}

export const serviceCatalog = [
  { slug: "repair", name: "Repair", description: "Diagnostics and repair for RO systems." },
  { slug: "general-service", name: "General Service", description: "Routine cleaning and performance checks." },
  { slug: "maintenance", name: "Maintenance", description: "Scheduled upkeep and part replacement." },
  { slug: "amc", name: "AMC", description: "Annual maintenance contract for eligible Ahmedabad customers." },
  { slug: "other-ro-support", name: "Other RO Support", description: "Additional RO support and troubleshooting." },
];

export function calculateOrderSummary(cart: Array<{ product: Product; quantity: number }>) {
  const subtotal = cart.reduce((total, line) => total + line.product.price * line.quantity, 0);
  const gst = subtotal * 0.18;
  const shipping = subtotal > 0 && subtotal < 5000 ? 199 : 0;
  const grandTotal = subtotal + gst + shipping;

  return {
    subtotal,
    gst,
    shipping,
    grandTotal,
    itemCount: cart.reduce((total, line) => total + line.quantity, 0),
  };
}

export const productHighlights = [
  "Premium RO products",
  "Service-first support",
  "Customer-first support",
  "Transparent pricing",
  "Professional maintenance",
];
