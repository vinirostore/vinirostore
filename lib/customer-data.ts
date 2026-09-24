import { supabase } from "@/lib/supabase";

export type CustomerOrderItem = {
  id: string;
  product_id: string;
  product_name: string;
  product_slug: string;
  product_image: string;
  sku: string;
  unit_price: number;
  quantity: number;
  line_total: number;
};

export type CustomerOrder = {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  subtotal: number;
  gst: number;
  shipping: number;
  total: number;
  created_at: string;
  order_items: CustomerOrderItem[];
};

export type CustomerServiceRequest = {
  id: string;
  subject: string;
  message: string;
  phone: string | null;
  status: string;
  created_at: string;
};

export type CustomerProfile = {
  full_name: string;
  email: string;
  phone: string | null;
  created_at: string;
};

export async function saveCustomerProfile(profile: {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
}) {
  if (!supabase) return { error: "Database is not configured." };

  try {
    const { error } = await supabase.from("profiles").upsert({
      id: profile.id,
      email: profile.email,
      full_name: profile.fullName,
      phone: profile.phone || null,
    });

    return error ? { error: error.message } : {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to save your profile." };
  }
}

export async function getCustomerAccount(userId: string) {
  if (!supabase) return { profile: null, orders: [], serviceRequests: [], error: "Database is not configured." };

  const [profileResult, ordersResult, requestsResult] = await Promise.all([
    supabase.from("profiles").select("full_name,email,phone,created_at").eq("id", userId).maybeSingle(),
    supabase.from("orders").select("id,order_number,status,payment_status,subtotal,gst,shipping,total,created_at,order_items(id,product_id,product_name,product_slug,product_image,sku,unit_price,quantity,line_total)").eq("customer_id", userId).order("created_at", { ascending: false }),
    supabase.from("service_requests").select("id,subject,message,phone,status,created_at").eq("customer_id", userId).order("created_at", { ascending: false }),
  ]);

  const error = profileResult.error || ordersResult.error || requestsResult.error;
  return {
    profile: (profileResult.data as CustomerProfile | null) || null,
    orders: (ordersResult.data as CustomerOrder[]) || [],
    serviceRequests: (requestsResult.data as CustomerServiceRequest[]) || [],
    error: error?.message,
  };
}

export async function createCustomerOrder(input: {
  customerId: string;
  shippingName: string;
  shippingAddress: string;
  city: string;
  pincode: string;
  phone: string;
  subtotal: number;
  gst: number;
  shipping: number;
  total: number;
  items: Array<{
    productId: string;
    productName: string;
    productSlug: string;
    productImage: string;
    sku: string;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
  }>;
}) {
  if (!supabase) return { error: "Database is not configured." };

  const { data: order, error: orderError } = await supabase.from("orders").insert({
    customer_id: input.customerId,
    status: "pending",
    payment_status: "pending",
    shipping_name: input.shippingName,
    shipping_address: input.shippingAddress,
    shipping_city: input.city,
    shipping_pincode: input.pincode,
    shipping_phone: input.phone,
    subtotal: input.subtotal,
    gst: input.gst,
    shipping: input.shipping,
    total: input.total,
  }).select("id,order_number").single();

  if (orderError || !order) return { error: orderError?.message || "The order could not be created." };

  const { error: itemsError } = await supabase.from("order_items").insert(input.items.map((item) => ({
    order_id: order.id,
    product_id: item.productId,
    product_name: item.productName,
    product_slug: item.productSlug,
    product_image: item.productImage,
    sku: item.sku,
    unit_price: item.unitPrice,
    quantity: item.quantity,
    line_total: item.lineTotal,
  })));

  if (itemsError) {
    await supabase.from("orders").delete().eq("id", order.id);
    return { error: itemsError.message };
  }

  return { orderNumber: order.order_number as string };
}

export async function createServiceRequest(input: {
  customerId: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}) {
  if (!supabase) return { error: "Database is not configured." };

  const { error } = await supabase.from("service_requests").insert({
    customer_id: input.customerId,
    name: input.name,
    email: input.email,
    phone: input.phone || null,
    subject: input.subject || "General enquiry",
    message: input.message,
    status: "open",
  });

  return error ? { error: error.message } : {};
}
