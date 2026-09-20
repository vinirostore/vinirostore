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
  cartCount: number;
  addToCart: (product: Product) => void;
  removeFromCart: (slug: string) => void;
  updateCartQuantity: (slug: string, quantity: number) => void;
  toggleWishlist: (slug: string) => void;
  isWishlisted: (slug: string) => boolean;
};

const ShopStateContext = createContext<ShopState | null>(null);
const CART_KEY = "vini-cart";
const WISHLIST_KEY = "vini-wishlist";

function getScopedStorageKey(prefix: string, email?: string | null) {
  return email ? `${prefix}:${email.trim().toLowerCase()}` : prefix;
}

export function ShopStateProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const { user } = useAuthState();

  useEffect(() => {
    const cartKey = getScopedStorageKey(CART_KEY, user?.email);
    const wishlistKey = getScopedStorageKey(WISHLIST_KEY, user?.email);

    try {
      const storedCart = window.localStorage.getItem(cartKey);
      const storedWishlist = window.localStorage.getItem(wishlistKey);
      setCart(storedCart ? (JSON.parse(storedCart) as CartLine[]) : []);
      setWishlist(storedWishlist ? (JSON.parse(storedWishlist) as string[]) : []);
    } catch {
      window.localStorage.removeItem(cartKey);
      window.localStorage.removeItem(wishlistKey);
      setCart([]);
      setWishlist([]);
    }
  }, [user?.email]);

  useEffect(() => {
    const cartKey = getScopedStorageKey(CART_KEY, user?.email);
    window.localStorage.setItem(cartKey, JSON.stringify(cart));
  }, [cart, user?.email]);

  useEffect(() => {
    const wishlistKey = getScopedStorageKey(WISHLIST_KEY, user?.email);
    window.localStorage.setItem(wishlistKey, JSON.stringify(wishlist));
  }, [wishlist, user?.email]);

  const value = useMemo<ShopState>(() => ({
    cart,
    wishlist,
    cartCount: cart.reduce((total, line) => total + line.quantity, 0),
    addToCart: (product) => setCart((current) => {
      const existing = current.find((line) => line.product.slug === product.slug);
      if (existing) {
        return current.map((line) => line.product.slug === product.slug ? { ...line, quantity: line.quantity + 1 } : line);
      }
      return [...current, { product, quantity: 1 }];
    }),
    removeFromCart: (slug) => setCart((current) => current.filter((line) => line.product.slug !== slug)),
    updateCartQuantity: (slug, quantity) => setCart((current) => quantity > 0
      ? current.map((line) => line.product.slug === slug ? { ...line, quantity } : line)
      : current.filter((line) => line.product.slug !== slug)),
    toggleWishlist: (slug) => setWishlist((current) => current.includes(slug)
      ? current.filter((item) => item !== slug)
      : [...current, slug]),
    isWishlisted: (slug) => wishlist.includes(slug),
  }), [cart, wishlist]);

  return <ShopStateContext.Provider value={value}>{children}</ShopStateContext.Provider>;
}

export function useShopState() {
  const context = useContext(ShopStateContext);
  if (!context) throw new Error("useShopState must be used inside ShopStateProvider");
  return context;
}
