import { NextResponse } from "next/server";
import { authorizeAdminApi } from "@/lib/admin-api";
import { getPaymentAdminClient } from "@/lib/payment-auth";

export const runtime = "nodejs";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function GET(request: Request) {
  const authorized = await authorizeAdminApi(request);
  if (!authorized) return jsonError("Admin verification is required.", 401);

  try {
    const supabase = getPaymentAdminClient();
    const { data, error } = await supabase.from("service_requests")
      .select("id,customer_id,request_type,name,email,phone,subject,message,city,address,qr_value,status,completed_by_name,completed_at,created_at")
      .neq("request_type", "enquiry")
      .order("created_at", { ascending: false })
      .limit(1000);
    if (error) return jsonError(`Could not load service bookings: ${error.message}`, 503);
    return NextResponse.json({ requests: data || [] }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Could not load service bookings.", 503);
  }
}

export async function PATCH(request: Request) {
  const authorized = await authorizeAdminApi(request);
  if (!authorized) return jsonError("Admin verification is required.", 401);

  let input: { qrValue?: unknown };
  try {
    input = await request.json() as typeof input;
  } catch {
    return jsonError("Invalid scanned service QR.");
  }

  const qrValue = typeof input.qrValue === "string" ? input.qrValue.trim() : "";
  if (!qrValue || qrValue.length > 80) return jsonError("This QR code is not a valid service ID.");

  try {
    const supabase = getPaymentAdminClient();
    const { data: booking, error: findError } = await supabase.from("service_requests")
      .select("id,request_type,subject,status")
      .eq("qr_value", qrValue)
      .in("request_type", ["service", "amc"])
      .maybeSingle();
    if (findError) return jsonError(`Could not verify the service QR: ${findError.message}`, 503);
    if (!booking) return jsonError("No service booking matches this QR code.", 404);
    if (booking.status === "completed") return NextResponse.json({ request: booking, alreadyCompleted: true });
    if (booking.status === "cancelled") return jsonError("This service request was cancelled and cannot be completed.", 409);

    const { data, error } = await supabase.from("service_requests").update({ status: "completed" })
      .eq("id", booking.id)
      .neq("status", "completed")
      .select("id,request_type,subject,status")
      .single();
    if (error || !data) return jsonError(`Could not complete the service: ${error?.message || "status update failed"}`, 503);
    return NextResponse.json({ request: data, alreadyCompleted: false }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Could not complete the service.", 503);
  }
}

export async function DELETE(request: Request) {
  const authorized = await authorizeAdminApi(request);
  if (!authorized) return jsonError("Admin verification is required.", 401);

  let input: { id?: unknown };
  try {
    input = await request.json() as typeof input;
  } catch {
    return jsonError("Invalid service deletion request.");
  }
  const id = typeof input.id === "string" ? input.id.trim() : "";
  if (!id) return jsonError("A service request ID is required.");

  try {
    const supabase = getPaymentAdminClient();
    const { error } = await supabase.from("service_requests").delete().eq("id", id).in("request_type", ["service", "amc"]);
    if (error) return jsonError(`Could not delete the service request: ${error.message}`, 503);
    return NextResponse.json({ deleted: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Could not delete the service request.", 503);
  }
}