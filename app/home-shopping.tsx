"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Product, ProductModel, getBrandList } from "@/lib/catalog";

function ModelCard({ model }: { model: ProductModel }) {
  const brandSlug = getBrandList().find((brand) => brand.id === model.brandId)?.slug ?? model.brandId;
  return <Link href={`/brands/${brandSlug}/${model.slug}`} className="model-showcase-card group">
    <div className="model-showcase-image"><img src={model.image} alt={model.name} /></div>
    <div className="model-showcase-copy"><div><span className="shop-eyebrow">Model</span><h3>{model.name}</h3></div>{model.price !== undefined ? <strong>₹{model.price.toLocaleString("en-IN")}</strong> : null}</div>
  </Link>;
}

const categoryMeta = [
  { slug: "ro", label: "RO Purifiers", detail: "Complete water systems", image: "/RO1.jpeg" },
  { slug: "accessories", label: "RO Accessories", detail: "Parts that fit", image: "/RO6.jpeg" },
  { slug: "combo-offers", label: "Combo Offers", detail: "Smarter bundles", image: "/RO3.jpeg" },
  { slug: "amc", label: "AMC & Services", detail: "Care when needed", image: "/RO8.jpeg" },
];

function ModelShowcase({ title, eyebrow, models, href }: { title: string; eyebrow: string; models: ProductModel[]; href: string }) {
  const railRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || models.length < 2) return;
    const timer = window.setInterval(() => {
      const rail = railRef.current;
      if (!rail) return;
      const nextLeft = rail.scrollLeft + Math.max(rail.clientWidth * 0.72, 280);
      rail.scrollTo({ left: nextLeft >= rail.scrollWidth - rail.clientWidth ? 0 : nextLeft, behavior: "smooth" });
    }, 4500);
    return () => window.clearInterval(timer);
  }, [paused, models.length]);

  function move(direction: number) {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({ left: direction * Math.max(rail.clientWidth * 0.72, 280), behavior: "smooth" });
    setPaused(true);
    window.setTimeout(() => setPaused(false), 7000);
  }

  if (!models.length) return null;

  return (
    <section className="shop-section">
      <div className="shop-section-heading">
        <div><span className="shop-eyebrow">{eyebrow}</span><h2>{title}</h2></div>
        <div className="shop-section-actions"><Link href={href}>View all <span aria-hidden="true">→</span></Link><button type="button" onClick={() => move(-1)} aria-label={`Previous ${title}`}>&larr;</button><button type="button" onClick={() => move(1)} aria-label={`Next ${title}`}>&rarr;</button></div>
      </div>
      <div ref={railRef} className={`product-showcase-list ${models.length === 1 ? "single-product" : ""}`} onPointerEnter={() => setPaused(true)} onPointerLeave={() => setPaused(false)} onTouchStart={() => setPaused(true)}>
        {models.map((model) => <div className="product-showcase-item" key={model.id}><ModelCard model={model} /></div>)}
      </div>
    </section>
  );
}

export function HomeShopping({ products, models }: { products: Product[]; models: ProductModel[] }) {
  const [slide, setSlide] = useState(0);
  const heroImages = Array.from(new Set([
    ...models.flatMap((model) => [model.image, ...(model.gallery ?? [])]),
    ...products.filter((product) => product.newArrival || product.bestSeller || product.featured).map((product) => product.image),
  ].filter(Boolean))).length ? Array.from(new Set([
    ...models.flatMap((model) => [model.image, ...(model.gallery ?? [])]),
    ...products.filter((product) => product.newArrival || product.bestSeller || product.featured).map((product) => product.image),
  ].filter(Boolean))) : ["/RO1.jpeg", "/RO2.jpeg", "/RO3.jpeg"];

  useEffect(() => {
    const timer = window.setInterval(() => setSlide((current) => (current + 1) % heroImages.length), 5000);
    return () => window.clearInterval(timer);
  }, [heroImages.length]);

  const activeImage = heroImages[slide % heroImages.length];
  const visibleProducts = products.filter((product) => product.status !== "inactive");
  const visibleModels = models.filter((model) => model.status !== "inactive");
  const modelSection = (flag: "newArrival" | "bestSeller" | "deal" | "featured") => {
    const flagged = visibleModels.filter((model) => model[flag]);
    return flagged.length ? flagged : visibleModels;
  };
  const categories = categoryMeta.filter((category) => category.slug === "amc" || visibleProducts.some((product) => product.category === category.slug));

  return (
    <main className="storefront-main">
      <section className="storefront-hero">
        <div className="storefront-hero-copy"><span className="shop-eyebrow">VINI RO marketplace</span><h1>Pure water, made easier.</h1><p>Shop dependable RO systems, models, and genuine accessories for everyday homes.</p><Link href="/products" className="shop-primary-button">Shop products<span aria-hidden="true">→</span></Link><div className="hero-dots" aria-label="Model images">{heroImages.map((image, index) => <button key={`${image}-${index}`} type="button" className={index === slide % heroImages.length ? "active" : ""} onClick={() => setSlide(index)} aria-label={`Show model image ${index + 1}`} />)}</div></div>
        <div key={activeImage} className="storefront-hero-image"><img src={activeImage} alt="RO model" /><div className="hero-image-label"><span>VINI RO</span><strong>Quality water care</strong></div></div>
      </section>

      <section className="shop-section category-section"><div className="shop-section-heading"><div><span className="shop-eyebrow">Start exploring</span><h2>Shop by category</h2></div></div><div className="category-rail">{categories.map((category) => <Link key={category.slug} href={category.slug === "amc" ? "/services" : category.slug === "accessories" ? "/accessories" : category.slug === "combo-offers" ? "/brands" : `/products?category=${category.slug}`} className="category-card"><img src={category.image} alt="" /><span>{category.label}</span><small>{category.detail}</small><b aria-hidden="true">→</b></Link>)}</div></section>

      <ModelShowcase title="New arrivals" eyebrow="Fresh to the store" models={modelSection("newArrival")} href="/brands" />
      <ModelShowcase title="Best sellers" eyebrow="Customer favourites" models={modelSection("bestSeller")} href="/brands" />
      <ModelShowcase title="Deals & offers" eyebrow="Value for your setup" models={modelSection("deal")} href="/brands" />
      <ModelShowcase title="Featured models" eyebrow="Picked by VINI RO" models={modelSection("featured")} href="/brands" />

      <section className="shop-section trust-band"><div><span className="shop-eyebrow">Why VINI RO</span><h2>Practical products. Reliable support.</h2></div><div className="trust-points"><div><strong>Genuine parts</strong><span>Products selected for dependable RO maintenance.</span></div><div><strong>Clear pricing</strong><span>Live catalog prices with no made-up offers.</span></div><div><strong>Local service</strong><span>Support for Ahmedabad homes and businesses.</span></div></div></section>
    </main>
  );
}