import { NextResponse } from "next/server";
import { authorizeAdminApi } from "@/lib/admin-api";
import { getPaymentAdminClient } from "@/lib/payment-auth";

export const runtime = "nodejs";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function GET(request: Request) {
  if (!await authorizeAdminApi(request)) return jsonError("Admin verification is required.", 401);

  try {
    const supabase = getPaymentAdminClient();
    const { data, error } = await supabase.from("service_staff")
      .select("user_id,email,display_name,status,created_at,reviewed_at")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) return jsonError(`Could not load technician accounts: ${error.message}`, 503);
    return NextResponse.json({ staff: data || [] }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Could not load technician accounts.", 503);
  }
}

export async function PATCH(request: Request) {
  if (!await authorizeAdminApi(request)) return jsonError("Admin verification is required.", 401);

  let input: { userId?: unknown; status?: unknown };
  try {
    input = await request.json() as typeof input;
  } catch {
    return jsonError("Invalid technician access update.");
  }

  const userId = typeof input.userId === "string" ? input.userId.trim() : "";
  const status = input.status === "approved" || input.status === "rejected" ? input.status : "";
  if (!userId || !status) return jsonError("A technician account and valid review status are required.");

  try {
    const supabase = getPaymentAdminClient();
    const { data, error } = await supabase.from("service_staff")
      .update({ status, reviewed_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("status", "pending")
      .select("user_id,email,display_name,status,created_at,reviewed_at")
      .maybeSingle();
    if (error) return jsonError(`Could not update technician access: ${error.message}`, 503);
    if (!data) return jsonError("This technician request is no longer pending.", 409);
    return NextResponse.json({ staff: data }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Could not update technician access.", 503);
  }
}
