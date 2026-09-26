import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  ADMIN_ACCESS_COOKIE,
  ADMIN_ACCESS_MAX_AGE,
  ADMIN_EMAIL,
  constantTimeEquals,
  createAdminAccessGrant,
  verifyAdminAccessGrant,
} from "@/lib/admin-access";

export const runtime = "nodejs";

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge,
  };
}

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return null;
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const grant = verifyAdminAccessGrant(cookieStore.get(ADMIN_ACCESS_COOKIE)?.value);
  const authorization = request.headers.get("authorization") || "";
  const accessToken = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  const supabase = getSupabaseClient();
  if (!grant || !accessToken || !supabase) {
    return NextResponse.json({ verified: false }, { headers: { "Cache-Control": "no-store" } });
  }

  const { data, error } = await supabase.auth.getUser(accessToken);
  const verified = !error && data.user?.id === grant.userId && data.user.email?.trim().toLowerCase() === ADMIN_EMAIL;
  return NextResponse.json({ verified }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const authorization = request.headers.get("authorization") || "";
  const accessToken = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  const supabase = getSupabaseClient();
  const expectedPhone = process.env.ADMIN_PHONE?.replace(/\D/g, "");
  const expectedBirthDate = process.env.ADMIN_BIRTHDATE?.trim();
  const accessSecret = process.env.ADMIN_ACCESS_SECRET;

  if (!accessToken || !supabase) {
    return NextResponse.json({ error: "A valid Supabase admin session is required." }, { status: 401 });
  }
  if (!expectedPhone || !expectedBirthDate || !accessSecret || accessSecret.length < 32) {
    return NextResponse.json({ error: "Admin verification is not configured on the server." }, { status: 503 });
  }

  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error || !data.user || data.user.email?.trim().toLowerCase() !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "A valid Supabase admin session is required." }, { status: 401 });
  }

  let body: { phone?: unknown; birthDate?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid verification request." }, { status: 400 });
  }

  const phone = typeof body.phone === "string" ? body.phone.replace(/\D/g, "") : "";
  const birthDate = typeof body.birthDate === "string" ? body.birthDate.trim() : "";
  if (!constantTimeEquals(phone, expectedPhone) || !constantTimeEquals(birthDate, expectedBirthDate)) {
    return NextResponse.json({ error: "Incorrect phone number or birth date." }, { status: 401 });
  }

  const grant = createAdminAccessGrant(data.user.id);
  if (!grant) return NextResponse.json({ error: "Admin verification is not configured on the server." }, { status: 503 });

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_ACCESS_COOKIE, grant.token, cookieOptions(ADMIN_ACCESS_MAX_AGE));
  return NextResponse.json({ verified: true });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_ACCESS_COOKIE, "", cookieOptions(0));
  return NextResponse.json({ verified: false });
}
