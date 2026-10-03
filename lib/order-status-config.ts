export type OrderStatusKey = "pending" | "ready-to-dispatch" | "shipped" | "completed" | "cancelled" | "payment-failed" | "refunded";

export const orderStatusOrder: OrderStatusKey[] = [
  "pending",
  "ready-to-dispatch",
  "shipped",
  "completed",
  "payment-failed",
  "cancelled",
  "refunded",
];

export const orderStatusConfig: Record<OrderStatusKey, { label: string; description: string; accent: string }> = {
  pending: {
    label: "Pending payment",
    description: "Orders waiting for Cashfree payment confirmation.",
    accent: "amber",
  },
  "ready-to-dispatch": {
    label: "Processing",
    description: "Paid orders being prepared for dispatch.",
    accent: "sky",
  },
  shipped: {
    label: "Shipped",
    description: "Dispatched orders awaiting delivery confirmation.",
    accent: "indigo",
  },
  completed: {
    label: "Delivered",
    description: "Orders marked delivered by the admin.",
    accent: "emerald",
  },
  "payment-failed": {
    label: "Payment failed",
    description: "Orders for which Cashfree reported an unsuccessful payment.",
    accent: "rose",
  },
  cancelled: {
    label: "Cancelled",
    description: "Orders cancelled in the order record.",
    accent: "slate",
  },
  refunded: {
    label: "Refunded",
    description: "Orders with a recorded refund status.",
    accent: "slate",
  },
};