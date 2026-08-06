import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = "https://north-go-route.lovable.app";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

const staticEntries: SitemapEntry[] = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: "/trips", changefreq: "hourly", priority: "0.9" },
  { path: "/drivers", changefreq: "daily", priority: "0.8" },
  { path: "/isiolo-to-nairobi", changefreq: "daily", priority: "0.9" },
  { path: "/nairobi-to-isiolo", changefreq: "daily", priority: "0.9" },
  { path: "/about", changefreq: "monthly", priority: "0.6" },
  { path: "/contact", changefreq: "monthly", priority: "0.6" },
  { path: "/faq", changefreq: "monthly", priority: "0.6" },
];

/** Public driver profile pages, mirroring the /drivers listing source. */
async function driverEntries(): Promise<SitemapEntry[]> {
  try {
    const url = process.env["VITE_SUPABASE_URL"] ?? process.env["SUPABASE_URL"];
    const key = process.env["VITE_SUPABASE_PUBLISHABLE_KEY"];
    if (!url || !key) return [];
    const res = await fetch(`${url}/rest/v1/rpc/list_drivers_public`, {
      method: "POST",
      headers: { apikey: key, "Content-Type": "application/json" },
      body: "{}",
    });
    if (!res.ok) return [];
    const rows = (await res.json()) as Array<{ id?: string }> | { id?: string }[] | null;
    if (!Array.isArray(rows)) return [];
    return rows
      .filter((r) => typeof r?.id === "string")
      .map((r) => ({
        path: `/driver/${r.id}`,
        changefreq: "weekly" as const,
        priority: "0.6",
      }));
  } catch {
    return [];
  }
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries = [...staticEntries, ...(await driverEntries())];

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
