import { NextResponse } from "next/server";
import { authenticatePaymentCustomer, getPaymentAdminClient } from "@/lib/payment-auth";
import { trackShiprocketAwb } from "@/lib/shiprocket";

export const runtime = "nodejs";

type RecordValue = Record<string, unknown>;

function asRecord(value: unknown): RecordValue {
  return value && typeof value === "object" ? value as RecordValue : {};
}

function safeText(value: unknown) {
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
}

export async function GET(request: Request) {
  const identity = await authenticatePaymentCustomer(request);
  if (!identity) return NextResponse.json({ error: "Sign in to view this delivery." }, { status: 401 });

  const orderId = new URL(request.url).searchParams.get("orderId") || "";
  if (!/^[a-f0-9-]{36}$/i.test(orderId)) return NextResponse.json({ error: "Invalid order." }, { status: 400 });

  try {
    const supabase = getPaymentAdminClient();
    const { data: order, error } = await supabase.from("orders")
      .select("id,order_number,customer_id,status,shipping_name,shipping_city,shipping_state,shipping_pincode,shiprocket_awb_code,shiprocket_courier_name,shiprocket_tracking_url")
      .eq("id", orderId)
      .eq("customer_id", identity.user.id)
      .maybeSingle();
    if (error) return NextResponse.json({ error: "Unable to load this order." }, { status: 500 });
    if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
    if (!order.shiprocket_awb_code) return NextResponse.json({ error: "Tracking will appear after this order is dispatched." }, { status: 409 });

    const trackingResponse = await trackShiprocketAwb(order.shiprocket_awb_code);
    const trackingData = asRecord(trackingResponse.tracking_data);
    const activities = Array.isArray(trackingData.shipment_track_activities)
      ? trackingData.shipment_track_activities.map((rawActivity) => {
          const activity = asRecord(rawActivity);
          return {
            date: safeText(activity.date),
            status: safeText(activity["sr-status-label"] || activity.status),
            description: safeText(activity.activity),
            location: safeText(activity.location),
          };
        })
      : [];
    const latestTrack = Array.isArray(trackingData.shipment_track)
      ? asRecord(trackingData.shipment_track[0])
      : {};

    return NextResponse.json({
      order: {
        orderNumber: order.order_number,
        status: order.status,
        destination: [order.shipping_city, order.shipping_state, order.shipping_pincode].filter(Boolean).join(", "),
        courier: order.shiprocket_courier_name || safeText(latestTrack.courier_name),
        awb: order.shiprocket_awb_code,
        trackingUrl: safeText(trackingData.track_url) || order.shiprocket_tracking_url,
        currentStatus: safeText(latestTrack.current_status || trackingData.track_status),
        deliveredTo: safeText(latestTrack.delivered_to),
        estimatedDelivery: safeText(latestTrack.edd),
        activities,
      },
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to get the latest tracking update." }, { status: 502 });
  }
}