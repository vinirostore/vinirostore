import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { cashfreeRequest, getCashfreeEnvironment, type CashfreeOrder } from "@/lib/cashfree";
import { authenticatePaymentCustomer, getPaymentAdminClient } from "@/lib/payment-auth";

export const runtime = "nodejs";

type CheckoutInput = {
  name?: unknown;
  phone?: unknown;
  address?: unknown;
  city?: unknown;
  state?: unknown;
  pincode?: unknown;
  items?: unknown;
};

type CartItemInput = { productId?: unknown; quantity?: unknown; colorName?: unknown };
type CatalogRow = Record<string, unknown>;

function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  const identity = await authenticatePaymentCustomer(request);
  if (!identity) return errorResponse("Please sign in again before paying.", 401);
  if (!identity.user.email) return errorResponse("Your account needs a verified email address to continue.", 400);

  let input: CheckoutInput;
  try {
    input = await request.json() as CheckoutInput;
  } catch {
    return errorResponse("Invalid checkout request.");
  }

  const name = text(input.name);
  const phone = text(input.phone).replace(/\D/g, "").slice(-10);
  const address = text(input.address);
  const city = text(input.city);
  const state = text(input.state);
  const pincode = text(input.pincode).replace(/\D/g, "");
  if (name.length < 2 || name.length > 100 || address.length < 5 || city.length < 2 || state.length < 2 || phone.length !== 10 || !/^\d{6}$/.test(pincode)) {
    return errorResponse("Enter a valid name, 10-digit phone, full address, city, state, and 6-digit pincode.");
  }
  if (!Array.isArray(input.items) || input.items.length === 0 || input.items.length > 30) {
    return errorResponse("Your cart is empty or contains too many items.");
  }

  const quantities = new Map<string, { productId: string; quantity: number; colorName: string }>();
  for (const rawItem of input.items as CartItemInput[]) {
    const productId = text(rawItem.productId);
    const quantity = Number(rawItem.quantity);
    const colorName = text(rawItem.colorName);
    if (!productId || colorName.length > 80 || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
      return errorResponse("One or more cart items are invalid.");
    }
    const key = JSON.stringify([productId, colorName.toLowerCase()]);
    const current = quantities.get(key);
    quantities.set(key, { productId, colorName, quantity: (current?.quantity || 0) + quantity });
  }

  try {
    const supabase = getPaymentAdminClient();
    const cartItems = [...quantities.values()];
    const productIds = [...new Set(cartItems.map((item) => item.productId))];
    const [productsResult, accessoriesResult, profileResult] = await Promise.all([
      supabase.from("products").select("id,name,slug,sku,price,inventory,stock_status,status,image,model_id").in("id", productIds),
      supabase.from("accessories").select("id,name,slug,price,stock,status,image").in("id", productIds),
      supabase.from("profiles").select("email,full_name").eq("id", identity.user.id).maybeSingle(),
    ]);
    if (productsResult.error || accessoriesResult.error || profileResult.error) {
      return errorResponse("Unable to verify your cart or account. Please try again.", 503);
    }
    if (!profileResult.data) return errorResponse("Your customer profile could not be found.", 400);

    const productRows = (productsResult.data || []) as CatalogRow[];
    const modelIds = [...new Set(productRows.map((product) => text(product.model_id)).filter(Boolean))];
    const modelsResult = modelIds.length
      ? await supabase.from("models").select("id,color_name,image,colors").in("id", modelIds)
      : { data: [], error: null };
    if (modelsResult.error) return errorResponse("Unable to verify model color pricing. Please try again.", 503);

    const catalog = new Map<string, CatalogRow>();
    for (const row of productRows) catalog.set(String(row.id), row);
    for (const row of (accessoriesResult.data || []) as CatalogRow[]) {
      if (!catalog.has(String(row.id))) catalog.set(String(row.id), row);
    }
    const modelsById = new Map(((modelsResult.data || []) as CatalogRow[]).map((model) => [String(model.id), model]));

    const orderItems = [];
    let subtotal = 0;
    for (const cartItem of cartItems) {
      const { productId, quantity, colorName } = cartItem;
      const product = catalog.get(productId);
      if (!product || product.status === "inactive") return errorResponse("A cart item is no longer available. Refresh your cart and try again.", 409);
      let selectedColor: CatalogRow | null = null;
      let price = Number(product.price);
      if (colorName) {
        const modelId = text(product.model_id);
        const model = modelsById.get(modelId);
        if (!model) return errorResponse("This model no longer has the selected color. Refresh your cart and try again.", 409);

        if (Array.isArray(model.colors)) {
          selectedColor = (model.colors as CatalogRow[]).find((color) => text(color.name).toLowerCase() === colorName.toLowerCase()) || null;
          if (selectedColor && !selectedColor.isPrimary && selectedColor.price !== undefined && selectedColor.price !== null) {
            price = Number(selectedColor.price);
          }
        }
        if (!selectedColor) return errorResponse("This model color is no longer available. Refresh your cart and try again.", 409);
      }

      const stock = Number(product.inventory ?? product.stock);
      if (!Number.isFinite(price) || price <= 0 || !Number.isFinite(stock) || stock < quantity || product.stock_status === "out-of-stock") {
        return errorResponse(`${String(product.name || "A cart item")} is out of stock or no longer available.`, 409);
      }
      const itemSubtotal = Number((price * quantity).toFixed(2));
      subtotal += itemSubtotal;
      const suffix = colorName ? "-" + colorName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") : "";
      orderItems.push({
        product_id: productId,
        product_name: String(product.name || "Product") + (colorName ? ` (${colorName})` : ""),
        product_slug: String(product.slug || productId) + suffix,
        product_image: String(selectedColor?.image || product.image || ""),
        sku: String(product.sku || product.slug || productId) + suffix.toUpperCase(),
        unit_price: price,
        quantity,
        line_total: itemSubtotal,
      });
    }

    subtotal = Number(subtotal.toFixed(2));
    const shipping = subtotal > 0 && subtotal < 5000 ? 199 : 0;
    const total = Number((subtotal + shipping).toFixed(2));
    if (total < 1) return errorResponse("The payment total must be at least ₹1.");

    const cashfreeOrderId = "vini_" + randomUUID().replace(/-/g, "");
    const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL;
    const siteUrl = configuredSiteUrl ? configuredSiteUrl.replace(/\/$/, "") : new URL(request.url).origin;
    const returnUrl = new URL("/payment-result", siteUrl);
    returnUrl.searchParams.set("order_id", cashfreeOrderId);
    const orderMeta: Record<string, string> = {
      return_url: returnUrl.toString(),
    };
    if (siteUrl.startsWith("https://")) orderMeta.notify_url = siteUrl + "/api/cashfree/webhook";

    const cashfreeOrder = await cashfreeRequest<CashfreeOrder>("/orders", {
      method: "POST",
      body: JSON.stringify({
        order_id: cashfreeOrderId,
        order_amount: total,
        order_currency: "INR",
        customer_details: {
          customer_id: identity.user.id.replace(/-/g, "").slice(0, 50),
          customer_name: name,
          customer_email: profileResult.data.email,
          customer_phone: phone,
        },
        order_meta: orderMeta,
        order_note: ("VINI RO order for " + name).slice(0, 200),
      }),
    });

    if (!cashfreeOrder.payment_session_id || cashfreeOrder.order_status !== "ACTIVE") {
      return errorResponse("Cashfree did not create an active payment session. Please try again.", 502);
    }

    const { data: order, error: orderError } = await supabase.from("orders").insert({
      customer_id: identity.user.id,
      status: "pending",
      payment_status: "pending",
      shipping_name: name,
      shipping_address: address,
      shipping_city: city,
      shipping_state: state,
      shipping_pincode: pincode,
      shipping_phone: phone,
      subtotal,
      gst: Number((subtotal - subtotal / 1.18).toFixed(2)),
      shipping,
      total,
      cashfree_order_id: cashfreeOrderId,
    }).select("id,order_number").single();

    if (orderError || !order) return errorResponse("Payment session was created, but the order could not be saved. Contact support before retrying.", 500);

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems.map((item) => ({ ...item, order_id: order.id })));
    if (itemsError) {
      await supabase.from("orders").delete().eq("id", order.id);
      return errorResponse("The order items could not be saved. Please contact support before retrying.", 500);
    }

    return NextResponse.json({
      orderNumber: order.order_number,
      cashfreeOrderId,
      paymentSessionId: cashfreeOrder.payment_session_id,
      amount: total,
      environment: getCashfreeEnvironment(),
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Unable to start Cashfree checkout.", 502);
  }
}