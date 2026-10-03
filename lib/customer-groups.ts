export type CustomerGroupKey = "active" | "repeat" | "new-this-month";

export type CustomerDetail = {
  name: string;
  phone: string;
  city: string;
  orderDate: string;
  product: string;
  amount: string;
  status: "Active" | "Repeat" | "New";
};

export type CustomerGroupEntry = {
  slug: CustomerGroupKey;
  label: string;
  count: number | string;
  summary: string;
  customers: CustomerDetail[];
};

export const customerGroups: Record<CustomerGroupKey, CustomerGroupEntry> = {
  active: {
    slug: "active",
    label: "Active customers",
    count: "—",
    summary: "Customer records are created at checkout; live category totals are not connected yet.",
    customers: [],
  },
  repeat: {
    slug: "repeat",
    label: "Repeat buyers",
    count: "—",
    summary: "Repeat-customer totals are not connected to live orders yet.",
    customers: [],
  },
  "new-this-month": {
    slug: "new-this-month",
    label: "New this month",
    count: "—",
    summary: "New-customer totals are not connected to live orders yet.",
    customers: [],
  },
};

export const customerGroupOrder: CustomerGroupKey[] = ["active", "repeat", "new-this-month"];
