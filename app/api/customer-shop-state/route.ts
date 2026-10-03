import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { authenticatePaymentCustomer, getPaymentAdminClient } from "@/lib/payment-auth";

export const runtime = "nodejs";
const GUEST_COOKIE = "vini-guest-shop";
const guestIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}

async function getIdentity(request: Request) {
  const authorization = request.headers.get("authorization") || "";
  if (!authorization.startsWith("Bearer ")) return { user: null, invalidToken: false };
  const identity = await authenticatePaymentCustomer(request);
  return { user: identity?.user || null, invalidToken: !identity };
}

export async function GET(request: Request) {
  const { user, invalidToken } = await getIdentity(request);
  if (invalidToken) return jsonError("Your sign-in expired. Sign in again to load saved shopping data.", 401);
  const cookieStore = await cookies();
  let guestId = cookieStore.get(GUEST_COOKIE)?.value || "";
  let shouldSetCookie = false;
  if (!guestIdPattern.test(guestId)) {
    guestId = randomUUID();
    shouldSetCookie = true;
  }

  try {
    const supabase = getPaymentAdminClient();
    const [customerResult, guestResult] = await Promise.all([
      user
        ? supabase.from("customer_shop_state").select("cart,wishlist,updated_at").eq("customer_id", user.id).maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      supabase.from("guest_shop_state").select("cart,wishlist,updated_at").eq("guest_id", guestId).gt("expires_at", new Date().toISOString()).maybeSingle(),
    ]);
    if (customerResult.error) return jsonError(`Could not load your saved shopping data: ${customerResult.error.message}`, 503);
    if (guestResult.error) return jsonError(`Could not load your guest cart: ${guestResult.error.message}`, 503);
    const response = NextResponse.json({
      state: customerResult.data || { cart: [], wishlist: [], updated_at: null },
      guestState: guestResult.data || { cart: [], wishlist: [], updated_at: null },
    }, { headers: { "Cache-Control": "no-store" } });
    if (shouldSetCookie) response.cookies.set(GUEST_COOKIE, guestId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return response;
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Could not load your saved shopping data.", 503);
  }
}

export async function PUT(request: Request) {
  const { user, invalidToken } = await getIdentity(request);
  if (invalidToken) return jsonError("Your sign-in expired. Sign in again to save shopping data.", 401);
  const cookieStore = await cookies();
  const guestId = cookieStore.get(GUEST_COOKIE)?.value || "";
  if (!user && !guestIdPattern.test(guestId)) return jsonError("Could not identify your guest shopping session. Reload the page and retry.", 400);

  let input: { cart?: unknown; wishlist?: unknown };
  try {
    const body = await request.text();
    if (body.length > 1_000_000) return jsonError("Your cart or wishlist is too large to save.", 413);
    input = JSON.parse(body) as typeof input;
  } catch {
    return jsonError("Invalid shopping data.");
  }

  if (!Array.isArray(input.cart) || input.cart.length > 100 || !Array.isArray(input.wishlist) || input.wishlist.length > 500) {
    return jsonError("Your cart or wishlist contains too many items.");
  }
  for (const entry of input.cart) {
    if (!entry || typeof entry !== "object") return jsonError("Invalid cart item.");
    const line = entry as { quantity?: unknown; product?: { slug?: unknown; name?: unknown } };
    if (typeof line.product?.slug !== "string" || typeof line.product?.name !== "string" || !Number.isInteger(line.quantity) || Number(line.quantity) < 1 || Number(line.quantity) > 99) {
      return jsonError("Invalid cart item.");
    }
  }
  for (const entry of input.wishlist) {
    if (!entry || typeof entry !== "object" || typeof (entry as { slug?: unknown }).slug !== "string") return jsonError("Invalid wishlist item.");
  }

  try {
    const supabase = getPaymentAdminClient();
    const table = user ? "customer_shop_state" : "guest_shop_state";
    const { error } = await supabase.from(table).upsert({
      [user ? "customer_id" : "guest_id"]: user?.id || guestId,
      cart: input.cart,
      wishlist: input.wishlist,
      updated_at: new Date().toISOString(),
      ...(!user ? { expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() } : {}),
    }, { onConflict: user ? "customer_id" : "guest_id" });
    if (error) return jsonError(`Could not save your cart and wishlist: ${error.message}`, 503);
    if (user) {
      const { error: clearGuestError } = await supabase.from("guest_shop_state").delete().eq("guest_id", guestId);
      if (clearGuestError) return jsonError(`Shopping data was saved to your account, but the temporary guest copy could not be cleared: ${clearGuestError.message}`, 503);
    }
    const response = NextResponse.json({ saved: true }, { headers: { "Cache-Control": "no-store" } });
    if (user) response.cookies.set(GUEST_COOKIE, "", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 0 });
    return response;
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Could not save your cart and wishlist.", 503);
  }
}
