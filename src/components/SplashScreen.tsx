import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";

/**
 * Minimal brand splash: the NorthGo pin mark and wordmark fade + zoom in on a
 * clean surface, then the whole layer fades out.
 */
export function SplashScreen({ onFinished }: { onFinished?: () => void }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const exitTimer = window.setTimeout(() => setExiting(true), 1200);
    const doneTimer = window.setTimeout(() => onFinished?.(), 1800);
    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(doneTimer);
    };
  }, [onFinished]);

  return (
    <div
      aria-hidden={exiting}
      className={[
        "fixed inset-0 z-[100] flex items-center justify-center bg-background",
        "transition-opacity duration-500 ease-out",
        exiting ? "pointer-events-none opacity-0" : "opacity-100",
      ].join(" ")}
    >
      <div className="flex animate-[splash-in_0.7s_cubic-bezier(0.2,0,0,1)_both] flex-col items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[var(--elevation-2)]">
          <MapPin className="h-9 w-9" strokeWidth={2.25} />
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-primary">NorthGo</h1>
      </div>
    </div>
  );
}
