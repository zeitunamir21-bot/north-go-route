import * as React from "react";
import { Loader2 } from "lucide-react";
import { haptic } from "@/lib/native";

/**
 * Native-style pull-to-refresh. Only engages when the scroll container is at
 * the very top, mirroring Android's swipe-refresh behaviour.
 */
export function PullToRefresh({
  onRefresh,
  children,
}: {
  onRefresh: () => Promise<unknown> | unknown;
  children: React.ReactNode;
}) {
  const [pull, setPull] = React.useState(0);
  const [busy, setBusy] = React.useState(false);
  const start = React.useRef<number | null>(null);
  const THRESHOLD = 72;

  const onTouchStart = (e: React.TouchEvent) => {
    if (busy) return;
    const atTop = (window.scrollY || document.documentElement.scrollTop) <= 0;
    start.current = atTop ? e.touches[0].clientY : null;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (start.current === null || busy) return;
    const delta = e.touches[0].clientY - start.current;
    if (delta <= 0) {
      setPull(0);
      return;
    }
    setPull(Math.min(delta * 0.5, THRESHOLD + 24));
  };

  const onTouchEnd = async () => {
    if (start.current === null) return;
    const shouldRefresh = pull >= THRESHOLD;
    start.current = null;
    if (!shouldRefresh) {
      setPull(0);
      return;
    }
    haptic("medium");
    setBusy(true);
    setPull(THRESHOLD);
    try {
      await onRefresh();
    } finally {
      setBusy(false);
      setPull(0);
    }
  };

  const active = pull > 0 || busy;

  return (
    <div onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
      <div
        aria-hidden={!active}
        className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center"
        style={{
          transform: `translateY(${Math.max(pull - 24, -40)}px)`,
          opacity: active ? 1 : 0,
          transition: start.current === null ? "transform .25s ease, opacity .25s ease" : "none",
        }}
      >
        <div className="mt-2 flex h-10 w-10 items-center justify-center rounded-full bg-card shadow-[var(--elevation-3)]">
          <Loader2
            className="h-5 w-5 text-primary"
            style={{
              animation: busy ? "spin 1s linear infinite" : undefined,
              transform: busy ? undefined : `rotate(${pull * 4}deg)`,
            }}
          />
        </div>
      </div>
      <div
        style={{
          transform: `translateY(${pull}px)`,
          transition: start.current === null ? "transform .25s ease" : "none",
        }}
      >
        {children}
      </div>
    </div>
  );
}
