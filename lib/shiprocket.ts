const SHIPROCKET_API = "https://apiv2.shiprocket.in/v1/external";

type ShiprocketResponse = Record<string, unknown>;

export type ShiprocketCourier = {
  id: number;
  name: string;
  rate: number;
  etd: string;
};

let cachedToken: { value: string; expiresAt: number } | null = null;

function asRecord(value: unknown): ShiprocketResponse {
  return value && typeof value === "object" ? value as ShiprocketResponse : {};
}

async function readResponse(response: Response) {
  const text = await response.text();
  let body: ShiprocketResponse = {};
  try {
    body = asRecord(JSON.parse(text));
  } catch {
    body = { message: text };
  }

  if (!response.ok) {
    const message = typeof body.message === "string" ? body.message : "Shiprocket request failed.";
    throw new Error(message);
  }
  return body;
}

async function getShiprocketToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.value;

  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;
  if (!email || !password) throw new Error("Shiprocket API credentials are not configured on the server.");

  const response = await fetch(`${SHIPROCKET_API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
  });
  const body = await readResponse(response);
  const token = typeof body.token === "string" ? body.token : "";
  if (!token) throw new Error("Shiprocket did not return an access token.");

  cachedToken = { value: token, expiresAt: Date.now() + 8 * 24 * 60 * 60 * 1000 };
  return token;
}

async function shiprocketRequest(path: string, init: RequestInit = {}) {
  const token = await getShiprocketToken();
  const response = await fetch(`${SHIPROCKET_API}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...init.headers,
    },
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
  });
  return readResponse(response);
}

export async function getShiprocketCouriers(input: {
  deliveryPincode: string;
  weightKg: number;
  isCod: boolean;
}) {
  const pickupPincode = process.env.SHIPROCKET_PICKUP_PINCODE;
  if (!pickupPincode) throw new Error("Set SHIPROCKET_PICKUP_PINCODE to the registered pickup location pincode.");

  const params = new URLSearchParams({
    pickup_postcode: pickupPincode,
    delivery_postcode: input.deliveryPincode,
    weight: String(input.weightKg),
    cod: input.isCod ? "1" : "0",
  });
  const body = await shiprocketRequest(`/courier/serviceability/?${params.toString()}`, { method: "GET" });
  const data = asRecord(body.data);
  const companies = data.available_courier_companies;
  if (!Array.isArray(companies)) return [];

  return companies.map((company): ShiprocketCourier | null => {
    const item = asRecord(company);
    const id = Number(item.courier_company_id);
    const rate = Number(item.rate);
    if (!Number.isFinite(id) || !Number.isFinite(rate)) return null;
    return {
      id,
      name: String(item.courier_name || "Courier"),
      rate,
      etd: String(item.etd || item.estimated_delivery_days || ""),
    };
  }).filter((courier): courier is ShiprocketCourier => courier !== null);
}

export async function createShiprocketOrder(input: Record<string, unknown>) {
  return shiprocketRequest("/orders/create/adhoc", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function assignShiprocketCourier(shipmentId: string, courierId: number) {
  return shiprocketRequest("/courier/assign/awb", {
    method: "POST",
    body: JSON.stringify({ shipment_id: shipmentId, courier_id: courierId }),
  });
}

export function readShiprocketAssignment(body: ShiprocketResponse) {
  const response = asRecord(body.response);
  const data = asRecord(response.data);
  const awb = typeof data.awb_code === "string" ? data.awb_code : "";
  const courier = typeof data.courier_name === "string" ? data.courier_name : "";
  return { awb, courier };
}

export async function trackShiprocketAwb(awbCode: string) {
  return shiprocketRequest(`/courier/track/awb/${encodeURIComponent(awbCode)}`, { method: "GET" });
}