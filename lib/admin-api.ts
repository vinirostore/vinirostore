import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import {
  ADMIN_ACCESS_COOKIE,
  ADMIN_EMAIL,
  verifyAdminAccessGrant,
} from "@/lib/admin-access";

export async function authorizeAdminApi(request: Request) {
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