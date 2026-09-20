export const businessConfig = {
  businessName: "VINI RO SERVICES",
  ownerName: "Ashish Adhikari",
  establishedYear: 2020,
  phone: "+91 9104881806",
  email: "vinirostore@gmail.com",
  amcPrice: 2900,
  amcCity: "Ahmedabad",
  amcIncludes: ["Service + Visit"],
  amcReplacementParts: "Chargeable at applicable MRP",
  normalServiceApproxFee: 200,
  normalServiceBaseDistanceKm: 10,
  shippingProvider: "Shiprocket",
  paymentGateway: "Cashfree",
  whatsappNumber: null,
  officeAddress: null,
  gst: null,
  cod: null,
  amcDuration: null,
  beyond10kmPricing: null,
  supportPhone: "+91 9104881806",
  supportEmail: "vinirostore@gmail.com",
} as const;

export const navItems = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "Accessories", href: "/accessories" },
  { label: "Services", href: "/services" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Help", href: "/help" },
];

export const footerLinks = {
  company: [
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Help", href: "/help" },
  ],
  products: [
    { label: "RO Systems", href: "/products?category=ro" },
    { label: "Accessories", href: "/products?category=accessories" },
    { label: "Combo Offers", href: "/products?category=combo-offers" },
  ],
  services: [
    { label: "Repair", href: "/services/repair" },
    { label: "General Service", href: "/services/general-service" },
    { label: "Installation", href: "/services/installation" },
    { label: "Maintenance", href: "/services/maintenance" },
    { label: "AMC", href: "/services/amc" },
    { label: "Other RO Support", href: "/services/other-ro-support" },
  ],
  account: [
    { label: "Account", href: "/account" },
    { label: "Wishlist", href: "/wishlist" },
    { label: "Cart", href: "/cart" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/policies/privacy" },
    { label: "Terms & Conditions", href: "/policies/terms" },
    { label: "Shipping Policy", href: "/policies/shipping" },
    { label: "Return/Refund Policy", href: "/policies/refunds" },
    { label: "Cancellation Policy", href: "/policies/cancellation" },
  ],
};
