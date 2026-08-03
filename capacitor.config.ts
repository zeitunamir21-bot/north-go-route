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
    // Hide WebView artifacts: no overscroll glow, no zoom controls, no debug chrome.
    webContentsDebuggingEnabled: false,
    backgroundColor: "#16A34A",
    loggingBehavior: "none",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      launchAutoHide: true,
      backgroundColor: "#16A34A",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      androidSpinnerStyle: "large",
      spinnerColor: "#FFFFFF",
      splashFullScreen: true,
      splashImmersive: false,
    },
    StatusBar: {
      style: "LIGHT",
      backgroundColor: "#16A34A",
      overlaysWebView: false,
    },
    Keyboard: {
      resize: "native",
      resizeOnFullScreen: true,
      style: "DEFAULT",
    },
    App: {
      // Deep links / back-button handling are wired in src/lib/native.ts
    },
  },
};

export default config;
