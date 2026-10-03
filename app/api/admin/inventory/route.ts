import { NextResponse } from "next/server";
import { authorizeAdminApi } from "@/lib/admin-api";

export const runtime = "nodejs";

type InventoryKind = "product" | "accessory" | "model";
type InventoryResponseItem = {
  id: string;
  kind: InventoryKind;
  name: string;
  category: string;
  brand: string;
  model: string;
  sku: string;
  price: number;
  stock: number;
  image: string;
  active: boolean;
};

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}

function normalized(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

export async function GET(request: Request) {
  const supabase = await authorizeAdminApi(request);
  if (!supabase) return jsonError("Admin verification is required.", 401);

  const [productsResult, accessoriesResult, modelsResult] = await Promise.all([
    supabase.from("products").select("id,name,slug,category,brand,model,model_id,model_slug,price,inventory,image,sku,stock_status,status"),
    supabase.from("accessories").select("id,name,slug,category,price,stock,image,status"),
    supabase.from("models").select("id,name,slug,brand_id,inventory,status"),
  ]);
  if (productsResult.error || accessoriesResult.error) {
    const message = productsResult.error?.message || accessoriesResult.error?.message;
    return jsonError(`Could not load product and accessory inventory from Supabase: ${message}`, 503);
  }
  if (modelsResult.error) {
    const missingModelStockColumn = modelsResult.error.message.toLowerCase().includes("inventory");
    return jsonError(missingModelStockColumn
      ? "Supabase is missing models.inventory. Run supabase/migrations/20261003_add_model_inventory.sql in the Supabase SQL Editor, then reload."
      : `Could not load model inventory from Supabase: ${modelsResult.error.message}`, 503);
  }

  const products = productsResult.data || [];
  const linkedModelIds = new Set<string>();
  const items: InventoryResponseItem[] = products.map((product) => {
    if (product.model_id) linkedModelIds.add(String(product.model_id));
    return {
      id: String(product.id),
      kind: "product" as const,
      name: String(product.name),
      category: String(product.category || "Product"),
      brand: String(product.brand || ""),
      model: String(product.model || ""),
      sku: String(product.sku || ""),
      price: Number(product.price || 0),
      stock: Number(product.inventory || 0),
      image: String(product.image || ""),
      active: product.status === "active",
    };
  });

  for (const model of modelsResult.data || []) {
    const hasProduct = linkedModelIds.has(String(model.id)) || products.some((product) =>
      normalized(product.model_slug) === normalized(model.slug)
      || normalized(product.model) === normalized(model.name),
    );
    if (hasProduct) continue;
    items.push({
      id: String(model.id),
      kind: "model" as const,
      name: String(model.name),
      category: "Model",
      brand: "",
      model: "",
      sku: `MODEL-${String(model.id)}`,
      price: 0,
      stock: Number(model.inventory || 0),
      image: "",
      active: model.status === "active",
    });
  }

  for (const accessory of accessoriesResult.data || []) {
    items.push({
      id: String(accessory.id),
      kind: "accessory" as const,
      name: String(accessory.name),
      category: String(accessory.category || "Accessory"),
      brand: "",
      model: "",
      sku: "",
      price: Number(accessory.price || 0),
      stock: Number(accessory.stock || 0),
      image: String(accessory.image || ""),
      active: accessory.status === "active",
    });
  }

  items.sort((left, right) => left.name.localeCompare(right.name));
  return NextResponse.json({ items }, { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(request: Request) {
  const supabase = await authorizeAdminApi(request);
  if (!supabase) return jsonError("Admin verification is required.", 401);

  let input: { id?: unknown; kind?: unknown; stock?: unknown };
  try {
    input = await request.json() as typeof input;
  } catch {
    return jsonError("Invalid inventory update.");
  }

  const id = typeof input.id === "string" ? input.id.trim() : "";
  const kind = input.kind as InventoryKind;
  const stock = Number(input.stock);
  if (!id || !["product", "accessory", "model"].includes(kind) || !Number.isSafeInteger(stock) || stock < 0 || stock > 1000000) {
    return jsonError("Enter a valid catalog item and stock quantity.");
  }

  const table = kind === "product" ? "products" : kind === "accessory" ? "accessories" : "models";
  const stockColumn = kind === "accessory" ? "stock" : "inventory";
  const values: Record<string, number | string> = { [stockColumn]: stock };
  if (kind === "product") values.stock_status = stock === 0 ? "out-of-stock" : stock <= 10 ? "low-stock" : "in-stock";

  const { data, error } = await supabase.from(table).update(values).eq("id", id).select("id").maybeSingle();
  if (error) {
    const missingModelStockColumn = kind === "model" && error.message.toLowerCase().includes("inventory");
    return jsonError(missingModelStockColumn
      ? "Supabase is missing models.inventory. Run supabase/migrations/20261003_add_model_inventory.sql in the Supabase SQL Editor, then retry."
      : `Could not save stock to Supabase: ${error.message}`, 503);
  }
  if (!data) return jsonError("Catalog item not found.", 404);

  return NextResponse.json({ id, kind, stock }, { headers: { "Cache-Control": "no-store" } });
}