export type OrderStatusKey = "pending" | "ready-to-dispatch" | "completed";

export type OrderCustomerEntry = {
  id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  item: string;
  quantity: number;
  amount: number;
  orderedAt: string;
};

export const orderStatusConfig: Record<
  OrderStatusKey,
  {
    label: string;
    slug: OrderStatusKey;
    count: number;
    description: string;
    accent: string;
    customers: OrderCustomerEntry[];
  }
> = {
  pending: {
    label: "Pending",
    slug: "pending",
    count: 18,
    description: "Awaiting confirmation, payment verification, or customer approval.",
    accent: "amber",
    customers: [
      {
        id: "ORD-1042",
        name: "Riya Shah",
        phone: "+91 98765 43210",
        email: "riya.shah@gmail.com",
        city: "Ahmedabad",
        address: "Bopal, Ahmedabad",
        item: "Kent Supreme Plus",
        quantity: 1,
        amount: 18999,
        orderedAt: "2026-09-18",
      },
      {
        id: "ORD-1047",
        name: "Amit Patel",
        phone: "+91 99123 88021",
        email: "amit.patel@gmail.com",
        city: "Nikol",
        address: "Nikol, Ahmedabad",
        item: "AQUAGUARD Essence",
        quantity: 1,
        amount: 12999,
        orderedAt: "2026-09-19",
      },
      {
        id: "ORD-1051",
        name: "Neha Trivedi",
        phone: "+91 98250 74210",
        email: "neha.trivedi@gmail.com",
        city: "Vastrapur",
        address: "Vastrapur, Ahmedabad",
        item: "Pureit Classic",
        quantity: 2,
        amount: 15998,
        orderedAt: "2026-09-19",
      },
    ],
  },
  "ready-to-dispatch": {
    label: "Ready to dispatch",
    slug: "ready-to-dispatch",
    count: 9,
    description: "Packed and verified orders ready to leave the warehouse.",
    accent: "sky",
    customers: [
      {
        id: "ORD-1035",
        name: "Manoj Joshi",
        phone: "+91 99012 67384",
        email: "manoj.joshi@gmail.com",
        city: "Satellite",
        address: "Satellite, Ahmedabad",
        item: "VINI Compact RO Unit",
        quantity: 1,
        amount: 7999,
        orderedAt: "2026-09-17",
      },
      {
        id: "ORD-1039",
        name: "Pooja Mehta",
        phone: "+91 97231 45577",
        email: "pooja.mehta@gmail.com",
        city: "Prahlad Nagar",
        address: "Prahlad Nagar, Ahmedabad",
        item: "Kent Supreme Plus",
        quantity: 1,
        amount: 18999,
        orderedAt: "2026-09-18",
      },
      {
        id: "ORD-1048",
        name: "Sagar Raval",
        phone: "+91 98980 71660",
        email: "sagar.raval@gmail.com",
        city: "Maninagar",
        address: "Maninagar, Ahmedabad",
        item: "RO Membrane Kit",
        quantity: 3,
        amount: 4350,
        orderedAt: "2026-09-20",
      },
    ],
  },
  completed: {
    label: "Completed",
    slug: "completed",
    count: 157,
    description: "Successfully delivered and closed customer orders.",
    accent: "emerald",
    customers: [
      {
        id: "ORD-987",
        name: "Hardik Desai",
        phone: "+91 98989 34567",
        email: "hardik.desai@gmail.com",
        city: "Ghatlodia",
        address: "Ghatlodia, Ahmedabad",
        item: "VINI Compact RO Unit",
        quantity: 1,
        amount: 7999,
        orderedAt: "2026-09-06",
      },
      {
        id: "ORD-1011",
        name: "Kavita Vora",
        phone: "+91 98242 90813",
        email: "kavita.vora@gmail.com",
        city: "CG Road",
        address: "CG Road, Ahmedabad",
        item: "AQUAGUARD Essence",
        quantity: 1,
        amount: 12999,
        orderedAt: "2026-09-09",
      },
      {
        id: "ORD-1024",
        name: "Jay Shah",
        phone: "+91 98256 11223",
        email: "jay.shah@gmail.com",
        city: "Navrangpura",
        address: "Navrangpura, Ahmedabad",
        item: "Pureit Classic",
        quantity: 1,
        amount: 11999,
        orderedAt: "2026-09-12",
      },
    ],
  },
};

export const orderStatusOrder: OrderStatusKey[] = ["pending", "ready-to-dispatch", "completed"];
