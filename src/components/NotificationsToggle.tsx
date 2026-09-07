import { useEffect, useState } from "react";
import { Bell, BellOff, BellRing } from "lucide-react";
import { toast } from "sonner";
import {
  askNotificationPermission,
  notificationPermission,
  showNotification,
  type NotifyPermission,
} from "@/lib/push";
import { haptic } from "@/lib/native";

/** Lets the user turn on booking & trip notifications for this device. */
export function NotificationsToggle({ className = "" }: { className?: string }) {
  const [state, setState] = useState<NotifyPermission>("default");

  useEffect(() => {
    setState(notificationPermission());
  }, []);

  if (state === "unsupported") return null;

  const granted = state === "granted";
  const blocked = state === "denied";
  const Icon = granted ? BellRing : blocked ? BellOff : Bell;

  async function enable() {
    haptic("light");
    const result = await askNotificationPermission();
    setState(result);
    if (result === "granted") {
      await showNotification("Notifications on", "We'll alert you about your NorthGo trips.");
      toast.success("Notifications enabled");
    } else if (result === "denied") {
      toast.error("Notifications are blocked in your browser settings");
    }
  }

  return (
    <button
      type="button"
      onClick={granted ? undefined : enable}
      disabled={granted || blocked}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-foreground disabled:opacity-70 disabled:hover:bg-transparent ${className}`}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-muted-foreground">
        <Icon className="h-5 w-5" />
      </span>
      {granted ? "Notifications on" : blocked ? "Notifications blocked" : "Enable notifications"}
    </button>
  );
}
