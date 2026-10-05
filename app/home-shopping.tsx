"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Brand, Product, ProductModel } from "@/lib/catalog";
import accessoriesImage from "../accessories.png";
import amcImage from "../amc.png";

function ModelCard({ model, brands }: { model: ProductModel; brands: Brand[] }) {
  const brandSlug = brands.find((brand) => brand.id === model.brandId)?.slug ?? model.brandId;
  const colorCount = model.colors?.length ?? 0;
  return <Link href={`/brands/${brandSlug}/${model.slug}`} className="model-showcase-card group">
    <div className="model-showcase-image">
      {colorCount ? <span className="model-colour-count">+{colorCount}</span> : null}
      <img src={model.image} alt={model.name} />
    </div>
    <div className="model-showcase-copy"><div><span className="shop-eyebrow">Model</span><h3>{model.name}</h3></div>{model.price !== undefined ? <strong>₹{model.price.toLocaleString("en-IN")}</strong> : null}</div>
  </Link>;
}

function MobileModelCard({ model, brands }: { model: ProductModel; brands: Brand[] }) {
  const brand = brands.find((item) => item.id === model.brandId);
  const brandSlug = brand?.slug ?? model.brandId;
  const badges = [
    [model.newArrival, "New arrival"],
    [model.bestSeller, "Best seller"],
    [model.deal, "Deal"],
    [model.featured, "Featured"],
  ] as const;
  const colorCount = model.colors?.length ?? 0;

  return <Link href={`/brands/${brandSlug}/${model.slug}`} className="mobile-model-card">
    <div className="mobile-model-image">
      {colorCount ? <span className="mobile-model-colour-count">+{colorCount}</span> : null}
      <img src={model.image} alt={model.name} />
    </div>
    <div className="mobile-model-copy">
      <div className="mobile-model-badges">
        {badges.filter(([active]) => active).map(([, label]) => <span key={label}>{label}</span>)}
      </div>
      {brand ? <span className="mobile-model-brand">{brand.name}</span> : null}
          <h3>{model.name}</h3>
      {model.price !== undefined ? <strong>₹{model.price.toLocaleString("en-IN")}</strong> : null}
    </div>
  </Link>;
}

const brandLogos = [
  { name: "AQUA MARS", file: "AQUA MARS LOGO.jpeg" },
  { name: "AQUA V5", file: "AQUA V5 LOGO.jpeg" },
  { name: "EMIRA", file: "EMIRA LOGO.jpeg" },
  { name: "ROTEK", file: "ROTEK LOGO.jpeg" },
  { name: "LEXON", file: "LEXON LOGO.jpeg" },
  { name: "AQUA 9", file: "AQUA 9 LOGO.jpeg" },
];

function BrandLogoMarquee() {
  return <section className="brand-logo-marquee" aria-label="Brands available at VINI RO">
    <div className="brand-logo-marquee-viewport">
      <div className="brand-logo-marquee-track">
        {[false, true].map((duplicate) => <div key={String(duplicate)} className="brand-logo-marquee-group" aria-hidden={duplicate}>
          {brandLogos.map((brand) => <div key={brand.name} className="brand-logo-marquee-item">
            <Image src={`/brand-logos/${encodeURIComponent(brand.file)}`} alt={duplicate ? "" : brand.name} width={180} height={80} />
          </div>)}
        </div>)}
      </div>
    </div>
  </section>;
}

type HeroSlide = { id: string; name: string; image: string };

function HeroModelCarousel({ slides }: { slides: HeroSlide[] }) {
  const copies = slides.length > 1 ? [false, true] : [false];

  return <div className={`storefront-hero-image mobile-hero-image ${slides.length < 2 ? "single-hero-slide" : ""}`} role="region" aria-label="RO model images">
    <div className="hero-model-track" style={{ animationDuration: `${Math.max(slides.length * 3, 9)}s` }}>
      {copies.map((duplicate) => <div key={String(duplicate)} className="hero-model-group" aria-hidden={duplicate}>
        {slides.map((slide) => <div key={slide.id} className="hero-model-slide">
          <img src={slide.image} alt={duplicate ? "" : slide.name} />
        </div>)}
      </div>)}
    </div>
  </div>;
}

function DesktopHeroImage({ image }: { image: string }) {
  return <div key={image} className="storefront-hero-image desktop-hero-image"><img src={image} alt="RO model" /></div>;
}

function interleaveModelsByBrand(models: ProductModel[]) {
  const brands = new Map<string, ProductModel[]>();
  for (const model of models) {
    const brandModels = brands.get(model.brandId) ?? [];
    brandModels.push(model);
    brands.set(model.brandId, brandModels);
  }

  const groups = Array.from(brands.values());
  const interleaved: ProductModel[] = [];
  const longestGroup = Math.max(0, ...groups.map((group) => group.length));
  for (let index = 0; index < longestGroup; index += 1) {
    for (let offset = 0; offset < groups.length; offset += 1) {
      const group = groups[(index + offset) % groups.length];
      if (group[index]) interleaved.push(group[index]);
    }
  }
  return interleaved;
}

function ModelShowcase({ title, eyebrow, models, brands, href }: { title: string; eyebrow: string; models: ProductModel[]; brands: Brand[]; href: string }) {
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
        {models.map((model) => <div className="product-showcase-item" key={model.id}><ModelCard model={model} brands={brands} /></div>)}
      </div>
    </section>
  );
}

function ModelsLoading() {
  return <div className="models-loading" role="status" aria-live="polite"><span aria-hidden="true" />Loading models...</div>;
}

export function HomeShopping({ brands, products, models, modelsLoaded, catalogError = "" }: { brands: Brand[]; products: Product[]; models: ProductModel[]; modelsLoaded: boolean; catalogError?: string }) {
  const availableHeroImages = Array.from(new Set([
    ...models.flatMap((model) => [model.image, ...(model.gallery ?? [])]),
    ...products.filter((product) => product.newArrival || product.bestSeller || product.featured).map((product) => product.image),
  ].filter(Boolean)));
  const heroImages = availableHeroImages.length ? availableHeroImages : ["/RO1.jpeg", "/RO2.jpeg", "/RO3.jpeg"];
  const [heroSlide, setHeroSlide] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => setHeroSlide((current) => (current + 1) % heroImages.length), 5000);
    return () => window.clearInterval(timer);
  }, [heroImages.length]);

  const activeHeroImage = heroImages[heroSlide % heroImages.length];
  const visibleModels = models.filter((model) => model.status !== "inactive");
  const modelSection = (flag: "newArrival" | "bestSeller" | "deal" | "featured") => {
    const flagged = visibleModels.filter((model) => model[flag]);
    return flagged.length ? flagged : visibleModels;
  };
  const modelHeroSlides = interleaveModelsByBrand(visibleModels.filter((model) => model.image)).map((model) => ({ id: model.id, name: model.name, image: model.image }));
  const fallbackHeroSlides = heroImages.map((image, index) => ({ id: `fallback-${index}`, name: "Quality water care", image }));
  const heroSlides = modelsLoaded && modelHeroSlides.length ? modelHeroSlides : fallbackHeroSlides;
  return (
    <main className="storefront-main">
      {catalogError ? <p role="alert" className="catalog-refresh-alert">Showing saved catalog information. {catalogError}</p> : null}
      <section className="storefront-hero">
        <div className="storefront-hero-copy"><span className="shop-eyebrow">Premium water, thoughtfully delivered</span><h1>Pure water for a more considered home.</h1><p>Discover dependable purification, genuine parts and expert care, with trusted service for every home.</p><div className="storefront-hero-ctas"><Link href="/products" className="shop-primary-button">Shop Now<span aria-hidden="true">→</span></Link><Link href="/brands" className="shop-secondary-button">Explore Products</Link></div><div className="hero-dots" aria-label="Model images">{heroImages.map((image, index) => <button key={`${image}-${index}`} type="button" className={index === heroSlide ? "active" : ""} onClick={() => setHeroSlide(index)} aria-label={`Show model image ${index + 1}`} />)}</div></div>
        <DesktopHeroImage image={activeHeroImage} />
        <HeroModelCarousel slides={heroSlides} />
      </section>

      <BrandLogoMarquee />

      <section className="shop-section category-section">
        <div className="shop-section-heading">
          <div><span className="shop-eyebrow">Start exploring</span><h2>Shop by category</h2></div>
        </div>
        <div className="premium-category-rail" aria-label="Shop by category">
          <Link href="/services" className="premium-category-card premium-category-card-warm">
            <div className="premium-category-copy">
              <span className="premium-category-eyebrow">Care that lasts</span>
              <h3>AMC &amp;<br />Services</h3>
              <p>Professional care for your RO, whenever you need it.</p>
              <span className="premium-category-price">AMC starting at ₹2,900/-</span>
              <span className="premium-category-link">Explore Services <span aria-hidden="true">→</span></span>
            </div>
            <div className="premium-category-art premium-category-art-warm">
              <Image src={amcImage} alt="Premium RO purifier with AMC service essentials" fill sizes="(max-width: 640px) 78vw, (max-width: 1100px) 44vw, 34vw" />
            </div>
            <span className="premium-category-detail premium-category-detail-warm" aria-hidden="true">CARE · TRUST · SUPPORT</span>
          </Link>

          <Link href="/accessories" className="premium-category-card premium-category-card-cool">
            <div className="premium-category-copy">
              <span className="premium-category-eyebrow">Complete your RO</span>
              <h3>RO<br />Accessories</h3>
              <p>Quality components for better purification.</p>
              <span className="premium-category-link">Explore Accessories <span aria-hidden="true">→</span></span>
            </div>
            <div className="premium-category-art premium-category-art-cool">
              <Image src={accessoriesImage} alt="RO membrane, filters, UV components and tap" fill sizes="(max-width: 640px) 78vw, (max-width: 1100px) 44vw, 34vw" />
            </div>
            <span className="premium-category-detail premium-category-detail-cool" aria-hidden="true">QUALITY · FIT · PERFORMANCE</span>
          </Link>
        </div>
      </section>

      <section className="shop-section mobile-model-catalog">
        <div className="shop-section-heading"><div><span className="shop-eyebrow">Browse the range</span><h2>All models</h2></div></div>
        {!modelsLoaded ? <ModelsLoading /> : visibleModels.length ? <div className="mobile-model-list">{visibleModels.map((model) => <MobileModelCard key={model.id} model={model} brands={brands} />)}</div> : <p className="models-empty">No models are available right now.</p>}
      </section>

      <div className="desktop-model-showcases" aria-live="polite">
        {!modelsLoaded ? <section className="shop-section"><div className="shop-section-heading"><div><span className="shop-eyebrow">Browse the range</span><h2>Models</h2></div></div><ModelsLoading /></section> : visibleModels.length ? <>
          <ModelShowcase title="New arrivals" eyebrow="Fresh to the store" models={modelSection("newArrival")} brands={brands} href="/brands" />
          <ModelShowcase title="Best sellers" eyebrow="Customer favourites" models={modelSection("bestSeller")} brands={brands} href="/brands" />
          <ModelShowcase title="Deals & offers" eyebrow="Value for your setup" models={modelSection("deal")} brands={brands} href="/brands" />
          <ModelShowcase title="Featured models" eyebrow="Picked by VINI RO" models={modelSection("featured")} brands={brands} href="/brands" />
        </> : <section className="shop-section"><div className="shop-section-heading"><div><span className="shop-eyebrow">Browse the range</span><h2>Models</h2></div></div><p className="models-empty">No models are available right now.</p></section>}
      </div>

      <section className="shop-section trust-band"><div><span className="shop-eyebrow">Why VINI RO</span><h2>Practical products. Reliable support.</h2></div><div className="trust-points"><div><strong>Genuine parts</strong><span>Products selected for dependable RO maintenance.</span></div><div><strong>Clear pricing</strong><span>Live catalog prices with no made-up offers.</span></div><div><strong>Local service</strong><span>Support for Ahmedabad homes and businesses.</span></div></div></section>
    </main>
  );
}