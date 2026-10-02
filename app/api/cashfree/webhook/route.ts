import { NextResponse } from "next/server";
import { verifyCashfreeWebhookSignature } from "@/lib/cashfree";
import { getPaymentAdminClient } from "@/lib/payment-auth";

export const runtime = "nodejs";

type CashfreeWebhookRecord = Record<string, unknown>;

function asRecord(value: unknown): CashfreeWebhookRecord {
  return value && typeof value === "object" ? value as CashfreeWebhookRecord : {};
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-webhook-signature") || "";
  const timestamp = request.headers.get("x-webhook-timestamp") || "";
  if (!signature || !timestamp) return NextResponse.json({ error: "Missing webhook signature." }, { status: 400 });

  try {
    if (!verifyCashfreeWebhookSignature(signature, timestamp, rawBody)) {
      return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
    }

    const event = asRecord(JSON.parse(rawBody));
    const data = asRecord(event.data);
    const remoteOrder = asRecord(data.order);
    const payment = asRecord(data.payment);
    const cashfreeOrderId = typeof remoteOrder.order_id === "string" ? remoteOrder.order_id : "";
    const paymentStatus = typeof payment.payment_status === "string" ? payment.payment_status : "";
    const eventType = typeof event.type === "string" ? event.type : "";
    if (!cashfreeOrderId || !/^vini_[a-f0-9]{32}$/i.test(cashfreeOrderId)) {
      return NextResponse.json({ received: true });
    }

    const supabase = getPaymentAdminClient();
    const { data: localOrder, error } = await supabase.from("orders")
      .select("id,total,payment_status,status")
      .eq("cashfree_order_id", cashfreeOrderId)
      .maybeSingle();
    if (error) return NextResponse.json({ error: "Unable to load order." }, { status: 500 });
    if (!localOrder) return NextResponse.json({ received: true });
    if (Number(remoteOrder.order_amount).toFixed(2) !== Number(localOrder.total).toFixed(2)) {
      return NextResponse.json({ error: "Webhook amount does not match order." }, { status: 409 });
    }

    if ((eventType === "PAYMENT_SUCCESS_WEBHOOK" || paymentStatus === "SUCCESS") && localOrder.payment_status !== "paid") {
      const paymentId = typeof payment.cf_payment_id === "string" || typeof payment.cf_payment_id === "number"
        ? String(payment.cf_payment_id)
        : null;
      const { error: updateError } = await supabase.from("orders").update({
        payment_status: "paid",
        status: localOrder.status === "pending" ? "processing" : localOrder.status,
        cashfree_payment_id: paymentId,
      }).eq("id", localOrder.id).neq("payment_status", "paid");
      if (updateError) return NextResponse.json({ error: "Unable to save payment status." }, { status: 500 });
    } else if (["PAYMENT_FAILED_WEBHOOK", "PAYMENT_USER_DROPPED_WEBHOOK"].includes(eventType) && localOrder.payment_status !== "paid") {
      const { error: updateError } = await supabase.from("orders").update({ payment_status: "failed" })
        .eq("id", localOrder.id).neq("payment_status", "paid");
      if (updateError) return NextResponse.json({ error: "Unable to save payment status." }, { status: 500 });
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: "Unable to process Cashfree webhook." }, { status: 500 });
  }
}