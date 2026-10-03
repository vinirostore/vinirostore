import { NextResponse } from "next/server";
import { authorizeAdminApi } from "@/lib/admin-api";

export const runtime = "nodejs";

type AccessoryInput = {
  id?: unknown;
  name?: unknown;
  slug?: unknown;
  category?: unknown;
  price?: unknown;
  stock?: unknown;
  image?: unknown;
  shortDescription?: unknown;
  description?: unknown;
  features?: unknown;
  status?: unknown;
  featured?: unknown;
  createdAt?: unknown;
};

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const supabase = await authorizeAdminApi(request);
  if (!supabase) return jsonError("Admin verification is required. Sign in again and retry.", 401);

  let input: { accessories?: unknown };
  try {
    input = await request.json() as typeof input;
  } catch {
    return jsonError("Invalid accessory save request.");
  }

  if (!Array.isArray(input.accessories) || input.accessories.length < 1 || input.accessories.length > 100) {
    return jsonError("Save between 1 and 100 accessories at a time.");
  }

  const rows = [];
  for (const value of input.accessories as AccessoryInput[]) {
    const id = typeof value.id === "string" ? value.id.trim() : "";
    const name = typeof value.name === "string" ? value.name.trim() : "";
    const slug = typeof value.slug === "string" ? value.slug.trim() : "";
    const category = typeof value.category === "string" ? value.category.trim() : "general";
    const price = Number(value.price);
    const stock = Number(value.stock);
    const image = typeof value.image === "string" ? value.image : "/RO1.jpeg";
    const status = value.status === "inactive" ? "inactive" : "active";

    if (!id || !name || !slug || !Number.isFinite(price) || price < 0 || !Number.isSafeInteger(stock) || stock < 0) {
      return jsonError("Each accessory needs a name, slug, non-negative price, and whole-number stock quantity.");
    }
    if (image.length > 1500000) {
      return jsonError(`The image for ${name} is too large. Use a compressed image under 1 MB or a hosted image URL.`);
    }

    rows.push({
      id,
      name,
      slug,
      category,
      price,
      stock,
      image,
      short_description: typeof value.shortDescription === "string" ? value.shortDescription : "",
      description: typeof value.description === "string" ? value.description : "",
      features: Array.isArray(value.features) ? value.features.filter((feature): feature is string => typeof feature === "string") : [],
      status,
      featured: Boolean(value.featured),
      created_at: typeof value.createdAt === "string" ? value.createdAt : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  const { error } = await supabase.from("accessories").upsert(rows, { onConflict: "id" });
  if (error) return jsonError(`Supabase could not save the accessory: ${error.message}`, 503);

  return NextResponse.json({ saved: rows.length }, { headers: { "Cache-Control": "no-store" } });
}