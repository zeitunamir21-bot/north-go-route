import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.northgo.rides",
  appName: "NorthGo",
  webDir: "capacitor-shell",
  server: {
    url: "https://north-go-route.lovable.app",
    androidScheme: "https",
    cleartext: false,
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
