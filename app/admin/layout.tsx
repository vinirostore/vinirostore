import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { ADMIN_ACCESS_COOKIE, verifyAdminAccessGrant } from "@/lib/admin-access";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const grant = verifyAdminAccessGrant(cookieStore.get(ADMIN_ACCESS_COOKIE)?.value);
  if (!grant) redirect("/admin-access");

  return <AdminShell>{children}</AdminShell>;
}
