import { createHmac, timingSafeEqual } from "node:crypto";
import { ADMIN_EMAIL } from "@/lib/admin-config";

export { ADMIN_EMAIL };
export const ADMIN_ACCESS_COOKIE = "vini-admin-access";
export const ADMIN_ACCESS_MAX_AGE = 15 * 60;

type AdminAccessGrant = {
  userId: string;
  email: string;
  expiresAt: number;
};

function sign(payload: string) {
  const secret = process.env.ADMIN_ACCESS_SECRET;
  if (!secret || secret.length < 32) return null;
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function constantTimeEquals(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function createAdminAccessGrant(userId: string) {
  const expiresAt = Math.floor(Date.now() / 1000) + ADMIN_ACCESS_MAX_AGE;
  const payload = Buffer.from(JSON.stringify({ userId, email: ADMIN_EMAIL, expiresAt } satisfies AdminAccessGrant)).toString("base64url");
  const signature = sign(payload);
  return signature ? { token: `${payload}.${signature}`, expiresAt } : null;
}

export function verifyAdminAccessGrant(token: string | undefined) {
  if (!token) return null;
  const [payload, providedSignature, extra] = token.split(".");
  if (!payload || !providedSignature || extra) return null;
  const expectedSignature = sign(payload);
  if (!expectedSignature || !constantTimeEquals(providedSignature, expectedSignature)) return null;

  try {
    const grant = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as AdminAccessGrant;
    const now = Math.floor(Date.now() / 1000);
    if (
      !grant.userId ||
      grant.email !== ADMIN_EMAIL ||
      !Number.isInteger(grant.expiresAt) ||
      grant.expiresAt <= now ||
      grant.expiresAt > now + ADMIN_ACCESS_MAX_AGE
    ) return null;
    return grant;
  } catch {
    return null;
  }
}
