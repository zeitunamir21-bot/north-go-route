/**
 * Single source of truth for the public site address.
 * When northgo.co.ke is connected, change this one value (or set VITE_SITE_URL)
 * and every canonical link, sitemap entry and share tag updates together.
 */
export const SITE_URL: string =
  (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, "") ||
  "https://north-go-route.lovable.app";
