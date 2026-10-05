"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigationItems = [
  { id: "home", label: "Home", href: "/", icon: "home" },
  { id: "explore", label: "Explore", href: "/products", icon: "explore" },
  { id: "orders", label: "Orders", href: "/orders", icon: "orders" },
  { id: "wishlist", label: "Wishlist", href: "/wishlist", icon: "wishlist" },
  { id: "account", label: "Account", href: "/account", icon: "account" },
] as const;

function getActiveItem(pathname: string) {
  if (pathname === "/") return "home";
  if (pathname === "/orders" || pathname.startsWith("/orders/") || pathname.startsWith("/track-order/")) return "orders";
  if (pathname === "/wishlist" || pathname.startsWith("/wishlist/")) return "wishlist";
  if (pathname === "/account" || pathname.startsWith("/account/") || pathname === "/login" || pathname === "/register") return "account";
  if (
    pathname === "/products" || pathname.startsWith("/products/")
    || pathname === "/brands" || pathname.startsWith("/brands/")
    || pathname === "/accessories" || pathname.startsWith("/accessories/")
    || pathname === "/services" || pathname.startsWith("/services/")
  ) return "explore";
  return "";
}

function NavigationIcon({ name }: { name: (typeof navigationItems)[number]["icon"] }) {
  const props = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    className: "bottom-navigation-icon",
  };

  if (name === "home") {
    return <svg {...props}><path d="m3 10 9-7 9 7" /><path d="M5 9v11h14V9M9 20v-6h6v6" /></svg>;
  }
  if (name === "explore") {
    return <svg {...props}><circle cx="12" cy="12" r="9" /><path d="m15.8 8.2-2.4 5.2-5.2 2.4 2.4-5.2 5.2-2.4Z" /></svg>;
  }
  if (name === "orders") {
    return <svg {...props}><path d="M5 8.5 12 4l7 4.5v10a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 18.5v-10Z" /><path d="m5.5 8 6.5 4 6.5-4M12 12v8M9 6l7 4.5" /></svg>;
  }
  if (name === "wishlist") {
    return <svg {...props}><path d="M20.8 8.8c0 5.2-8.8 10.2-8.8 10.2S3.2 14 3.2 8.8A4.8 4.8 0 0 1 8 4c1.7 0 3.1.8 4 2.1A4.8 4.8 0 0 1 20.8 8.8Z" /></svg>;
  }
  return <svg {...props}><circle cx="12" cy="8" r="3.5" /><path d="M5 20a7 7 0 0 1 14 0" /></svg>;
}

export function BottomNavigation() {
  const pathname = usePathname();
  const activeItem = getActiveItem(pathname);
  const isStaffOrAdminPage = pathname === "/service-portal" || pathname.startsWith("/admin");

  if (isStaffOrAdminPage) return null;

  return (
    <nav aria-label="Main navigation" className="bottom-navigation">
      <div className="bottom-navigation-inner">
        {navigationItems.map((item) => {
          const isActive = activeItem === item.id;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`bottom-navigation-link${isActive ? " is-active" : ""}`}
              aria-current={isActive ? "page" : undefined}
            >
              <span className="bottom-navigation-item">
                <NavigationIcon name={item.icon} />
                <span className="bottom-navigation-label">{item.label}</span>
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
