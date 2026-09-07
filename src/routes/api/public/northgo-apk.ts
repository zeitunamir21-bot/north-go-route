import { createFileRoute } from "@tanstack/react-router";
import apkAsset from "@/assets/northgo.apk.asset.json";

/**
 * Serves the Android build with the correct Android package MIME type so phones
 * offer to install it instead of saving it as a .zip archive.
 */
export const Route = createFileRoute("/api/public/northgo-apk")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const source = new URL(apkAsset.url, request.url).toString();
        const upstream = await fetch(source);
        if (!upstream.ok || !upstream.body) {
          return new Response("App file unavailable", { status: 502 });
        }
        return new Response(upstream.body, {
          status: 200,
          headers: {
            "content-type": "application/vnd.android.package-archive",
            "content-disposition": 'attachment; filename="northgo.apk"',
            "cache-control": "public, max-age=3600",
            ...(upstream.headers.get("content-length")
              ? { "content-length": upstream.headers.get("content-length")! }
              : {}),
          },
        });
      },
    },
  },
});
