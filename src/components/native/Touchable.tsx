import * as React from "react";
import { cn } from "@/lib/utils";
import { haptic } from "@/lib/native";

/**
 * Material 3 style ripple. Attaches an expanding circle at the touch point
 * and cleans it up when the animation ends.
 */
export function useRipple<T extends HTMLElement>() {
  return React.useCallback((event: React.PointerEvent<T>) => {
    const host = event.currentTarget;
    const rect = host.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const span = document.createElement("span");
    span.className = "m3-ripple-wave";
    span.style.width = span.style.height = `${size}px`;
    span.style.left = `${event.clientX - rect.left - size / 2}px`;
    span.style.top = `${event.clientY - rect.top - size / 2}px`;
    host.appendChild(span);
    span.addEventListener("animationend", () => span.remove(), { once: true });
  }, []);
}

type TouchableProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  hapticFeedback?: boolean;
};

/** Button with a native-feeling ripple + press scale + haptic tick. */
export const Touchable = React.forwardRef<HTMLButtonElement, TouchableProps>(
  ({ className, onPointerDown, hapticFeedback = true, ...props }, ref) => {
    const ripple = useRipple<HTMLButtonElement>();
    return (
      <button
        ref={ref}
        {...props}
        onPointerDown={(e) => {
          ripple(e);
          if (hapticFeedback) haptic("light");
          onPointerDown?.(e);
        }}
        className={cn("m3-ripple m3-press", className)}
      />
    );
  },
);
Touchable.displayName = "Touchable";
