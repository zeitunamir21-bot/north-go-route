import { useCallback, useEffect, useState } from "react";

/* ------------------------------------------------------------------ */
/* Native bridge helpers (Capacitor optional — safe on plain web too)  */
/* ------------------------------------------------------------------ */

type CapacitorGlobal = {
  isNativePlatform?: () => boolean;
  getPlatform?: () => string;
  Plugins?: Record<string, any>;
};

function cap(): CapacitorGlobal | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as unknown as { Capacitor?: CapacitorGlobal }).Capacitor;
}

/** True when running inside the Android/iOS Capacitor shell. */
export function isNativeApp(): boolean {
  return !!cap()?.isNativePlatform?.();
}

/** True when launched as an installed PWA (standalone display mode). */
export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches === true ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

/** App-like chrome (native shell or installed PWA). */
export function useAppChrome() {
  const [appLike, setAppLike] = useState(false);
  useEffect(() => {
    const on = isNativeApp() || isStandalone();
    setAppLike(on);
    document.documentElement.classList.toggle("app-shell", on);
  }, []);
  return appLike;
}

/* ------------------------------- haptics -------------------------- */

export type HapticStyle = "light" | "medium" | "heavy";

/** Short tactile feedback; falls back to the Vibration API on the web. */
export function haptic(style: HapticStyle = "light") {
  try {
    const plugin = cap()?.Plugins?.Haptics;
    if (plugin?.impact) {
      plugin.impact({ style: style.toUpperCase() });
      return;
    }
    navigator.vibrate?.(style === "heavy" ? 24 : style === "medium" ? 14 : 8);
  } catch {
    /* no-op */
  }
}

/* --------------------------- back button -------------------------- */

/**
 * Android hardware back button. Runs `handler`; when it returns false the app
 * is minimised instead of closing (native) or the browser history is used.
 */
export function useAndroidBackButton(handler: () => boolean) {
  useEffect(() => {
    const app = cap()?.Plugins?.App;
    if (!app?.addListener) return;
    let remove: (() => void) | undefined;
    const sub = app.addListener("backButton", () => {
      const consumed = handler();
      if (!consumed) {
        if (window.history.length > 1) window.history.back();
        else app.minimizeApp?.();
      }
    });
    Promise.resolve(sub).then((s: { remove?: () => void }) => {
      remove = s?.remove;
    });
    return () => remove?.();
  }, [handler]);
}

/* ------------------------ connectivity ---------------------------- */

/** Live online/offline state. */
export function useOnlineStatus() {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  return online;
}

/* --------------------------- status bar --------------------------- */

/** Keep the Android status bar in sync with the current theme. */
export function syncStatusBar(theme: "light" | "dark") {
  const bar = cap()?.Plugins?.StatusBar;
  if (!bar) return;
  try {
    bar.setStyle?.({ style: theme === "dark" ? "DARK" : "LIGHT" });
    bar.setBackgroundColor?.({ color: theme === "dark" ? "#0B140F" : "#16A34A" });
  } catch {
    /* no-op */
  }
}

/** Hide the native splash once the first screen is painted. */
export function hideNativeSplash() {
  try {
    cap()?.Plugins?.SplashScreen?.hide?.();
  } catch {
    /* no-op */
  }
}

/* ----------------------- local app storage ------------------------ */

const NS = "northgo.";

/** Namespaced, failure-tolerant local storage for non-sensitive app state. */
export const appStore = {
  get<T>(key: string, fallback: T): T {
    if (typeof window === "undefined") return fallback;
    try {
      const raw = window.localStorage.getItem(NS + key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key: string, value: unknown) {
    try {
      window.localStorage.setItem(NS + key, JSON.stringify(value));
    } catch {
      /* quota / private mode */
    }
  },
  remove(key: string) {
    try {
      window.localStorage.removeItem(NS + key);
    } catch {
      /* no-op */
    }
  },
};

/** Reactive wrapper around `appStore` for simple settings. */
export function useAppSetting<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);

  useEffect(() => {
    setValue(appStore.get<T>(key, initial));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = useCallback(
    (next: T) => {
      setValue(next);
      appStore.set(key, next);
    },
    [key],
  );

  return [value, update] as const;
}

/* -------------------- passenger details (local) -------------------- */

export type SavedPassenger = { name: string; phone: string };

export const passengerStore = {
  read(): SavedPassenger | null {
    return appStore.get<SavedPassenger | null>("passenger", null);
  },
  save(p: SavedPassenger) {
    appStore.set("passenger", p);
  },
  clear() {
    appStore.remove("passenger");
  },
};
