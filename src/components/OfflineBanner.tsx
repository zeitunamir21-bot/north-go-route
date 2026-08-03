import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { WifiOff } from "lucide-react";
import { toast } from "sonner";
import { useOnlineStatus } from "@/lib/native";

/**
 * Offline detection with automatic retry: refetches every active query the
 * moment connectivity comes back, and shows a persistent status strip while
 * the device is offline.
 */
export function OfflineBanner() {
  const online = useOnlineStatus();
  const qc = useQueryClient();
  const wasOffline = useRef(false);

  useEffect(() => {
    if (!online) {
      wasOffline.current = true;
      return;
    }
    if (wasOffline.current) {
      wasOffline.current = false;
      toast.success("Back online", { description: "Refreshing your latest trips…" });
      void qc.refetchQueries({ type: "active" });
    }
  }, [online, qc]);

  if (online) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-0 top-0 z-[70] flex items-center justify-center gap-2 bg-secondary px-4 py-2 text-xs font-semibold text-secondary-foreground shadow-[var(--elevation-2)]"
      style={{ paddingTop: "calc(0.5rem + env(safe-area-inset-top))" }}
    >
      <WifiOff className="h-3.5 w-3.5" />
      You are offline — we&apos;ll refresh automatically when the connection returns
    </div>
  );
}
