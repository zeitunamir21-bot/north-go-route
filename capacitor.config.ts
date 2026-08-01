import type { CapacitorConfig } from "@capacitor/cli";

const SITE_URL = "https://north-go-route.lovable.app";

const config: CapacitorConfig = {
  appId: "app.northgo.rides",
  appName: "NorthGo",
  webDir: "capacitor-shell",
  server: {
    url: SITE_URL,
    hostname: "north-go-route.lovable.app",
    androidScheme: "https",
    cleartext: false,
    allowNavigation: [
      "north-go-route.lovable.app",
      "*.lovable.app",
      "*.supabase.co",
      "wa.me",
      "api.callmebot.com",
    ],
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
