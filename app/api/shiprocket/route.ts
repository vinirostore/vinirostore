import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  ADMIN_ACCESS_COOKIE,
  ADMIN_EMAIL,
  verifyAdminAccessGrant,
} from "@/lib/admin-access";
import {
  assignShiprocketCourier,
  createShiprocketOrder,
  getShiprocketCouriers,
  readShiprocketAssignment,
} from "@/lib/shiprocket";

export const runtime = "nodejs";

type ShippingOrder = {
  id: string;
  order_number: string;
  customer_id: string;
  status: string;
  payment_status: string;
  shipping_name: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_pincode: string;
  shipping_phone: string;
  subtotal: number;
  shipping: number;
  total: number;
  created_at: string;
  shiprocket_order_id: string | null;
  shiprocket_shipment_id: string | null;
  shiprocket_awb_code: string | null;
  shiprocket_courier_name: string | null;
  shiprocket_tracking_url: string | null;
  shiprocket_payment_method: string | null;
  package_weight_kg: number | null;
  package_length_cm: number | null;
  package_breadth_cm: number | null;
  package_height_cm: number | null;
};

type DispatchInput = {
  action?: unknown;
  orderId?: unknown;
  state?: unknown;
  paymentMethod?: unknown;
  weightKg?: unknown;
  lengthCm?: unknown;
  breadthCm?: unknown;
  heightCm?: unknown;
  courierId?: unknown;
};

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}

async function authorizeAdmin(request: Request) {
  const authorization = request.headers.get("authorization") || "";
  const accessToken = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const cookieStore = await cookies();
  const grant = verifyAdminAccessGrant(cookieStore.get(ADMIN_ACCESS_COOKIE)?.value);

  if (!accessToken || !supabaseUrl || !supabaseAnonKey || !grant) return null;

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error || data.user?.id !== grant.userId || data.user.email?.trim().toLowerCase() !== ADMIN_EMAIL) return null;

  return supabase;
}

function validPositiveNumber(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}

async function loadOrder(supabase: SupabaseClient, orderId: string) {
  const { data, error } = await supabase.from("orders").select(
    "id,order_number,customer_id,status,payment_status,shipping_name,shipping_address,shipping_city,shipping_state,shipping_pincode,shipping_phone,subtotal,shipping,total,created_at,shiprocket_order_id,shiprocket_shipment_id,shiprocket_awb_code,shiprocket_courier_name,shiprocket_tracking_url,shiprocket_payment_method,package_weight_kg,package_length_cm,package_breadth_cm,package_height_cm",
  ).eq("id", orderId).maybeSingle();
  if (error) throw new Error(error.message);
  return data as ShippingOrder | null;
}

export async function GET(request: Request) {
  const supabase = await authorizeAdmin(request);
  if (!supabase) return jsonError("Admin verification is required.", 401);

  const { data: orders, error } = await supabase.from("orders").select(
    "id,order_number,customer_id,status,payment_status,shipping_name,shipping_address,shipping_city,shipping_state,shipping_pincode,shipping_phone,subtotal,shipping,total,created_at,shiprocket_order_id,shiprocket_shipment_id,shiprocket_awb_code,shiprocket_courier_name,shiprocket_tracking_url,shiprocket_payment_method,package_weight_kg,package_length_cm,package_breadth_cm,package_height_cm",
  ).neq("status", "cancelled").order("created_at", { ascending: false }).limit(100);

  if (error) return jsonError(error.message, 500);
  if (!orders?.length) return NextResponse.json({ orders: [] }, { headers: { "Cache-Control": "no-store" } });

  const orderIds = orders.map((order) => String(order.id));
  const customerIds = [...new Set(orders.map((order) => String(order.customer_id)))];
  const [itemsResult, profilesResult] = await Promise.all([
    supabase.from("order_items").select("order_id,product_name,sku,unit_price,quantity").in("order_id", orderIds),
    supabase.from("profiles").select("id,email").in("id", customerIds),
  ]);
  if (itemsResult.error || profilesResult.error) return jsonError("Unable to load order shipping details.", 500);

  const itemsByOrder = new Map<string, typeof itemsResult.data>();
  for (const item of itemsResult.data || []) {
    const orderItems = itemsByOrder.get(item.order_id) || [];
    orderItems.push(item);
    itemsByOrder.set(item.order_id, orderItems);
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

export async function POST(request: Request) {
  const supabase = await authorizeAdmin(request);
  if (!supabase) return jsonError("Admin verification is required.", 401);

  let input: DispatchInput;
  try {
    input = await request.json() as DispatchInput;
  } catch {
    return jsonError("Invalid dispatch request.");
  }

  const orderId = typeof input.orderId === "string" ? input.orderId : "";
  const action = input.action;
  const state = typeof input.state === "string" ? input.state.trim() : "";
  const paymentMethod = input.paymentMethod === "COD" ? "COD" : input.paymentMethod === "Prepaid" ? "Prepaid" : "";
  const weightKg = validPositiveNumber(input.weightKg);
  const lengthCm = validPositiveNumber(input.lengthCm);
  const breadthCm = validPositiveNumber(input.breadthCm);
  const heightCm = validPositiveNumber(input.heightCm);
  const courierId = Number(input.courierId);

  if (!orderId || !["rates", "dispatch"].includes(String(action))) return jsonError("Invalid order or shipping action.");
  if (!state || !paymentMethod || !weightKg || !lengthCm || !breadthCm || !heightCm) {
    return jsonError("Enter the delivery state, payment method, package weight, and all three package dimensions.");
  }

  try {
    const order = await loadOrder(supabase, orderId);
    if (!order) return jsonError("Order not found.", 404);
    if (order.status === "cancelled" || order.status === "delivered") return jsonError("This order cannot be dispatched.", 409);
    if (!/^\d{6}$/.test(order.shipping_pincode)) return jsonError("The delivery pincode must contain 6 digits.");
    if (paymentMethod === "Prepaid" && order.payment_status !== "paid") {
      return jsonError("Prepaid orders can only be dispatched after payment is verified.", 409);
    }
    if (action === "dispatch" && order.shiprocket_awb_code) {
      return NextResponse.json({
        shipment: {
          awb: order.shiprocket_awb_code,
          courier: order.shiprocket_courier_name,
          trackingUrl: order.shiprocket_tracking_url,
        },
      }, { headers: { "Cache-Control": "no-store" } });
    }

    const couriers = await getShiprocketCouriers({
      deliveryPincode: order.shipping_pincode,
      weightKg,
      isCod: paymentMethod === "COD",
    });
    if (!couriers.length) return jsonError("Shiprocket returned no available courier services for this delivery.", 422);

    if (action === "rates") {
      return NextResponse.json({ couriers }, { headers: { "Cache-Control": "no-store" } });
    }

    if (!Number.isInteger(courierId) || !couriers.some((courier) => courier.id === courierId)) {
      return jsonError("Select an available courier before dispatching.");
    }

    let shipmentId = order.shiprocket_shipment_id || "";
    if (!shipmentId) {
      const itemsResult = await supabase.from("order_items").select("product_name,sku,unit_price,quantity").eq("order_id", order.id);
      const profileResult = await supabase.from("profiles").select("email").eq("id", order.customer_id).maybeSingle();
      if (itemsResult.error || profileResult.error) return jsonError("Unable to load customer or product details for shipping.", 500);
      if (!itemsResult.data?.length) return jsonError("This order has no items to dispatch.", 409);

      const pickupLocation = process.env.SHIPROCKET_PICKUP_LOCATION;
      if (!pickupLocation) return jsonError("Set SHIPROCKET_PICKUP_LOCATION to the pickup name registered in Shiprocket.", 503);

      const customerNames = order.shipping_name.trim().split(/\s+/);
      const firstName = customerNames.shift() || order.shipping_name;
      const lastName = customerNames.join(" ") || "-";
      const phone = order.shipping_phone.replace(/\D/g, "").slice(-10);
      if (phone.length !== 10) return jsonError("The delivery phone number must contain 10 digits.");

      const remoteOrder = await createShiprocketOrder({
        order_id: order.order_number,
        order_date: new Date(order.created_at).toISOString().slice(0, 16).replace("T", " "),
        pickup_location: pickupLocation,
        billing_customer_name: firstName,
        billing_last_name: lastName,
        billing_address: order.shipping_address,
        billing_city: order.shipping_city,
        billing_pincode: order.shipping_pincode,
        billing_state: state,
        billing_country: "India",
        billing_email: profileResult.data?.email || "",
        billing_phone: phone,
        shipping_is_billing: true,
        order_items: itemsResult.data.map((item) => ({
          name: item.product_name,
          sku: item.sku || item.product_name,
          units: item.quantity,
          selling_price: item.unit_price,
          discount: 0,
          tax: 0,
        })),
        payment_method: paymentMethod,
        shipping_charges: order.shipping,
        giftwrap_charges: 0,
        transaction_charges: 0,
        total_discount: 0,
        sub_total: order.subtotal,
        length: lengthCm,
        breadth: breadthCm,
        height: heightCm,
        weight: weightKg,
      });
      shipmentId = String(remoteOrder.shipment_id || "");
      if (!shipmentId) return jsonError("Shiprocket created an order but did not return a shipment ID.", 502);

      const { error: saveError } = await supabase.from("orders").update({
        shipping_state: state,
        shiprocket_order_id: String(remoteOrder.order_id || ""),
        shiprocket_shipment_id: shipmentId,
        shiprocket_payment_method: paymentMethod,
        package_weight_kg: weightKg,
        package_length_cm: lengthCm,
        package_breadth_cm: breadthCm,
        package_height_cm: heightCm,
      }).eq("id", order.id);
      if (saveError) return jsonError("Shiprocket created the shipment, but the order could not save its shipment ID. Contact support before retrying.", 500);
    }

    const assignment = await assignShiprocketCourier(String(shipmentId), courierId);
    const { awb, courier } = readShiprocketAssignment(assignment);
    if (!awb) return jsonError("Shiprocket created the shipment but did not return an AWB. Retry courier assignment from the shipping screen.", 502);

    const trackingUrl = `https://shiprocket.co/tracking/${encodeURIComponent(awb)}`;
    const { error: updateError } = await supabase.from("orders").update({
      status: "shipped",
      shiprocket_awb_code: awb,
      shiprocket_courier_name: courier || couriers.find((item) => item.id === courierId)?.name || "Courier",
      shiprocket_tracking_url: trackingUrl,
    }).eq("id", order.id);
    if (updateError) return jsonError("Shiprocket assigned the courier, but tracking details could not be saved.", 500);

    return NextResponse.json({ shipment: { awb, courier, trackingUrl } }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Shiprocket dispatch failed.", 502);
  }
}