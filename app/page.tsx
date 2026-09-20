import Link from "next/link";
import { RoImageCarousel } from "@/components/ro-image-carousel";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { brands } from "@/lib/catalog";
import { businessConfig } from "@/lib/site-config";

function FeatureVisual({ variant }: { variant: "ultra" | "oem" | "turnaround" | "care" }) {
  const common = { className: "feature-art-svg", viewBox: "0 0 220 170", fill: "none", xmlns: "http://www.w3.org/2000/svg" };

  if (variant === "ultra") {
    return (
      <svg {...common} aria-hidden="true">
        <defs>
          <linearGradient id="ultraA" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#dff5ff" />
            <stop offset="100%" stopColor="#5ca9d6" />
          </linearGradient>
        </defs>
        <rect x="30" y="26" width="160" height="112" rx="28" fill="rgba(8, 22, 34, 0.38)" stroke="rgba(255,255,255,0.78)" />
        <path d="M58 95C79 77 78 48 102 42C122 37 140 52 152 74C168 102 168 124 146 129C120 136 93 130 73 112C64 104 60 100 58 95Z" fill="url(#ultraA)" opacity="0.88"/>
        <path d="M52 112H168" stroke="rgba(255,255,255,0.86)" strokeWidth="3" strokeLinecap="round"/>
        <path d="M74 131C90 118 105 111 128 105" stroke="rgba(208, 233, 244, 0.8)" strokeWidth="4" strokeLinecap="round"/>
        <path d="M92 62L115 75L138 62" stroke="rgba(255,255,255,0.82)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M90 80C105 69 117 69 133 81" stroke="rgba(255,255,255,0.82)" strokeWidth="4" strokeLinecap="round"/>
        <circle cx="161" cy="59" r="10" fill="rgba(255,255,255,0.8)"/>
        <circle cx="61" cy="98" r="8" fill="rgba(228, 244, 255, 0.8)"/>
      </svg>
    );
  }

  if (variant === "oem") {
    return (
      <svg {...common} aria-hidden="true">
        <rect x="36" y="36" width="148" height="98" rx="24" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.76)"/>
        <path d="M58 110L76 66L107 48L139 66L158 110" fill="none" stroke="rgba(220, 235, 245, 0.9)" strokeWidth="4" strokeLinejoin="round"/>
        <path d="M74 86H141" stroke="rgba(217, 231, 240, 0.9)" strokeWidth="4" strokeLinecap="round"/>
        <path d="M106 50V116" stroke="rgba(182, 214, 235, 0.9)" strokeWidth="4" strokeLinecap="round"/>
        <path d="M55 120H165" stroke="rgba(255,255,255,0.7)" strokeWidth="3" strokeLinecap="round"/>
        <path d="M100 58L120 74L100 92L80 74L100 58Z" fill="rgba(146, 202, 229, 0.7)"/>
        <path d="M87 106L99 95L110 106" stroke="rgba(255,255,255,0.72)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  }

  if (variant === "turnaround") {
    return (
      <svg {...common} aria-hidden="true">
        <circle cx="110" cy="85" r="44" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.75)" strokeWidth="3"/>
        <path d="M110 39V85L138 100" stroke="rgba(214, 233, 242, 0.92)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M165 94C159 118 140 134 112 136C81 138 55 118 50 89" stroke="rgba(122, 196, 233, 0.8)" strokeWidth="5" strokeLinecap="round" fill="none"/>
        <path d="M54 88L50 100L62 100" stroke="rgba(122, 196, 233, 0.8)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M82 58C90 51 101 47 111 47" stroke="rgba(255,255,255,0.78)" strokeWidth="4" strokeLinecap="round"/>
        <path d="M59 59L72 42" stroke="rgba(255,255,255,0.7)" strokeWidth="3" strokeLinecap="round"/>
      </svg>
    );
  }

  return (
    <svg {...common} aria-hidden="true">
      <path d="M82 48C82 38 89 31 98 31H126C136 31 142 38 142 48V59C142 68 148 74 157 74C165 74 170 79 170 87V106C170 119 160 129 147 129H73C59 129 49 119 49 106V87C49 79 54 74 62 74C71 74 77 68 77 59V48H82Z" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.8)" strokeWidth="3"/>
      <path d="M70 84C89 73 97 58 108 58C121 58 128 69 146 82" stroke="rgba(222, 244, 255, 0.84)" strokeWidth="5" strokeLinecap="round"/>
      <path d="M98 34V15" stroke="rgba(255,255,255,0.8)" strokeWidth="4" strokeLinecap="round"/>
      <path d="M133 34V15" stroke="rgba(255,255,255,0.8)" strokeWidth="4" strokeLinecap="round"/>
      <path d="M86 97C96 103 108 107 123 106" stroke="rgba(255,255,255,0.8)" strokeWidth="4" strokeLinecap="round"/>
      <circle cx="90" cy="97" r="7" fill="rgba(162, 203, 228, 0.9)"/>
      <circle cx="137" cy="97" r="7" fill="rgba(218, 240, 255, 0.8)"/>
    </svg>
  );
}

const categoryCards = [
  { title: "RO Systems", subtitle: "Ultra-filtration", copy: "High-efficiency purification units designed for modern homes and compact commercial spaces.", variant: "ultra" as const },
  { title: "Genuine Parts", subtitle: "OEM trusted", copy: "Premium filters, membranes, and spares to keep your system running at full performance.", variant: "oem" as const },
  { title: "Installation", subtitle: "Fast turnaround", copy: "Expert fitting, plumbing setup, and on-site guidance from certified service professionals.", variant: "turnaround" as const },
  { title: "AMC Plans", subtitle: "Service care", copy: "Preventive maintenance and annual care with priority support for Ahmedabad homes and businesses.", variant: "care" as const },
];

const showcaseCards = [
  ...brands.map((brand) => ({
    name: brand.name,
    image: brand.logo,
    href: `/brands/${brand.slug}`,
    body: brand.description,
  })),
  {
    name: "Accessories",
    image: "/RO7.jpeg",
    href: "/accessories",
    body: "Replacement filters, membranes, and service essentials.",
  },
  {
    name: "View more",
    image: "/RO8.jpeg",
    href: "/products",
    body: "Explore all brands and product ranges.",
  },
];

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="luxury-shell">
        <section className="luxury-hero">
          <div className="luxury-backdrop" />
          <div className="luxury-hero-inner">
            <div className="luxury-copy">
              <span className="luxury-kicker">VINI Electrical &amp; RO Trading</span>
              <h1>Pure Water. Better Living.</h1>
              <p className="luxury-subhead">
                Premium RO Systems • Genuine Spare Parts • Expert Service • AMC
              </p>

              <div className="luxury-cta-row">
                <Link href="/products" className="luxury-primary-btn">Shop RO Systems</Link>
                <Link href="/services" className="luxury-secondary-btn">Book a Service</Link>
              </div>

              <div className="stat-strip">
                {showcaseCards.map((card) => (
                  <Link key={card.name} href={card.href} className="stat-pill brand-stat-pill">
                    <div className="brand-stat-avatar">
                      <img src={card.image} alt={card.name} />
                    </div>
                    <div className="brand-stat-copy">
                      <span>{card.name}</span>
                      <small>{card.body}</small>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="hero-visual-panel" aria-label="Premium RO product showcase">
              <div className="visual-surface">
                <RoImageCarousel />
              </div>

              <div className="floating-badge badge-featured">Premium collection</div>
              <div className="floating-badge badge-price">RO systems</div>
            </div>
          </div>
        </section>

        <section className="premium-bar">
          <div className="premium-bar-inner">
            <div>
              <span>Premium Purification</span>
              <strong>Path to cleaner everyday living</strong>
            </div>
            <div>
              <span>Trusted service</span>
              <strong>Fast installation &amp; repair</strong>
            </div>
            <div>
              <span>Original spare parts</span>
              <strong>Built for long-term reliability</strong>
            </div>
          </div>
        </section>

        <section className="content-section">
          <div className="section-heading align-left">
            <span className="section-tag">Everything VINI offers</span>
            <h2>Premium water care for homes, offices, and businesses.</h2>
          </div>

          <div className="category-grid">
            {categoryCards.map((card, index) => (
              <Link key={card.title} href={index === 0 ? "/products" : index === 1 ? "/products" : index === 2 ? "/services" : "/services/amc"} className="category-tile">
                <div className="category-art">
                  <FeatureVisual variant={card.variant} />
                </div>
                <div className="category-copy">
                  <span>{card.subtitle}</span>
                  <h3>{card.title}</h3>
                  <p>{card.copy}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="content-section dark-panel">
          <div className="split-panel">
            <div>
              <span className="section-tag light">Why homeowners choose VINI</span>
              <h2>Designed around trust, performance, and everyday peace of mind.</h2>
            </div>
            <div className="info-list">
              <div>
                <strong>Genuine RO components</strong>
                <p>From membranes to filters, we only recommend parts that preserve purity and system life.</p>
              </div>
              <div>
                <strong>Expert support</strong>
                <p>Installation, troubleshooting, and annual maintenance help keep your water system dependable.</p>
              </div>
              <div>
                <strong>Transparent pricing</strong>
                <p>Clear service planning with practical AMC options for Ahmedabad homes and commercial setups.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="content-section compact">
          <div className="feature-banner">
            <div>
              <span className="section-tag">Annual maintenance</span>
              <h2 className="amc-heading">AMC starting at 2900/-</h2>
            </div>
            <div className="feature-banner-meta">
              <p>Service + visit included</p>
              <p>Replacement parts charged separately</p>
            </div>
            <Link href="/services/amc" className="luxury-primary-btn alt">Book AMC</Link>
          </div>
        </section>

        <section className="content-section bottom-cta">
          <div className="cta-panel">
            <div>
              <span className="section-tag">Need help?</span>
              <h2>Let’s build a cleaner, healthier water setup for your space.</h2>
            </div>
            <div className="cta-actions">
              <a href={`tel:${businessConfig.phone.replace(/\s+/g, "")}`} className="luxury-primary-btn alt" aria-label="Call VINI RO SERVICES">
                <span className="cta-icon" aria-hidden="true">☎</span>
                <span>Call +91 9104881806</span>
              </a>
              <a href={`mailto:${businessConfig.email}`} className="luxury-secondary-btn dark" aria-label="Email VINI RO SERVICES">
                <span className="cta-icon" aria-hidden="true">✉</span>
                <span>Email us</span>
              </a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
