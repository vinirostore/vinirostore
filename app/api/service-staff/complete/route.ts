import { NextResponse } from "next/server";
import { authenticatePaymentCustomer, getPaymentAdminClient } from "@/lib/payment-auth";

export const runtime = "nodejs";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const identity = await authenticatePaymentCustomer(request);
  if (!identity || !identity.user.email_confirmed_at) return jsonError("Sign in with a verified technician account to continue.", 401);
  if (identity.user.email?.trim().toLowerCase() === "vinirostore@gmail.com") return jsonError("Admin accounts cannot use the technician portal.", 403);

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
    const { data: staff, error: staffError } = await supabase.from("service_staff")
      .select("display_name,status")
      .eq("user_id", identity.user.id)
      .maybeSingle();
    if (staffError) return jsonError(`Could not verify technician access: ${staffError.message}`, 503);
    if (!staff || staff.status !== "approved") return jsonError("Technician access has not been approved.", 403);

    const { data: booking, error: findError } = await supabase.from("service_requests")
      .select("id,request_type,subject,status,completed_by_name,completed_at")
      .eq("qr_value", qrValue)
      .in("request_type", ["service", "amc"])
      .maybeSingle();
    if (findError) return jsonError(`Could not verify the service QR: ${findError.message}`, 503);
    if (!booking) return jsonError("No service booking matches this QR code.", 404);
    if (booking.status === "completed") return NextResponse.json({ request: booking, alreadyCompleted: true }, { headers: { "Cache-Control": "no-store" } });
    if (booking.status === "cancelled") return jsonError("This service request was cancelled and cannot be completed.", 409);

    const { data, error } = await supabase.from("service_requests").update({
      status: "completed",
      completed_by: identity.user.id,
      completed_by_name: staff.display_name,
      completed_at: new Date().toISOString(),
    })
      .eq("id", booking.id)
      .neq("status", "completed")
      .neq("status", "cancelled")
      .select("id,request_type,subject,status,completed_by_name,completed_at")
      .maybeSingle();
    if (error) return jsonError(`Could not complete the service: ${error.message}`, 503);
    if (data) return NextResponse.json({ request: data, alreadyCompleted: false }, { headers: { "Cache-Control": "no-store" } });

    const { data: latest, error: latestError } = await supabase.from("service_requests")
      .select("id,request_type,subject,status,completed_by_name,completed_at")
      .eq("id", booking.id)
      .single();
    if (latestError) return jsonError(`Could not confirm service completion: ${latestError.message}`, 503);
    if (latest.status === "completed") return NextResponse.json({ request: latest, alreadyCompleted: true }, { headers: { "Cache-Control": "no-store" } });
    return jsonError("This service request can no longer be completed.", 409);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Could not complete the service.", 503);
  }
}
