import { createHmac, timingSafeEqual } from "node:crypto";

export type CashfreeOrder = {
  order_id: string;
  order_amount: number;
  order_status: string;
  payment_session_id?: string;
};

type CashfreeResponse = Record<string, unknown>;

const CASHFREE_API_VERSION = "2025-01-01";

function cashfreeConfig() {
  const clientId = process.env.CASHFREE_CLIENT_ID;
  const clientSecret = process.env.CASHFREE_CLIENT_SECRET;
  const environment = process.env.CASHFREE_ENVIRONMENT === "production" ? "production" : "sandbox";
  if (!clientId || !clientSecret) throw new Error("Cashfree server credentials are not configured.");

  return {
    clientId,
    clientSecret,
    environment,
    apiUrl: environment === "production" ? "https://api.cashfree.com/pg" : "https://sandbox.cashfree.com/pg",
  };
}

export async function cashfreeRequest<T = CashfreeResponse>(path: string, init: RequestInit = {}) {
  const config = cashfreeConfig();
  const response = await fetch(`${config.apiUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "x-api-version": CASHFREE_API_VERSION,
      "x-client-id": config.clientId,
      "x-client-secret": config.clientSecret,
      ...init.headers,
    },
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
  });

  const rawBody = await response.text();
  let body: CashfreeResponse = {};
  try {
    body = rawBody ? JSON.parse(rawBody) as CashfreeResponse : {};
  } catch {
    body = { message: rawBody };
  }

  if (!response.ok) {
    const message = typeof body.message === "string" ? body.message : "Cashfree request failed.";
    throw new Error(message);
  }
  return body as T;
}

export function verifyCashfreeWebhookSignature(signature: string, timestamp: string, rawBody: string) {
  const { clientSecret } = cashfreeConfig();
  const expected = createHmac("sha256", clientSecret).update(timestamp + rawBody).digest();
  let received: Buffer;
  try {
    received = Buffer.from(signature, "base64");
  } catch {
    return false;
  }
  return expected.length === received.length && timingSafeEqual(expected, received);
}

export function getCashfreeEnvironment() {
  return process.env.CASHFREE_ENVIRONMENT === "production" ? "production" : "sandbox";
}