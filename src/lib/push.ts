/** Browser + native notification helpers (safe no-ops when unsupported). */

export type NotifyPermission = "granted" | "denied" | "default" | "unsupported";

export function notificationSupport(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function notificationPermission(): NotifyPermission {
  if (!notificationSupport()) return "unsupported";
  return Notification.permission as NotifyPermission;
}

/** Ask the user once for permission to send notifications. */
export async function askNotificationPermission(): Promise<NotifyPermission> {
  if (!notificationSupport()) return "unsupported";
  try {
    const result = await Notification.requestPermission();
    return result as NotifyPermission;
  } catch {
    return "denied";
  }
}

/** Show a notification if allowed; falls back silently otherwise. */
export async function showNotification(title: string, body?: string) {
  if (notificationPermission() !== "granted") return;
  try {
    const reg = await navigator.serviceWorker?.getRegistration();
    if (reg?.showNotification) {
      await reg.showNotification(title, { body, icon: "/icon-192.png", badge: "/icon-192.png" });
      return;
    }
    new Notification(title, { body, icon: "/icon-192.png" });
  } catch {
    /* no-op */
  }
}
