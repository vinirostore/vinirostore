import type { SupabaseClient } from "@supabase/supabase-js";

type OrderItem = { product_name: string; quantity: number; line_total: number };

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]!);
}

async function sendCustomerEmail(order: {
  id: string;
  order_number: string;
  customer_name: string;
  email: string;
  total: number;
  items: OrderItem[];
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.ORDER_CONFIRMATION_FROM_EMAIL;
  if (!apiKey || !from) throw new Error("Resend credentials are not configured.");

  const lineItems = order.items.map((item) => `${item.product_name} x ${item.quantity} - Rs. ${Number(item.line_total).toFixed(2)}`).join("\n");
  const escapedName = escapeHtml(order.customer_name);
  const escapedOrderNumber = escapeHtml(order.order_number);
  const escapedItems = order.items.map((item) => `<li>${escapeHtml(item.product_name)} x ${item.quantity} - Rs. ${Number(item.line_total).toFixed(2)}</li>`).join("");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `vini-order-confirmation-${order.id}`,
    },
    body: JSON.stringify({
      from,
      to: [order.email],
      subject: `Order confirmed: ${order.order_number}`,
      text: `Hi ${order.customer_name},\n\nYour order ${order.order_number} is confirmed.\n\n${lineItems}\n\nTotal: Rs. ${Number(order.total).toFixed(2)}\nThank you for shopping with VINI RO SERVICES.`,
      html: `<p>Hi ${escapedName},</p><p>Your order <strong>${escapedOrderNumber}</strong> is confirmed.</p><ul>${escapedItems}</ul><p><strong>Total: Rs. ${Number(order.total).toFixed(2)}</strong></p><p>Thank you for shopping with VINI RO SERVICES.</p>`,
    }),
  });
  if (!response.ok) throw new Error(`Resend rejected the confirmation email (${response.status}).`);
}

async function sendOwnerWhatsApp(order: {
  order_number: string;
  customer_name: string;
  total: number;
}) {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const templateName = process.env.WHATSAPP_ORDER_TEMPLATE;
  if (!accessToken || !phoneNumberId || !templateName) throw new Error("WhatsApp Cloud API credentials are not configured.");

  const version = process.env.WHATSAPP_GRAPH_API_VERSION || "v23.0";
  const response = await fetch(`https://graph.facebook.com/${version}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: "919104881806",
      type: "template",
      template: {
        name: templateName,
        language: { code: process.env.WHATSAPP_TEMPLATE_LANGUAGE || "en" },
        components: [{
          type: "body",
          parameters: [
            { type: "text", text: order.order_number },
            { type: "text", text: order.customer_name },
            { type: "text", text: `Rs. ${Number(order.total).toFixed(2)}` },
          ],
        }],
      },
    }),
  });
  if (!response.ok) throw new Error(`WhatsApp Cloud API rejected the owner notification (${response.status}).`);
}

export async function sendOrderConfirmation(supabase: SupabaseClient, orderId: string) {
  const { data: order, error } = await supabase.from("orders")
    .select("id,order_number,customer_id,shipping_name,total,order_items(product_name,quantity,line_total)")
    .eq("id", orderId)
    .maybeSingle();
  if (error || !order) {
    console.error("Order confirmation details could not be loaded.", error?.message || orderId);
    return;
  }

  const { data: profile, error: profileError } = await supabase.from("profiles")
    .select("email")
    .eq("id", order.customer_id)
    .maybeSingle();
  if (profileError || !profile?.email) {
    console.error("Order confirmation email address could not be loaded.", profileError?.message || order.order_number);
  }

  const details = {
    id: String(order.id),
    order_number: String(order.order_number),
    customer_name: String(order.shipping_name),
    email: String(profile?.email || ""),
    total: Number(order.total),
    items: (order.order_items || []) as OrderItem[],
  };
  const results = await Promise.allSettled([
    details.email ? sendCustomerEmail(details) : Promise.reject(new Error("Customer email is missing.")),
    sendOwnerWhatsApp(details),
  ]);

  for (const [index, result] of results.entries()) {
    if (result.status === "rejected") {
      console.error(index === 0 ? "Order confirmation email failed." : "Owner WhatsApp notification failed.", result.reason);
    }
  }
}