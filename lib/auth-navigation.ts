export function getAuthReturnPath() {
  if (typeof window === "undefined") return "/account";

  const requestedPath = new URLSearchParams(window.location.search).get("returnTo");
  if (!requestedPath || requestedPath.startsWith("//")) return "/account";

  const destination = new URL(requestedPath, window.location.origin);
  const allowed = destination.pathname.startsWith("/services/")
    || /^\/brands\/[^/]+\/[^/]+\/?$/.test(destination.pathname)
    || ["/cart", "/checkout", "/wishlist", "/orders"].includes(destination.pathname);
  if (destination.origin !== window.location.origin || !allowed) return "/account";

  return `${destination.pathname}${destination.search}${destination.hash}`;
}
