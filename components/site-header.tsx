"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { navItems } from "@/lib/site-config";
import { useShopState } from "@/components/shop-state";
import { useAuthState } from "@/components/auth-state";

const mobileNavItems = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "Accessories", href: "/accessories" },
  { label: "Services", href: "/services" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Wishlist", href: "/wishlist" },
  { label: "Cart", href: "/cart" },
  { label: "Account", href: "/account" },
];

const mobileServiceItems = [
  { label: "Repair", href: "/services/repair" },
  { label: "General Service", href: "/services/general-service" },
  { label: "Installation", href: "/services/installation" },
  { label: "Maintenance", href: "/services/maintenance" },
  { label: "AMC", href: "/services/amc" },
  { label: "Other RO Support", href: "/services/other-ro-support" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cartCount, wishlist } = useShopState();
  const { isAuthenticated } = useAuthState();
  const accountHref = isAuthenticated ? "/account" : "/login";

  useEffect(() => {
    if (!isMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMenuOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  const closeMenu = () => setIsMenuOpen(false);
  const handleMenuToggle = () => {
    setIsMenuOpen((open) => !open);
  };

  return (
    <header className={`site-header premium-header ${isHome ? "home-header" : "inner-header"}`}>
      <div className="header-inner">
        <Link href="/" className="mobile-logo-link" aria-label="VINI RO SERVICES home">
          <span className="nav-wordmark">
            <Image src="/vini-wordmark.png" alt="VINI RO Services" fill priority sizes="170px" />
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Main navigation">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm font-medium text-slate-200/80 transition hover:text-white">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 sm:gap-3 md:flex">
          <Link href={accountHref} className="hidden rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-slate-100 transition hover:border-white/25 hover:bg-white/10 lg:inline-flex">
            Account
          </Link>
          <Link href="/wishlist" className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-slate-100 transition hover:border-white/25 hover:bg-white/10">
            Wishlist ({wishlist.length})
          </Link>
          <Link href="/cart" className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-medium text-slate-900 transition hover:bg-slate-100">
            Cart
            <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-semibold text-white">{cartCount}</span>
          </Link>
        </div>

        <button
          type="button"
          className={`mobile-menu-button md:hidden ${isMenuOpen ? "is-open" : ""}`}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
          onClick={handleMenuToggle}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <div
        className={`mobile-menu-overlay ${isMenuOpen ? "is-open" : ""}`}
        onClick={closeMenu}
        aria-hidden={!isMenuOpen}
      />

      <div
        id="mobile-menu"
        className={`mobile-menu-panel ${isMenuOpen ? "is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
      >
        <div className="mobile-menu-header">
          <span className="mobile-menu-title">Menu</span>
          <button type="button" className="mobile-close-button" aria-label="Close navigation menu" onClick={closeMenu}>
            ×
          </button>
        </div>

        <nav className="mobile-nav" aria-label="Mobile navigation menu">
          {mobileNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.label === "Account" ? accountHref : item.href}
                className={`mobile-nav-item ${isActive ? "active" : ""}`}
                onClick={closeMenu}
              >
                {item.label === "Account" ? (isAuthenticated ? "Account" : "Login / Sign in") : item.label}
                {item.label === "Cart" ? ` (${cartCount})` : item.label === "Wishlist" ? ` (${wishlist.length})` : ""}
              </Link>
            );
          })}
          <span className="mobile-menu-section-title">Service support</span>
          {mobileServiceItems.map((item) => {
            const isActive = pathname === item.href;
            return <Link key={item.href} href={item.href} className={`mobile-nav-item mobile-nav-item-nested ${isActive ? "active" : ""}`} onClick={closeMenu}>{item.label}</Link>;
          })}
        </nav>
      </div>
    </header>
  );
}
