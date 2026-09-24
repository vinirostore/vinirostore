"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/catalog";
import { useAuthState } from "@/components/auth-state";

type CartLine = {
  product: Product;
  quantity: number;
};

type ShopState = {
  cart: CartLine[];
  wishlist: string[];
  wishlistItems: Product[];
  cartCount: number;
  addToCart: (product: Product) => void;
  removeFromCart: (slug: string) => void;
  updateCartQuantity: (slug: string, quantity: number) => void;
  toggleWishlist: (slug: string, product?: Product) => void;
  isWishlisted: (slug: string) => boolean;
};

const ShopStateContext = createContext<ShopState | null>(null);
const CART_KEY = "vini-cart";
const WISHLIST_KEY = "vini-wishlist";
type ShopNotice = {
  title: string;
  detail: string;
  tone: "cart" | "wishlist";
};

function getScopedStorageKey(prefix: string, email?: string | null) {
  return email ? `${prefix}:${email.trim().toLowerCase()}` : prefix;
}

export function ShopStateProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [notice, setNotice] = useState<ShopNotice | null>(null);
  const { user } = useAuthState();

  useEffect(() => {
    const cartKey = getScopedStorageKey(CART_KEY, user?.email);
    const wishlistKey = getScopedStorageKey(WISHLIST_KEY, user?.email);

    window.setTimeout(() => {
      try {
        const storedCart = window.localStorage.getItem(cartKey);
        const storedWishlist = window.localStorage.getItem(wishlistKey);
        const storedWishlistItems = window.localStorage.getItem(`${wishlistKey}:items`);
        setCart(storedCart ? (JSON.parse(storedCart) as CartLine[]) : []);
        setWishlist(storedWishlist ? (JSON.parse(storedWishlist) as string[]) : []);
        setWishlistItems(storedWishlistItems ? (JSON.parse(storedWishlistItems) as Product[]) : []);
      } catch {
        window.localStorage.removeItem(cartKey);
        window.localStorage.removeItem(wishlistKey);
        setCart([]);
        setWishlist([]);
        setWishlistItems([]);
      }
    }, 0);
  }, [user?.email]);

  useEffect(() => {
    const cartKey = getScopedStorageKey(CART_KEY, user?.email);
    window.localStorage.setItem(cartKey, JSON.stringify(cart));
  }, [cart, user?.email]);

  useEffect(() => {
    const wishlistKey = getScopedStorageKey(WISHLIST_KEY, user?.email);
    window.localStorage.setItem(wishlistKey, JSON.stringify(wishlist));
    window.localStorage.setItem(`${wishlistKey}:items`, JSON.stringify(wishlistItems));
  }, [wishlist, wishlistItems, user?.email]);

  const value = useMemo<ShopState>(() => ({
    cart,
    wishlist,
    cartCount: cart.reduce((total, line) => total + line.quantity, 0),
    addToCart: (product) => {
      setCart((current) => {
        const existing = current.find((line) => line.product.slug === product.slug);
        if (existing) {
          return current.map((line) => line.product.slug === product.slug ? { ...line, quantity: line.quantity + 1 } : line);
        }
        return [...current, { product, quantity: 1 }];
      });
      setNotice({ title: "Added to cart", detail: product.name, tone: "cart" });
      window.setTimeout(() => setNotice(null), 4000);
    },
    removeFromCart: (slug) => setCart((current) => current.filter((line) => line.product.slug !== slug)),
    updateCartQuantity: (slug, quantity) => setCart((current) => quantity > 0
      ? current.map((line) => line.product.slug === slug ? { ...line, quantity } : line)
      : current.filter((line) => line.product.slug !== slug)),
    toggleWishlist: (slug, product) => {
      setWishlist((current) => {
        const isSaved = current.includes(slug);
        setNotice({
          title: isSaved ? "Removed from wishlist" : "Added to wishlist",
          detail: product?.name ?? "Product",
          tone: "wishlist",
        });
        window.setTimeout(() => setNotice(null), 4000);
        return isSaved ? current.filter((item) => item !== slug) : [...current, slug];
      });
      setWishlistItems((current) => current.some((item) => item.slug === slug)
        ? current.filter((item) => item.slug !== slug)
        : product ? [...current, product] : current);
    },
    isWishlisted: (slug) => wishlist.includes(slug),
    wishlistItems,
  }), [cart, wishlist, wishlistItems]);

  return (
    <ShopStateContext.Provider value={value}>
      {children}
      {notice ? (
        <div className="shop-notice fixed right-4 top-24 z-[60] flex max-w-[calc(100vw-2rem)] items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/95 px-4 py-3 text-white shadow-[0_18px_50px_rgba(15,23,42,0.28)] backdrop-blur-md sm:right-6" role="status" aria-live="polite">
          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm ${notice.tone === "cart" ? "bg-emerald-400/15 text-emerald-300" : "bg-sky-400/15 text-sky-300"}`} aria-hidden="true">✓</span>
          <span className="min-w-0">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">{notice.title}</span>
            <span className="mt-0.5 block max-w-56 truncate text-sm font-medium text-white">{notice.detail}</span>
          </span>
        </div>
      ) : null}
    </ShopStateContext.Provider>
  );
}

export function useShopState() {
  const context = useContext(ShopStateContext);
  if (!context) throw new Error("useShopState must be used inside ShopStateProvider");
  return context;
}
