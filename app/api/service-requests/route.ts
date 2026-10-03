import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { authenticatePaymentCustomer, getPaymentAdminClient } from "@/lib/payment-auth";

export const runtime = "nodejs";

type BookingInput = {
  requestType?: unknown;
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  subject?: unknown;
  message?: unknown;
  city?: unknown;
  address?: unknown;
};

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function GET(request: Request) {
  const qrValue = new URL(request.url).searchParams.get("qrValue")?.trim() || "";
  if (!qrValue || qrValue.length > 80) return jsonError("A valid service QR is required.");

  try {
    const supabase = getPaymentAdminClient();
    const { data, error } = await supabase.from("service_requests")
      .select("id,request_type,subject,status")
      .eq("qr_value", qrValue)
      .in("request_type", ["service", "amc"])
      .maybeSingle();
    if (error) return jsonError("Could not load service status.", 503);
    if (!data) return jsonError("Service booking not found.", 404);
    return NextResponse.json({ request: data }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return jsonError("Could not load service status.", 503);
  }
}

export async function POST(request: Request) {
  let input: BookingInput;
  try {
    input = await request.json() as BookingInput;
  } catch {
    return jsonError("Invalid service booking.");
  }

  const requestType = input.requestType === "amc" ? "amc" : input.requestType === "service" ? "service" : "";
  const name = text(input.name);
  const email = text(input.email).toLowerCase();
  const phone = text(input.phone);
  const subject = text(input.subject);
  const message = text(input.message);
  const city = text(input.city);
  const address = text(input.address);
  const phoneDigits = phone.replace(/\D/g, "");

  if (!requestType || name.length < 2 || name.length > 100 || !/^\S+@\S+\.\S+$/.test(email) || phoneDigits.length < 10 || phoneDigits.length > 13 || subject.length < 2 || subject.length > 160 || message.length < 8 || message.length > 2000 || city.length < 2 || city.length > 100 || address.length < 5 || address.length > 500) {
    return jsonError("Enter your name, valid email and phone, service details, city, and full address.");
  }

  const authorization = request.headers.get("authorization") || "";
  if (!authorization.startsWith("Bearer ")) return jsonError("Sign in or create an account to book a service.", 401);
  const identity = await authenticatePaymentCustomer(request);
  if (!identity) return jsonError("Your sign-in expired. Sign in again to book a service.", 401);

  try {
    const supabase = getPaymentAdminClient();
    const serviceId = randomUUID();
    const { data, error } = await supabase.from("service_requests").insert({
      id: serviceId,
      customer_id: identity.user.id,
      request_type: requestType,
      name,
      email,
      phone,
      subject,
      message,
      city,
      address,
      qr_value: serviceId,
      status: "open",
    }).select("id,qr_value,request_type,subject,status,created_at").single();

    if (error || !data) return jsonError(error?.message || "Could not save your request.", 503);
    return NextResponse.json({ request: data }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Could not save your request.", 503);
  }
}