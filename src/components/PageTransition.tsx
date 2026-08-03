import { useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";

/**
 * Native-style forward transition between screens: a short fade + rise that
 * replays whenever the route path changes, so navigation never "flashes".
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div key={pathname} className="screen-enter">
      {children}
    </div>
  );
}
