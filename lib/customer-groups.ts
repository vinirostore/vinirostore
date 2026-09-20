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
  count: number;
  summary: string;
  customers: CustomerDetail[];
};

export const customerGroups: Record<CustomerGroupKey, CustomerGroupEntry> = {
  active: {
    slug: "active",
    label: "Active customers",
    count: 420,
    summary: "Currently engaged with regular service and purchases.",
    customers: [
      { name: "Riya Shah", phone: "+91 98765 43210", city: "Ahmedabad", orderDate: "12 Aug 2026", product: "Kent Supreme Plus", amount: "₹18,999", status: "Active" },
      { name: "Amit Patel", phone: "+91 98123 45678", city: "Surat", orderDate: "09 Aug 2026", product: "AQUAGUARD Essence", amount: "₹12,999", status: "Active" },
      { name: "Neha Trivedi", phone: "+91 99222 33445", city: "Vadodara", orderDate: "06 Aug 2026", product: "Pureit Classic", amount: "₹7,999", status: "Active" },
      { name: "Manoj Joshi", phone: "+91 99887 66554", city: "Rajkot", orderDate: "03 Aug 2026", product: "VINI Compact RO Unit", amount: "₹6,999", status: "Active" },
      { name: "Pooja Mehta", phone: "+91 98989 12121", city: "Gandhinagar", orderDate: "28 Jul 2026", product: "Kent Supreme Plus", amount: "₹18,999", status: "Active" },
      { name: "Hardik Desai", phone: "+91 97654 32109", city: "Bhavnagar", orderDate: "19 Jul 2026", product: "RO Membrane Kit", amount: "₹2,990", status: "Active" },
      { name: "Kavita Vora", phone: "+91 98555 77889", city: "Junagadh", orderDate: "16 Jul 2026", product: "AQUAGUARD Essence", amount: "₹12,999", status: "Active" },
      { name: "Jay Shah", phone: "+91 97222 33445", city: "Nadiad", orderDate: "11 Jul 2026", product: "Pureit Classic", amount: "₹7,999", status: "Active" },
      { name: "Mira Soni", phone: "+91 99000 77123", city: "Mehsana", orderDate: "07 Jul 2026", product: "VINI Compact RO Unit", amount: "₹6,999", status: "Active" },
      { name: "Rohan Patel", phone: "+91 98223 55190", city: "Anand", orderDate: "05 Jul 2026", product: "RO Membrane", amount: "₹1,450", status: "Active" },
    ],
  },
  repeat: {
    slug: "repeat",
    label: "Repeat buyers",
    count: 184,
    summary: "Customers coming back for repeat RO purchases or service support.",
    customers: [
      { name: "Hardik Desai", phone: "+91 97654 32109", city: "Bhavnagar", orderDate: "18 Aug 2026", product: "RO Membrane", amount: "₹1,450", status: "Repeat" },
      { name: "Kavita Vora", phone: "+91 98555 77889", city: "Junagadh", orderDate: "14 Aug 2026", product: "AQUAGUARD Essence", amount: "₹12,999", status: "Repeat" },
      { name: "Jay Shah", phone: "+91 97222 33445", city: "Nadiad", orderDate: "10 Aug 2026", product: "Pureit Classic", amount: "₹7,999", status: "Repeat" },
      { name: "Mira Soni", phone: "+91 99000 77123", city: "Mehsana", orderDate: "08 Aug 2026", product: "RO Filter Kit", amount: "₹2,450", status: "Repeat" },
      { name: "Rohan Patel", phone: "+91 98223 55190", city: "Anand", orderDate: "04 Aug 2026", product: "VINI Compact RO Unit", amount: "₹6,999", status: "Repeat" },
      { name: "Ananya Joshi", phone: "+91 98456 22113", city: "Surat", orderDate: "01 Aug 2026", product: "Home Care Combo", amount: "₹8,399", status: "Repeat" },
      { name: "Sagar Raval", phone: "+91 97888 44556", city: "Rajkot", orderDate: "27 Jul 2026", product: "RO Membrane Kit", amount: "₹2,990", status: "Repeat" },
      { name: "Nisha Vora", phone: "+91 98666 77111", city: "Ahmedabad", orderDate: "22 Jul 2026", product: "Kent Supreme Plus", amount: "₹18,999", status: "Repeat" },
      { name: "Yash Patel", phone: "+91 98234 56789", city: "Vadodara", orderDate: "17 Jul 2026", product: "AQUAGUARD Essence", amount: "₹12,999", status: "Repeat" },
      { name: "Dhruv Mehta", phone: "+91 98777 55443", city: "Gandhinagar", orderDate: "13 Jul 2026", product: "Pureit Classic", amount: "₹7,999", status: "Repeat" },
    ],
  },
  "new-this-month": {
    slug: "new-this-month",
    label: "New this month",
    count: 27,
    summary: "Newly onboarded customers this month.",
    customers: [
      { name: "Ananya Joshi", phone: "+91 98456 22113", city: "Surat", orderDate: "21 Aug 2026", product: "VINI Compact RO Unit", amount: "₹6,999", status: "New" },
      { name: "Dhruv Mehta", phone: "+91 98777 55443", city: "Gandhinagar", orderDate: "19 Aug 2026", product: "AQUAGUARD Essence", amount: "₹12,999", status: "New" },
      { name: "Sakshi Raval", phone: "+91 97888 44556", city: "Rajkot", orderDate: "17 Aug 2026", product: "Home Care Combo", amount: "₹8,399", status: "New" },
      { name: "Nikita Shah", phone: "+91 98999 33440", city: "Ahmedabad", orderDate: "15 Aug 2026", product: "Pureit Classic", amount: "₹7,999", status: "New" },
      { name: "Yash Patel", phone: "+91 98234 56789", city: "Vadodara", orderDate: "13 Aug 2026", product: "RO Membrane", amount: "₹1,450", status: "New" },
      { name: "Priya Shah", phone: "+91 98181 71717", city: "Nadiad", orderDate: "11 Aug 2026", product: "Kent Supreme Plus", amount: "₹18,999", status: "New" },
      { name: "Aarav Mehta", phone: "+91 98333 78901", city: "Mehsana", orderDate: "09 Aug 2026", product: "RO Filter Kit", amount: "₹2,450", status: "New" },
      { name: "Nisha Desai", phone: "+91 98944 22334", city: "Bhavnagar", orderDate: "07 Aug 2026", product: "VINI Compact RO Unit", amount: "₹6,999", status: "New" },
      { name: "Kunal Joshi", phone: "+91 99666 77881", city: "Junagadh", orderDate: "05 Aug 2026", product: "AQUAGUARD Essence", amount: "₹12,999", status: "New" },
      { name: "Ritika Patel", phone: "+91 97979 44010", city: "Anand", orderDate: "03 Aug 2026", product: "Pureit Classic", amount: "₹7,999", status: "New" },
    ],
  },
};

export const customerGroupOrder: CustomerGroupKey[] = ["active", "repeat", "new-this-month"];
