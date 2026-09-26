"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthState } from "@/components/auth-state";
import { useShopState } from "@/components/shop-state";

const categoryLinks = [
  { label: "Brands", href: "/brands" },
  { label: "Accessories", href: "/accessories" },
  { label: "Filters", href: "/accessories?search=filter" },
  { label: "Membranes", href: "/accessories?search=membrane" },
  { label: "Combo Offers", href: "/brands" },
  { label: "AMC & Services", href: "/services" },
];

function AccountIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="3.5" /><path d="M5 20a7 7 0 0 1 14 0" /></svg>;
}

function WishlistIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20.8 8.6c0 5.2-8.8 10-8.8 10s-8.8-4.8-8.8-10a4.7 4.7 0 0 1 8.8-2.2 4.7 4.7 0 0 1 8.8 2.2Z" /></svg>;
}

function CartIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 4h2l2.2 11.2a2 2 0 0 0 2 1.6h8.9a2 2 0 0 0 2-1.6L22 8H6" /><circle cx="10" cy="20" r="1" /><circle cx="18" cy="20" r="1" /></svg>;
}

export function SiteHeader() {
  const router = useRouter();
  const { cartCount, wishlist } = useShopState();
  const { isAuthenticated } = useAuthState();
  const [query, setQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuScrollPosition = useRef(0);
  const accountHref = isAuthenticated ? "/account" : "/login";

  useEffect(() => {
    if (!isMenuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setIsMenuOpen(false); };
    const scrollY = menuScrollPosition.current;
    const originalBodyOverflow = document.body.style.overflow;
    const originalBodyPosition = document.body.style.position;
    const originalBodyTop = document.body.style.top;
    const originalBodyWidth = document.body.style.width;
    const originalDocumentOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    document.documentElement.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.body.style.position = originalBodyPosition;
      document.body.style.top = originalBodyTop;
      document.body.style.width = originalBodyWidth;
      document.documentElement.style.overflow = originalDocumentOverflow;
      window.removeEventListener("keydown", closeOnEscape);
      window.scrollTo(0, scrollY);
    };
  }, [isMenuOpen]);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = query.trim();
    router.push(value ? `/products?search=${encodeURIComponent(value)}` : "/products");
  }

  return (
    <header className="store-header">
      <div className="store-header-main">
        <button type="button" className="store-menu-button" onClick={() => { menuScrollPosition.current = window.scrollY; setIsMenuOpen(true); }} aria-label="Open shopping menu" aria-expanded={isMenuOpen} aria-controls="store-menu-drawer"><span /><span /><span /></button>
        <Link href="/" className="store-logo" aria-label="VINI RO home"><span className="store-logo-image"><Image src="/vini-wordmark.png" alt="VINI RO" fill priority sizes="150px" /></span></Link>
        <form className="store-search" onSubmit={handleSearch} role="search"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products, brands & accessories" aria-label="Search products, brands and accessories" /><button type="submit">Search</button></form>
        <nav className="store-actions" aria-label="Shopping actions"><Link href={accountHref} aria-label="Account"><span className="store-action-icon"><AccountIcon /></span><small>Account</small></Link><Link href="/wishlist" aria-label={`Wishlist, ${wishlist.length} items`}><span className="store-action-icon"><WishlistIcon /></span><small>Wishlist <b>{wishlist.length}</b></small></Link><Link href="/cart" aria-label={`Cart, ${cartCount} items`}><span className="store-action-icon"><CartIcon /></span><small>Cart <b>{cartCount}</b></small></Link></nav>
      </div>
      <nav className="category-nav" aria-label="Shop categories">{categoryLinks.map((item) => <Link key={`${item.label}-${item.href}`} href={item.href}>{item.label}</Link>)}</nav>
      <div className={`store-menu-overlay ${isMenuOpen ? "open" : ""}`} onClick={() => setIsMenuOpen(false)} aria-hidden="true" />
      <aside id="store-menu-drawer" className={`store-menu-drawer ${isMenuOpen ? "open" : ""}`} aria-label="Shopping menu" aria-hidden={!isMenuOpen}><div className="drawer-heading"><strong>Shop VINI RO</strong><button type="button" onClick={() => setIsMenuOpen(false)} aria-label="Close shopping menu">×</button></div><Link href="/" className="store-menu-home" onClick={() => setIsMenuOpen(false)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m3 10 9-7 9 7" /><path d="M5 9v12h14V9M9 21v-7h6v7" /></svg>Home</Link><nav>{[...categoryLinks, { label: "Wishlist", href: "/wishlist" }, { label: "Orders & account", href: accountHref }, { label: "Help & contact", href: "/help" }].map((item) => <Link key={`${item.label}-${item.href}`} href={item.href} onClick={() => setIsMenuOpen(false)}>{item.label}<span aria-hidden="true">→</span></Link>)}</nav></aside>
    </header>
  );
}
