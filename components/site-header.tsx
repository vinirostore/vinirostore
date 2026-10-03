"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, KeyboardEvent as ReactKeyboardEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthState } from "@/components/auth-state";
import { useShopState } from "@/components/shop-state";
import { Accessory, Brand, Product, ProductModel, getAccessoryList, getAccessoryListFromStore, getBrandList, getBrandListFromStore, getModelList, getModelSearchSuggestionsFromStore, getProductsFromStore, getProductsFromStoreSync } from "@/lib/catalog";

type SearchSuggestion = { id: string; kind: string; name: string; detail: string; href: string; searchTerms: string[] };

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
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Array<Pick<ProductModel, "id" | "name" | "slug" | "brandId">>>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [searchCatalogLoaded, setSearchCatalogLoaded] = useState(false);
  const [searchCatalogError, setSearchCatalogError] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuScrollPosition = useRef(0);
  const searchCatalogLoad = useRef<Promise<void> | null>(null);
  const accountHref = isAuthenticated ? "/account" : "/login";

  function loadSearchCatalog() {
    if (searchCatalogLoad.current) return searchCatalogLoad.current;

    setBrands(getBrandList());
    setModels(getModelList().map(({ id, name, slug, brandId }) => ({ id, name, slug, brandId })));
    setProducts(getProductsFromStoreSync());
    setAccessories(getAccessoryList());

    let timeoutId: number | undefined;
    const timeout = new Promise<never>((_resolve, reject) => {
      timeoutId = window.setTimeout(() => reject(new Error("Catalog search refresh timed out after 10 seconds.")), 10_000);
    });
    const load = Promise.race([Promise.allSettled([
      getBrandListFromStore(), getModelSearchSuggestionsFromStore(), getProductsFromStore(), getAccessoryListFromStore(),
    ]), timeout]).then((results) => {
      const [brandsResult, modelsResult, productsResult, accessoriesResult] = results;
      const failures: string[] = [];
      if (brandsResult.status === "fulfilled") setBrands(brandsResult.value);
      else failures.push(`brands: ${String(brandsResult.reason)}`);
      if (modelsResult.status === "fulfilled") setModels(modelsResult.value);
      else failures.push(`models: ${String(modelsResult.reason)}`);
      if (productsResult.status === "fulfilled") setProducts(productsResult.value);
      else failures.push(`products: ${String(productsResult.reason)}`);
      if (accessoriesResult.status === "fulfilled") setAccessories(accessoriesResult.value);
      else failures.push(`accessories: ${String(accessoriesResult.reason)}`);

      setSearchCatalogError(failures.length ? "Some live catalog suggestions could not be loaded. The displayed results may be incomplete." : "");
      if (failures.length) console.error("Could not refresh the search catalog:", failures);
      setSearchCatalogLoaded(true);
    }).catch((error: unknown) => {
      const detail = error instanceof Error ? error.message : "Unknown catalog refresh error.";
      console.error("Could not refresh the search catalog:", detail);
      setSearchCatalogError("Live catalog suggestions are taking too long to load. Results may be incomplete; please retry shortly.");
      setSearchCatalogLoaded(true);
    }).finally(() => {
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
      searchCatalogLoad.current = null;
    });
    searchCatalogLoad.current = load;
    return load;
  }

  useEffect(() => {
    const handleCatalogChange = () => { void loadSearchCatalog(); };
    window.addEventListener("vini-catalog-updated", handleCatalogChange);
    return () => {
      window.removeEventListener("vini-catalog-updated", handleCatalogChange);
    };
  }, []);

  const normalizedQuery = query.trim().toLocaleLowerCase();
  const brandById = new Map(brands.map((brand) => [brand.id, brand]));
  const suggestions: SearchSuggestion[] = normalizedQuery ? [
    ...brands.map((brand) => ({ id: `brand-${brand.id}`, kind: "Brand", name: brand.name, detail: "Browse brand models", href: `/brands/${encodeURIComponent(brand.slug)}`, searchTerms: [brand.name] })),
    ...models.map((model) => {
      const brand = brandById.get(model.brandId);
      return { id: `model-${model.id}`, kind: "Model", name: model.name, detail: brand?.name ?? "RO model", href: `/brands/${encodeURIComponent(brand?.slug ?? model.brandId)}/${encodeURIComponent(model.slug)}`, searchTerms: [model.name, brand?.name ?? ""] };
    }),
    ...products.map((product) => ({ id: `product-${product.id}`, kind: "Product", name: product.name, detail: product.brand || product.category, href: `/products/${encodeURIComponent(product.slug)}`, searchTerms: [product.name, product.model ?? "", product.brand, product.sku] })),
    ...accessories.map((accessory) => ({ id: `accessory-${accessory.id}`, kind: "Accessory", name: accessory.name, detail: accessory.category, href: `/accessories/${encodeURIComponent(accessory.slug)}`, searchTerms: [accessory.name, accessory.category] })),
  ].filter((item) => item.searchTerms.some((term) => term.toLocaleLowerCase().startsWith(normalizedQuery))) : [];

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
    const exactMatch = suggestions.find((item) => item.name.toLocaleLowerCase() === normalizedQuery);
    const selected = searchCatalogLoaded ? exactMatch ?? suggestions[activeSuggestion] : undefined;
    setIsSearchOpen(false);
    router.push(selected?.href ?? (normalizedQuery ? `/products?search=${encodeURIComponent(query.trim())}` : "/products"));
  }

  function handleSearchKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setIsSearchOpen(false);
    } else if (event.key === "ArrowDown" && searchCatalogLoaded && suggestions.length) {
      event.preventDefault();
      setIsSearchOpen(true);
      setActiveSuggestion((index) => (index + 1) % suggestions.length);
    } else if (event.key === "ArrowUp" && searchCatalogLoaded && suggestions.length) {
      event.preventDefault();
      setIsSearchOpen(true);
      setActiveSuggestion((index) => (index <= 0 ? suggestions.length - 1 : index - 1));
    }
  }

  function selectSuggestion(suggestion: SearchSuggestion) {
    setIsSearchOpen(false);
    setQuery(suggestion.name);
    router.push(suggestion.href);
  }

  return (
    <header className="store-header">
      <div className="store-header-main">
        <button type="button" className="store-menu-button" onClick={() => { menuScrollPosition.current = window.scrollY; setIsMenuOpen(true); }} aria-label="Open shopping menu" aria-expanded={isMenuOpen} aria-controls="store-menu-drawer"><span /><span /><span /></button>
        <Link href="/" className="store-logo" aria-label="VINI RO home"><span className="store-logo-image"><Image src="/vini-wordmark.png" alt="VINI RO" fill priority sizes="150px" /></span></Link>
        <form className="store-search" onSubmit={handleSearch} role="search" onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsSearchOpen(false); }}>
          <span aria-hidden="true">⌕</span>
          <input value={query} onChange={(event) => { setQuery(event.target.value); setActiveSuggestion(-1); setIsSearchOpen(true); void loadSearchCatalog(); }} onFocus={() => { setIsSearchOpen(true); void loadSearchCatalog(); }} onKeyDown={handleSearchKeyDown} placeholder="Search products, brands & accessories" aria-label="Search products, brands and accessories" role="combobox" aria-autocomplete="list" aria-expanded={isSearchOpen && Boolean(normalizedQuery)} aria-controls="store-search-results" aria-activedescendant={suggestions[activeSuggestion] ? `search-option-${suggestions[activeSuggestion].id}` : undefined} />
          <button type="submit">Search</button>
          {isSearchOpen && normalizedQuery ? <div className="store-search-results" id="store-search-results" role="listbox" aria-label="Search suggestions">
            {!searchCatalogLoaded ? <p className="store-search-message">Loading suggestions...</p> : suggestions.length ? suggestions.map((suggestion, index) => <button key={suggestion.id} id={`search-option-${suggestion.id}`} type="button" role="option" aria-selected={index === activeSuggestion} className="store-search-result" onMouseEnter={() => setActiveSuggestion(index)} onClick={() => selectSuggestion(suggestion)}><span><strong>{suggestion.name}</strong><small>{suggestion.detail}</small></span><small>{suggestion.kind}</small></button>) : <p className="store-search-message">No matching brands, models, products, or accessories.</p>}
            {searchCatalogError ? <p className="store-search-message" role="status">{searchCatalogError}</p> : null}
          </div> : null}
        </form>
        <nav className="store-actions" aria-label="Shopping actions"><Link href={accountHref} aria-label="Account"><span className="store-action-icon"><AccountIcon /></span><small>Account</small></Link><Link href="/wishlist" aria-label={`Wishlist, ${wishlist.length} items`}><span className="store-action-icon"><WishlistIcon /></span><small>Wishlist <b>{wishlist.length}</b></small></Link><Link href="/cart" aria-label={`Cart, ${cartCount} items`}><span className="store-action-icon"><CartIcon /></span><small>Cart <b>{cartCount}</b></small></Link></nav>
      </div>
      <nav className="category-nav" aria-label="Shop categories">{categoryLinks.map((item) => <Link key={`${item.label}-${item.href}`} href={item.href}>{item.label}</Link>)}</nav>
      <div className={`store-menu-overlay ${isMenuOpen ? "open" : ""}`} onClick={() => setIsMenuOpen(false)} aria-hidden="true" />
      <aside id="store-menu-drawer" className={`store-menu-drawer ${isMenuOpen ? "open" : ""}`} aria-label="Shopping menu" aria-hidden={!isMenuOpen}><div className="drawer-heading"><strong>Shop VINI RO</strong><button type="button" onClick={() => setIsMenuOpen(false)} aria-label="Close shopping menu">×</button></div><Link href="/" className="store-menu-home" onClick={() => setIsMenuOpen(false)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m3 10 9-7 9 7" /><path d="M5 9v12h14V9M9 21v-7h6v7" /></svg>Home</Link><nav>{[...categoryLinks, { label: "Wishlist", href: "/wishlist" }, { label: "Orders & account", href: accountHref }, { label: "Help & contact", href: "/help" }].map((item) => <Link key={`${item.label}-${item.href}`} href={item.href} onClick={() => setIsMenuOpen(false)}>{item.label}<span aria-hidden="true">→</span></Link>)}</nav></aside>
    </header>
  );
}
