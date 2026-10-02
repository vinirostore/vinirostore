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
  shiprocket_awb_code: string | null;
  shiprocket_courier_name: string | null;
  shiprocket_tracking_url: string | null;
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
  security_question: string | null;
  security_answer_hash: string | null;
  created_at: string;
};

export async function saveCustomerProfile(profile: {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  securityQuestion?: string;
  securityAnswerHash?: string;
}) {
  if (!supabase) return { error: "Database is not configured." };

  try {
    const { error } = await supabase.from("profiles").upsert({
      id: profile.id,
      email: profile.email,
      full_name: profile.fullName,
      phone: profile.phone || null,
      security_question: profile.securityQuestion || null,
      security_answer_hash: profile.securityAnswerHash || null,
    });

    return error ? { error: error.message } : {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to save your profile." };
  }
}

export async function getCustomerAccount(userId: string) {
  if (!supabase) return { profile: null, orders: [], serviceRequests: [], error: "Database is not configured." };

  const [profileResult, ordersResult, requestsResult] = await Promise.all([
    supabase.from("profiles").select("full_name,email,phone,security_question,security_answer_hash,created_at").eq("id", userId).maybeSingle(),
    supabase.from("orders").select("id,order_number,status,payment_status,subtotal,gst,shipping,total,created_at,shiprocket_awb_code,shiprocket_courier_name,shiprocket_tracking_url,order_items(id,product_id,product_name,product_slug,product_image,sku,unit_price,quantity,line_total)").eq("customer_id", userId).order("created_at", { ascending: false }),
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
