"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useAuthState } from "@/components/auth-state";
import { supabase } from "@/lib/supabase";
import type { Product } from "@/lib/catalog";

type CartLine = {
  product: Product;
  quantity: number;
};

type ShopState = {
  cart: CartLine[];
  wishlist: string[];
  wishlistItems: Product[];
  cartCount: number;
  clearCart: () => void;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (slug: string) => void;
  updateCartQuantity: (slug: string, quantity: number) => void;
  toggleWishlist: (slug: string, product?: Product) => void;
  isWishlisted: (slug: string) => boolean;
  persistenceError: string;
};

const ShopStateContext = createContext<ShopState | null>(null);
type ShopNotice = {
  title: string;
  detail: string;
  tone: "cart" | "wishlist";
};

type PersistedShopState = { cart?: CartLine[]; wishlist?: Product[] };

function mergeCart(...groups: CartLine[][]) {
  const merged = new Map<string, CartLine>();
  for (const line of groups.flat()) {
    if (!line?.product?.slug || !Number.isInteger(line.quantity) || line.quantity < 1) continue;
    const existing = merged.get(line.product.slug);
    merged.set(line.product.slug, {
      product: line.product,
      quantity: Math.min(99, (existing?.quantity || 0) + line.quantity),
    });
  }
  return [...merged.values()];
}

function mergeWishlist(...groups: Product[][]) {
  return [...new Map(groups.flat().filter((product) => product?.slug).map((product) => [product.slug, product])).values()];
}

export function ShopStateProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [notice, setNotice] = useState<ShopNotice | null>(null);
  const [persistenceError, setPersistenceError] = useState("");
  const hydratedOwner = useRef("");
  const previousOwner = useRef("");
  const cartRef = useRef(cart);
  const wishlistItemsRef = useRef(wishlistItems);
  const { isAuthReady, user } = useAuthState();
  const clearCart = useCallback(() => setCart([]), []);
  const visiblePersistenceError = user?.id && !supabase
    ? "Supabase is not configured. Your signed-in cart and wishlist cannot be saved."
    : persistenceError;

  useEffect(() => {
    cartRef.current = cart;
    wishlistItemsRef.current = wishlistItems;
  }, [cart, wishlistItems]);

  useEffect(() => {
    if (!isAuthReady) return;
    if (user?.id && !supabase) return;

    let active = true;
    const owner = user?.id || "guest";
    const preserveCurrent = !previousOwner.current || previousOwner.current === "guest";
    const inMemoryCart = preserveCurrent ? cartRef.current : [];
    const inMemoryWishlist = preserveCurrent ? wishlistItemsRef.current : [];

    if (previousOwner.current && previousOwner.current !== owner && !preserveCurrent) {
      setCart([]);
      setWishlist([]);
      setWishlistItems([]);
    }
    previousOwner.current = owner;
    hydratedOwner.current = "";

    const session = user?.id && supabase
      ? supabase.auth.getSession()
      : Promise.resolve({ data: { session: null }, error: null });

    void session.then(async ({ data, error }) => {
      if (error) throw new Error(error.message);
      const token = data.session?.access_token;
      if (user?.id && !token) throw new Error("Your session expired. Sign in again to load saved shopping data.");

      const response = await fetch("/api/customer-shop-state", {
        cache: "no-store",
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const result = await response.json() as { state?: PersistedShopState; guestState?: PersistedShopState; error?: string };
      if (!response.ok || !result.state) throw new Error(result.error || "Could not load your saved cart and wishlist.");
      if (!active) return;

      const persistedState = user?.id ? result.state : result.guestState;
      const customerCart = Array.isArray(persistedState?.cart) ? persistedState.cart : [];
      const guestCart = user?.id && Array.isArray(result.guestState?.cart) ? result.guestState.cart : [];
      const customerWishlist = Array.isArray(persistedState?.wishlist) ? persistedState.wishlist : [];
      const guestWishlist = user?.id && Array.isArray(result.guestState?.wishlist) ? result.guestState.wishlist : [];
      const nextCart = mergeCart(customerCart, guestCart, inMemoryCart);
      const nextWishlist = mergeWishlist(customerWishlist, guestWishlist, inMemoryWishlist);

      setCart(nextCart);
      setWishlist(nextWishlist.map((product) => product.slug));
      setWishlistItems(nextWishlist);
      hydratedOwner.current = owner;
      setPersistenceError("");
    }).catch((loadError: unknown) => {
      if (active) setPersistenceError(loadError instanceof Error ? loadError.message : "Could not load your saved cart and wishlist.");
    });

    return () => {
      active = false;
    };
  }, [isAuthReady, user?.id]);

  useEffect(() => {
    const owner = user?.id || (isAuthReady ? "guest" : "");
    if (!owner || hydratedOwner.current !== owner || (user?.id && !supabase)) return;
    let active = true;
    const timer = window.setTimeout(() => {
      const session = user?.id && supabase
        ? supabase.auth.getSession()
        : Promise.resolve({ data: { session: null }, error: null });

      void session.then(async ({ data, error }) => {
        if (error) throw new Error(error.message);
        const token = data.session?.access_token;
        if (user?.id && !token) throw new Error("Your session expired. Sign in again to save shopping data.");
        const response = await fetch("/api/customer-shop-state", {
          method: "PUT",
          credentials: "include",
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), "Content-Type": "application/json" },
          body: JSON.stringify({ cart, wishlist: wishlistItems }),
        });
        const result = await response.json() as { error?: string };
        if (!response.ok) throw new Error(result.error || "Could not save your cart and wishlist.");
        if (active) setPersistenceError("");
      }).catch((saveError: unknown) => {
        if (active) setPersistenceError(saveError instanceof Error ? saveError.message : "Could not save your cart and wishlist.");
      });
    }, 500);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [cart, isAuthReady, user?.id, wishlistItems]);

  const value = useMemo<ShopState>(() => ({
    cart,
    wishlist,
    cartCount: cart.reduce((total, line) => total + line.quantity, 0),
    persistenceError: visiblePersistenceError,
    clearCart,
    addToCart: (product, quantity = 1) => {
      const quantityToAdd = Number.isFinite(quantity) ? Math.min(99, Math.max(1, Math.floor(quantity))) : 1;
      setCart((current) => {
        const existing = current.find((line) => line.product.slug === product.slug);
        if (existing) {
          return current.map((line) => line.product.slug === product.slug ? { ...line, quantity: Math.min(99, line.quantity + quantityToAdd) } : line);
        }
        return [...current, { product, quantity: quantityToAdd }];
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
  }), [cart, clearCart, visiblePersistenceError, wishlist, wishlistItems]);

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
      {visiblePersistenceError ? <div className="fixed bottom-4 left-4 z-[60] max-w-md rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 shadow-lg" role="alert">{visiblePersistenceError}</div> : null}
    </ShopStateContext.Provider>
  );
}

export function useShopState() {
  const context = useContext(ShopStateContext);
  if (!context) throw new Error("useShopState must be used inside ShopStateProvider");
  return context;
}
