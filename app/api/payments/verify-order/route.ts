import { NextResponse } from "next/server";
import { cashfreeRequest, type CashfreeOrder } from "@/lib/cashfree";
import { authenticatePaymentCustomer, getPaymentAdminClient } from "@/lib/payment-auth";

export const runtime = "nodejs";

type VerifyInput = { orderId?: unknown };
type CashfreePaymentList = { cf_payment_id?: string; payment_status?: string }[];

function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const identity = await authenticatePaymentCustomer(request);
  if (!identity) return errorResponse("Please sign in again to view your payment status.", 401);

  let input: VerifyInput;
  try {
    input = await request.json() as VerifyInput;
  } catch {
    return errorResponse("Invalid payment verification request.");
  }
  const cashfreeOrderId = typeof input.orderId === "string" ? input.orderId.trim() : "";
  if (!/^vini_[a-f0-9]{32}$/i.test(cashfreeOrderId)) return errorResponse("Invalid payment order.");

  try {
    const supabase = getPaymentAdminClient();
    const { data: localOrder, error } = await supabase.from("orders")
      .select("id,order_number,customer_id,total,payment_status,status,cashfree_order_id")
      .eq("customer_id", identity.user.id)
      .eq("cashfree_order_id", cashfreeOrderId)
      .maybeSingle();
    if (error) return errorResponse("Unable to find your order.", 500);
    if (!localOrder) return errorResponse("Payment order not found.", 404);

    const remoteOrder = await cashfreeRequest<CashfreeOrder>(`/orders/${encodeURIComponent(cashfreeOrderId)}`, { method: "GET" });
    if (Number(remoteOrder.order_amount).toFixed(2) !== Number(localOrder.total).toFixed(2)) {
      return errorResponse("The Cashfree amount does not match your order. Contact support.", 409);
    }

    let paymentStatus = localOrder.payment_status;
    let orderStatus = localOrder.status;
    let paymentId: string | undefined;
    if (remoteOrder.order_status === "PAID") {
      paymentStatus = "paid";
      if (orderStatus === "pending") orderStatus = "processing";
      const payments = await cashfreeRequest<CashfreePaymentList>(`/orders/${encodeURIComponent(cashfreeOrderId)}/payments`, { method: "GET" });
      paymentId = Array.isArray(payments) ? payments.find((payment) => payment.payment_status === "SUCCESS")?.cf_payment_id : undefined;
      const { error: updateError } = await supabase.from("orders").update({
        payment_status: paymentStatus,
        status: orderStatus,
        ...(paymentId ? { cashfree_payment_id: paymentId } : {}),
      }).eq("id", localOrder.id);
      if (updateError) return errorResponse("Payment is confirmed, but the order update failed. Contact support.", 500);
    } else if (["EXPIRED", "TERMINATED"].includes(remoteOrder.order_status) && paymentStatus !== "paid") {
      paymentStatus = "failed";
      const { error: updateError } = await supabase.from("orders").update({ payment_status: paymentStatus }).eq("id", localOrder.id).neq("payment_status", "paid");
      if (updateError) return errorResponse("Unable to update the expired payment status.", 500);
    }

    return NextResponse.json({
      orderNumber: localOrder.order_number,
      paymentStatus,
      orderStatus,
      cashfreeStatus: remoteOrder.order_status,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Unable to verify payment with Cashfree.", 502);
  }
}