"use client";

/* eslint-disable @next/next/no-img-element -- Catalog images may use admin-provided hosts not configured for Next image optimization. */
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useShopState } from "@/components/shop-state";
import { ModelReviews } from "@/components/model-reviews";
import type { Product } from "@/lib/catalog";

export type ProductDetailRecommendation = {
  id: string;
  name: string;
  brand: string;
  href: string;
  image: string;
  price?: number;
  description: string;
};

type ProductDetailExperienceProps = {
  product: Product;
  title: string;
  brandName: string;
  brandHref: string;
  recommendations: ProductDetailRecommendation[];
  priceAvailable?: boolean;
  catalogError?: string;
  subtitle?: string;
  colorOptions?: Array<{ name: string; image: string; price?: number; isPrimary?: boolean }>;
  selectedColorIndex?: number;
  onColorSelect?: (index: number) => void;
  modelId?: string;
};

function Icon({ name, className = "" }: { name: "heart" | "zoom" | "truck" | "shield" | "support" | "check"; className?: string }) {
  const paths = {
    heart: <path d="M20.8 8.6c0 5.2-8.8 10-8.8 10s-8.8-4.8-8.8-10a4.7 4.7 0 0 1 8.8-2.2 4.7 4.7 0 0 1 8.8 2.2Z" />,
    zoom: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.5 4.5M10.8 7.5v6.6M7.5 10.8h6.6" /></>,
    truck: <><path d="M3 6h11v11H3zM14 10h4l3 3v4h-7z" /><circle cx="7.5" cy="18" r="1.5" /><circle cx="17.5" cy="18" r="1.5" /></>,
    shield: <><path d="M12 3 20 6v5c0 5-3.5 8.2-8 10-4.5-1.8-8-5-8-10V6l8-3Z" /><path d="m8.5 12 2.2 2.2 4.8-4.8" /></>,
    support: <><path d="M4 13v-2a8 8 0 0 1 16 0v2" /><path d="M4 13h3v6H5a2 2 0 0 1-2-2v-2a2 2 0 0 1 1-2ZM20 13h-3v6h2a2 2 0 0 0 2-2v-2a2 2 0 0 0-1-2ZM17 19a5 5 0 0 1-5 2" /></>,
    check: <path d="m5 12 4 4L19 6" />,
  };

  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function formatPrice(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

export function ProductDetailExperience({
  product,
  title,
  brandName,
  brandHref,
  recommendations,
  priceAvailable = true,
  catalogError = "",
  subtitle,
  colorOptions = [],
  selectedColorIndex = 0,
  onColorSelect,
  modelId,
}: ProductDetailExperienceProps) {
  const router = useRouter();
  const { addToCart, isWishlisted, toggleWishlist } = useShopState();
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const galleryTrackRef = useRef<HTMLDivElement>(null);
  const gallery = [...new Set([product.image, ...product.gallery].filter(Boolean))];
  const selectedImage = gallery[activeImage] ?? product.image;
  const wishlisted = isWishlisted(product.slug);
  const outOfStock = product.inventory <= 0 || product.stockStatus === "out-of-stock";
  const purchaseDisabled = !priceAvailable || outOfStock;
  const specifications = Object.entries(product.specifications ?? {});
  const highlights = [
    ...(product.technology ? [{ label: "Purification", value: product.technology }] : []),
    ...(product.capacity ? [{ label: "Capacity", value: product.capacity }] : []),
    ...(product.warranty ? [{ label: "Warranty", value: product.warranty }] : []),
  ];
  const discount = priceAvailable && product.compareAtPrice && product.compareAtPrice > product.price
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : 0;

  useEffect(() => {
    if (!zoomOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setZoomOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [zoomOpen]);

  function addSelectionToCart() {
    if (purchaseDisabled) return;
    addToCart(product, quantity);
    setAddedToCart(true);
    window.setTimeout(() => setAddedToCart(false), 2200);
  }

  function buyNow() {
    if (purchaseDisabled) return;
    addToCart(product, quantity);
    router.push("/checkout");
  }

  function changeQuantity(nextQuantity: number) {
    setQuantity(Math.min(Math.max(nextQuantity, 1), Math.max(product.inventory, 1), 99));
  }

  return (
    <main className="product-detail-page">
      <div className="product-detail-shell">
        {catalogError ? <p className="product-catalog-alert" role="alert">Showing saved catalog information. {catalogError}</p> : null}
        <nav className="product-breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link><span>/</span>
          <Link href="/brands">Brands</Link><span>/</span>
          <Link href={brandHref}>{brandName}</Link><span>/</span>
          <span aria-current="page">{title}</span>
        </nav>

        <div className="product-detail-top">
          <section className="product-gallery-column" aria-label={`${title} product images`}>
            <div className="product-image-frame">
              <span className="product-image-kicker">{brandName}</span>
              <div ref={galleryTrackRef} className="product-gallery-track" onScroll={(event) => {
                const track = event.currentTarget;
                setActiveImage(Math.round(track.scrollLeft / track.clientWidth));
              }}>
                {gallery.map((image, index) => (
                  <div className="product-gallery-slide" key={`${image}-${index}`}>
                    <img src={image} alt={`${title}${gallery.length > 1 ? `, image ${index + 1}` : ""}`} loading={index === 0 ? "eager" : "lazy"} decoding="async" />
                  </div>
                ))}
              </div>
              <button className="product-zoom-button" type="button" onClick={() => setZoomOpen(true)} aria-label="Zoom product image"><Icon name="zoom" /></button>
              {gallery.length > 1 ? <span className="product-image-count">{activeImage + 1} / {gallery.length}</span> : null}
            </div>
            {gallery.length > 1 ? (
              <div className="product-thumbnails" aria-label="Choose product image">
                {gallery.map((image, index) => (
                  <button key={`${image}-thumb-${index}`} type="button" className={activeImage === index ? "is-active" : ""} onClick={() => {
                    setActiveImage(index);
                    galleryTrackRef.current?.scrollTo({ left: index * galleryTrackRef.current.clientWidth, behavior: "smooth" });
                  }} aria-label={`View product image ${index + 1}`} aria-pressed={activeImage === index}>
                    <img src={image} alt="" loading="lazy" />
                  </button>
                ))}
              </div>
            ) : null}
            <div className="product-gallery-caption"><span className="product-caption-mark">V</span><span>Thoughtfully chosen for your home</span><span className="product-caption-rule" /></div>
          </section>

          <section className="product-buy-panel" aria-labelledby="product-title">
            <div className="product-title-row">
              <div>
                <Link className="product-brand-link" href={brandHref}>{brandName}</Link>
                <h1 id="product-title">{title}</h1>
              </div>
              <button className={`product-wishlist-icon${wishlisted ? " is-saved" : ""}`} type="button" onClick={() => toggleWishlist(product.slug, product)} aria-label={`${wishlisted ? "Remove" : "Add"} ${title} ${wishlisted ? "from" : "to"} wishlist`} aria-pressed={wishlisted}>
                <Icon name="heart" />
              </button>
            </div>
            <p className="product-subtitle">{subtitle ?? (product.category === "ro" ? "Premium RO Water Purifier" : product.category.replace(/-/g, " "))}</p>
            <p className="product-short-description">{product.shortDescription || product.description}</p>

            <div className="product-review-summary" aria-label={modelId ? "Customer reviews" : "Customer reviews are not available yet"}>
              <span className="review-unavailable">{modelId ? "CUSTOMER FEEDBACK" : "New to Vini RO Store"}</span>
              <span className="review-divider" />
              <a href="#product-reviews">{modelId ? "Read customer reviews" : "Be the first to review"}</a>
            </div>

            <div className="product-price-block">
              <span className="product-price">{priceAvailable ? formatPrice(product.price) : "Price available soon"}</span>
              {priceAvailable && product.compareAtPrice && product.compareAtPrice > product.price ? <span className="product-original-price">{formatPrice(product.compareAtPrice)}</span> : null}
              {discount > 0 ? <span className="product-discount">{discount}% off</span> : null}
              <p>Inclusive of all taxes</p>
            </div>

            {product.badge || product.deal || discount > 0 ? (
              <div className="product-offer-card">
                <span className="offer-emblem"><Icon name="check" /></span>
                <div><strong>{product.deal ? "A little extra value" : discount > 0 ? "Store price" : "A note for you"}</strong><p>{product.badge || (discount > 0 ? `Save ${formatPrice(product.compareAtPrice! - product.price)} on this model` : "Explore this model from Vini RO Store.")}</p></div>
              </div>
            ) : (
              <div className="product-offer-card product-offer-empty">
                <span className="offer-emblem"><Icon name="check" /></span>
                <div><strong>Offers &amp; benefits</strong><p>Any available offers will be shown here. No additional offer is listed for this model.</p></div>
              </div>
            )}

            {highlights.length ? (
              <div className="product-highlights" aria-label="Product highlights">
                {highlights.map((item) => <div className="product-highlight" key={item.label}><span>{item.label}</span><strong>{item.value}</strong></div>)}
              </div>
            ) : null}

            {product.features?.length ? (
              <ul className="product-feature-list">
                {product.features.slice(0, 4).map((feature) => <li key={feature}><Icon name="check" />{feature}</li>)}
              </ul>
            ) : null}

            {colorOptions.length > 1 ? <div className="product-colour-options"><span>Choose an option</span><div>{colorOptions.map((color, index) => <button key={`${color.name}-${index}`} type="button" onClick={() => onColorSelect?.(index)} aria-pressed={selectedColorIndex === index} className={selectedColorIndex === index ? "is-selected" : ""}><img src={color.image} alt="" loading="lazy" /><span>{color.name}</span>{color.price ? <strong>{formatPrice(color.price)}</strong> : null}</button>)}</div></div> : null}

            <div className="product-purchase-row">
              <div className="product-quantity" aria-label="Quantity selector">
                <button type="button" onClick={() => changeQuantity(quantity - 1)} disabled={quantity <= 1} aria-label="Decrease quantity">−</button>
                <span aria-live="polite">{quantity}</span>
                <button type="button" onClick={() => changeQuantity(quantity + 1)} disabled={quantity >= Math.min(product.inventory, 99)} aria-label="Increase quantity">+</button>
              </div>
              <button className="product-add-button" type="button" onClick={addSelectionToCart} disabled={purchaseDisabled}>{outOfStock ? "Currently unavailable" : !priceAvailable ? "Price not available" : addedToCart ? "Added to cart ✓" : "Add to cart"}</button>
            </div>
            <button className="product-buy-now" type="button" onClick={buyNow} disabled={purchaseDisabled}>Buy now</button>
            <p className="product-cart-note">Secure checkout · Your selection is easy to update in your cart</p>

            <div className="product-stock-card">
              <span className={`product-stock-indicator ${outOfStock ? "is-out" : ""}`} />
              <div><strong>{outOfStock ? "Currently unavailable" : product.stockStatus === "low-stock" ? "Limited availability" : "Available to order"}</strong><p>{outOfStock ? "This model is not available to add to your cart right now." : "Delivery options and availability are confirmed at checkout."}</p></div>
              <Icon name="truck" className="product-stock-icon" />
            </div>
          </section>
        </div>

        <section className="product-service-strip" aria-label="Store services">
          <Link href="/services"><Icon name="support" /><span><strong>Service support</strong><small>Repair, maintenance &amp; AMC</small></span><span className="service-arrow">→</span></Link>
          <Link href="/help"><Icon name="shield" /><span><strong>Need a hand?</strong><small>Our team is here to help</small></span><span className="service-arrow">→</span></Link>
          <div><Icon name="truck" /><span><strong>Delivery details</strong><small>Confirmed at checkout</small></span></div>
        </section>

        <nav className="product-section-nav" aria-label="Product information">
          {[["Overview", "#product-overview"], ["Specifications", "#product-specifications"], ["Reviews", "#product-reviews"], ["FAQs", "#product-faqs"]].map(([label, href]) => <a key={href} href={href}>{label}</a>)}
        </nav>

        <section className="product-info-section" id="product-overview">
          <div className="product-section-heading"><span>THE DETAILS</span><h2>Made for everyday living.</h2></div>
          <div className="product-overview-card">
            <div><span className="product-overview-brand">{brandName}</span><h3>{title}</h3><p>{product.description}</p></div>
            {highlights.length ? <div className="product-overview-highlights">{highlights.map((item) => <div key={item.label}><span>{item.label}</span><strong>{item.value}</strong></div>)}</div> : null}
            {product.features?.length ? <ul>{product.features.map((feature) => <li key={feature}><Icon name="check" />{feature}</li>)}</ul> : null}
          </div>
        </section>

        <section className="product-info-section" id="product-specifications">
          <div className="product-section-heading"><span>AT A GLANCE</span><h2>Specifications</h2></div>
          {specifications.length ? (
            <dl className="product-spec-table">
              {specifications.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
            </dl>
          ) : (
            <div className="product-empty-card"><span className="product-empty-icon">i</span><div><strong>Specifications are being updated</strong><p>We only publish details supplied for this model. Please contact our team if you need a specific specification confirmed.</p><Link href="/help">Ask our team <span aria-hidden="true">→</span></Link></div></div>
          )}
        </section>

        <section className="product-info-section" id="product-reviews">
          <div className="product-section-heading"><span>FROM OUR CUSTOMERS</span><h2>Reviews</h2></div>
          {modelId ? <ModelReviews modelId={modelId} modelName={title} /> : <div className="product-empty-card product-review-empty"><span className="review-empty-stars" aria-hidden="true">☆ ☆ ☆ ☆ ☆</span><div><strong>No reviews yet</strong><p>There aren’t any customer reviews for this model yet. Be the first to share your experience.</p><Link href="/help">Contact us about this model <span aria-hidden="true">→</span></Link></div></div>}
        </section>

        <section className="product-info-section product-faq-section" id="product-faqs">
          <div className="product-section-heading"><span>GOOD TO KNOW</span><h2>Frequently asked questions</h2></div>
          <details><summary>What is included with this model?</summary><p>Please refer to the product description and listed specifications. For details not shown there, our support team can help confirm before you order.</p></details>
          <details><summary>How do I check delivery availability?</summary><p>Available delivery options are shown during checkout after you add this model to your cart.</p></details>
          <details><summary>Can I request service or maintenance?</summary><p>Yes. Explore the repair, general service, maintenance and AMC options available on our <Link href="/services">services page</Link>.</p></details>
        </section>

        {recommendations.length ? (
          <section className="product-info-section product-recommendations">
            <div className="product-section-heading"><span>EXPLORE MORE</span><h2>Similar models</h2></div>
            <div className="product-recommendation-rail">
              {recommendations.map((item) => (
                <Link className="product-recommendation-card" key={item.id} href={item.href}>
                  <div className="product-recommendation-image"><img src={item.image} alt={item.name} loading="lazy" /></div>
                  <div className="product-recommendation-copy"><span>{item.brand}</span><strong>{item.name}</strong><p>{item.description}</p>{item.price !== undefined ? <b>{formatPrice(item.price)}</b> : null}<span className="recommendation-link">Explore model <span aria-hidden="true">→</span></span></div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <section className="product-trust-section">
          <div className="product-trust-intro"><span>THE VINI RO DIFFERENCE</span><h2>Shop with confidence.</h2><p>Considered products, dependable support, and a team that is here when you need us.</p></div>
          <div className="product-trust-grid">
            <div><Icon name="shield" /><strong>Thoughtful selection</strong><p>Explore products listed by Vini RO Store.</p></div>
            <div><Icon name="check" /><strong>Secure checkout</strong><p>Complete your order through our secure checkout.</p></div>
            <div><Icon name="truck" /><strong>Order updates</strong><p>Track your order from your account when tracking is available.</p></div>
            <div><Icon name="support" /><strong>Here to help</strong><p>Find product, repair and maintenance support in one place.</p></div>
          </div>
        </section>
      </div>

      <div className="product-mobile-purchase">
        <span>{priceAvailable ? formatPrice(product.price) : "Price available soon"}<small>{!priceAvailable ? "Check back soon" : "Inclusive of all taxes"}</small></span>
        <button type="button" onClick={addSelectionToCart} disabled={purchaseDisabled}>{outOfStock ? "Unavailable" : !priceAvailable ? "Price unavailable" : addedToCart ? "Added ✓" : "Add to cart"}</button>
      </div>

      {zoomOpen ? <div className="product-zoom-overlay" role="dialog" aria-modal="true" aria-label={`${title} image preview`} onClick={() => setZoomOpen(false)}><button type="button" onClick={() => setZoomOpen(false)} aria-label="Close image preview">×</button><div onClick={(event) => event.stopPropagation()}><img src={selectedImage} alt={title} /></div></div> : null}
    </main>
  );
}
