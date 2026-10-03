import { NextResponse } from "next/server";
import { authorizeAdminApi } from "@/lib/admin-api";

export const runtime = "nodejs";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function GET(request: Request) {
  const supabase = await authorizeAdminApi(request);
  if (!supabase) return jsonError("Admin verification is required.", 401);

  const orders = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await supabase.from("orders")
      .select("id,order_number,customer_id,status,payment_status,shipping_name,shipping_phone,shipping_address,shipping_city,shipping_state,shipping_pincode,subtotal,shipping,total,created_at")
      .order("created_at", { ascending: false })
      .range(offset, offset + 999);
    if (error) return jsonError("Could not load orders from Supabase.", 503);
    orders.push(...(data || []));
    if (!data || data.length < 1000) break;
  }

  if (!orders.length) return NextResponse.json({ orders: [] }, { headers: { "Cache-Control": "no-store" } });

  const orderIds = orders.map((order) => String(order.id));
  const customerIds = [...new Set(orders.map((order) => String(order.customer_id)))];
  const [itemsResult, profilesResult] = await Promise.all([
    supabase.from("order_items").select("order_id,product_name,quantity,line_total").in("order_id", orderIds),
    supabase.from("profiles").select("id,email").in("id", customerIds),
  ]);
  if (itemsResult.error || profilesResult.error) return jsonError("Could not load order details from Supabase.", 503);

  const itemsByOrder = new Map<string, typeof itemsResult.data>();
  for (const item of itemsResult.data || []) {
    const items = itemsByOrder.get(item.order_id) || [];
    items.push(item);
    itemsByOrder.set(item.order_id, items);
  }
  const emailsByCustomer = new Map((profilesResult.data || []).map((profile) => [profile.id, profile.email]));

  return NextResponse.json({
    orders: orders.map((order) => ({
      ...order,
      customer_email: emailsByCustomer.get(order.customer_id) || "",
      items: itemsByOrder.get(order.id) || [],
    })),
  }, { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(request: Request) {
  const supabase = await authorizeAdminApi(request);
  if (!supabase) return jsonError("Admin verification is required.", 401);

  let input: { id?: unknown; status?: unknown };
  try {
    input = await request.json() as typeof input;
  } catch {
    return jsonError("Invalid order update.");
  }

  const id = typeof input.id === "string" ? input.id.trim() : "";
  if (!id || input.status !== "delivered") return jsonError("Only delivered order status updates are supported.");

  const { data, error } = await supabase.from("orders").update({ status: "delivered" })
    .eq("id", id)
    .eq("payment_status", "paid")
    .in("status", ["processing", "shipped"])
    .select("id,status")
    .maybeSingle();

  if (error) return jsonError("Could not update order status.", 503);
  if (!data) return jsonError("Only paid processing or shipped orders can be marked delivered.", 409);

  return NextResponse.json({ order: data }, { headers: { "Cache-Control": "no-store" } });
}