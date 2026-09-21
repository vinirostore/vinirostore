"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function LoadingFeedback() {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    const resetId = window.setTimeout(() => setIsNavigating(false), 0);
    return () => window.clearTimeout(resetId);
  }, [pathname]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const link = target?.closest("a");
      const button = target?.closest("button");

      if (link && !event.defaultPrevented && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
        const url = new URL(link.href, window.location.href);
        if (url.origin === window.location.origin && url.pathname !== window.location.pathname) {
          setIsNavigating(true);
        }
      }

      if (button && !button.disabled && !button.matches(".mobile-menu-button, .mobile-close-button, [aria-label*='password' i]")) {
        button.dataset.loading = "true";
        button.setAttribute("aria-busy", "true");
        window.setTimeout(() => {
          delete button.dataset.loading;
          button.removeAttribute("aria-busy");
        }, 700);
      }
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  return <div className={`site-loading-progress ${isNavigating ? "is-visible" : ""}`} aria-hidden="true" />;
}
