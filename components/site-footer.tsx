import Link from "next/link";
import Image from "next/image";
import { businessConfig, footerLinks } from "@/lib/site-config";

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  const linkGroups = [
    { title: "Company", links: footerLinks.company },
    { title: "Products", links: footerLinks.products },
    { title: "Services", links: footerLinks.services },
    { title: "Account", links: footerLinks.account },
    { title: "Legal", links: footerLinks.legal },
  ];

  return (
    <footer className="site-footer premium-footer">
      <div className="footer-shell">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <Image src="/vini-wordmark.png" alt="VINI RO Services" width={174} height={48} sizes="174px" />
            </div>
            <p className="footer-eyebrow">RO Services</p>
            <h2>{businessConfig.businessName}</h2>
            <p className="footer-description">
            Premium RO water purification products and service support for homes and businesses.
            </p>
          </div>

          {linkGroups.map((group) => (
            <nav key={group.title} className={`footer-group footer-group-${group.title.toLowerCase()}`} aria-label={`${group.title} links`}>
              <h3>{group.title}</h3>
              <ul>
                {group.links.map((link) => (
                  <li key={link.href}><Link href={link.href}>{link.label}</Link></li>
                ))}
              </ul>
            </nav>
          ))}

          <nav className="footer-group footer-group-contact" aria-label="Contact links">
            <h3>Contact</h3>
            <ul>
              <li><a href={`tel:${businessConfig.phone.replace(/\s+/g, "")}`}>{businessConfig.phone}</a></li>
              <li><a href={`mailto:${businessConfig.email}`}>{businessConfig.email}</a></li>
              <li><Link href="/help">Help</Link></li>
            </ul>
          </nav>
        </div>

        <div className="footer-meta">
          <div className="footer-credit">
            <span>Designed &amp; Developed by</span>
            <strong>CODEWEB24</strong>
            <small>by Moksh Patel</small>
          </div>
          <p className="footer-copyright">© {currentYear} {businessConfig.businessName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
