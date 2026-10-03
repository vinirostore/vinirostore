import { NextResponse } from "next/server";
import { authorizeAdminApi } from "@/lib/admin-api";

export const runtime = "nodejs";

type OrderMetric = { customer_id: string; created_at: string; payment_status: string; status: string; total: number };

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function GET(request: Request) {
  const supabase = await authorizeAdminApi(request);
  if (!supabase) return jsonError("Admin verification is required.", 401);

  const orders: OrderMetric[] = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await supabase.from("orders")
      .select("customer_id,created_at,payment_status,status,total")
      .order("created_at", { ascending: false })
      .range(offset, offset + 999);
    if (error) return jsonError("Could not load sales data from Supabase.", 503);
    orders.push(...(data as OrderMetric[] || []));
    if (!data || data.length < 1000) break;
  }

  const [productsResult, accessoriesResult, modelsResult] = await Promise.all([
    supabase.from("products").select("inventory,model_id,model,model_slug"),
    supabase.from("accessories").select("stock"),
    supabase.from("models").select("id,name,slug,inventory"),
  ]);
  const inventoryError = productsResult.error || accessoriesResult.error || modelsResult.error;
  let inventory: { totalStock: number; lowStock: number; outOfStock: number } | null = null;
  let inventoryErrorMessage: string | undefined;
  if (inventoryError) {
    inventoryErrorMessage = modelsResult.error?.message.toLowerCase().includes("inventory")
      ? "Supabase is missing models.inventory. Run supabase/migrations/20261003_add_model_inventory.sql in the Supabase SQL Editor, then reload."
      : `Could not load inventory metrics from Supabase: ${inventoryError.message}`;
  } else {
    const products = productsResult.data || [];
    const unlinkedModels = (modelsResult.data || []).filter((model) => !products.some((product) =>
      product.model_id === model.id
      || String(product.model_slug || "").toLowerCase() === String(model.slug).toLowerCase()
      || String(product.model || "").toLowerCase() === String(model.name).toLowerCase(),
    ));
    const stocks = [
      ...products.map((product) => Number(product.inventory || 0)),
      ...(accessoriesResult.data || []).map((accessory) => Number(accessory.stock || 0)),
      ...unlinkedModels.map((model) => Number(model.inventory || 0)),
    ];
    inventory = {
      totalStock: stocks.reduce((sum, stock) => sum + stock, 0),
      lowStock: stocks.filter((stock) => stock > 0 && stock <= 10).length,
      outOfStock: stocks.filter((stock) => stock === 0).length,
    };
  }

  const paidOrders = orders.filter((order) => order.payment_status === "paid" && order.status !== "cancelled");
  const dayKeys = Array.from({ length: 7 }, (_, index) => {
    const day = new Date();
    day.setUTCHours(0, 0, 0, 0);
    day.setUTCDate(day.getUTCDate() - (6 - index));
    return day.toISOString().slice(0, 10);
  });
  const salesByDay = dayKeys.map((date) => ({
    date,
    total: paidOrders.reduce((sum, order) => order.created_at.slice(0, 10) === date ? sum + Number(order.total || 0) : sum, 0),
  }));

  return NextResponse.json({
    metrics: {
      sales: paidOrders.reduce((sum, order) => sum + Number(order.total || 0), 0),
      orders: orders.length,
      pending: orders.filter((order) => order.payment_status === "pending" && order.status !== "cancelled").length,
      customers: new Set(orders.map((order) => order.customer_id)).size,
    },
    inventory,
    inventoryError: inventoryErrorMessage,
    salesByDay,
  }, { headers: { "Cache-Control": "no-store" } });
}