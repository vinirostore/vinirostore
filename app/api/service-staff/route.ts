import { NextResponse } from "next/server";
import { authenticatePaymentCustomer, getPaymentAdminClient } from "@/lib/payment-auth";

export const runtime = "nodejs";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}

async function getStaffIdentity(request: Request) {
  const identity = await authenticatePaymentCustomer(request);
  if (!identity || !identity.user.email_confirmed_at) return null;
  if (identity.user.email?.trim().toLowerCase() === "vinirostore@gmail.com") return null;
  return identity.user;
}

export async function GET(request: Request) {
  const user = await getStaffIdentity(request);
  if (!user) return jsonError("Sign in with a verified technician account to continue.", 401);

  try {
    const supabase = getPaymentAdminClient();
    const { data, error } = await supabase.from("service_staff")
      .select("display_name,status,created_at,reviewed_at")
      .eq("user_id", user.id)
      .maybeSingle();
    if (error) return jsonError(`Could not load technician access: ${error.message}`, 503);
    return NextResponse.json({ staff: data }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Could not load technician access.", 503);
  }
}

export async function POST(request: Request) {
  const user = await getStaffIdentity(request);
  if (!user) return jsonError("Sign in with a verified account before requesting technician access.", 401);

  let input: { displayName?: unknown };
  try {
    input = await request.json() as typeof input;
  } catch {
    return jsonError("Enter your name to request technician access.");
  }

  const displayName = typeof input.displayName === "string" ? input.displayName.trim() : "";
  if (displayName.length < 2 || displayName.length > 100) return jsonError("Enter a name between 2 and 100 characters.");
  if (!user.email) return jsonError("Your account needs a verified email address.", 400);

  try {
    const supabase = getPaymentAdminClient();
    const { data: existing, error: lookupError } = await supabase.from("service_staff")
      .select("display_name,status,created_at,reviewed_at")
      .eq("user_id", user.id)
      .maybeSingle();
    if (lookupError) return jsonError(`Could not check technician access: ${lookupError.message}`, 503);
    if (existing) return NextResponse.json({ staff: existing }, { headers: { "Cache-Control": "no-store" } });

    const { data, error } = await supabase.from("service_staff").insert({
      user_id: user.id,
      email: user.email.trim().toLowerCase(),
      display_name: displayName,
      status: "pending",
    }).select("display_name,status,created_at,reviewed_at").single();
    if (error || !data) return jsonError(`Could not submit technician access request: ${error?.message || "request was not saved"}`, 503);
    return NextResponse.json({ staff: data }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Could not submit technician access request.", 503);
  }
}
