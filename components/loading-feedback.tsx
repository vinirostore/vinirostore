"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function LoadingFeedback() {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    let pageIsReady = document.readyState === "complete";
    let minimumTimePassed = false;
    const hideWhenReady = () => {
      if (pageIsReady && minimumTimePassed) setIsInitialLoading(false);
    };
    const handlePageLoad = () => {
      pageIsReady = true;
      hideWhenReady();
    };
    const minimumTimer = window.setTimeout(() => {
      minimumTimePassed = true;
      hideWhenReady();
    }, 700);
    const fallbackTimer = window.setTimeout(() => setIsInitialLoading(false), 10000);

    if (!pageIsReady) window.addEventListener("load", handlePageLoad, { once: true });
    return () => {
      window.clearTimeout(minimumTimer);
      window.clearTimeout(fallbackTimer);
      window.removeEventListener("load", handlePageLoad);
    };
  }, []);

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

  return <>
    <div className={`site-initial-loader ${isInitialLoading ? "" : "is-hidden"}`} aria-hidden={!isInitialLoading}>
      <div className="site-initial-loader-content">
        <Image src="/vini-bgr.png" alt="VINI RO" width={320} height={118} priority />
        <span className="site-initial-loader-indicator" aria-hidden="true" />
      </div>
    </div>
    <div className={`site-loading-progress ${isNavigating ? "is-visible" : ""}`} aria-hidden="true" />
  </>;
}
