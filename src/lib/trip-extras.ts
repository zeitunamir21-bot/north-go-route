import { useCallback, useEffect, useState } from "react";

/** Estimated drive time for the Isiolo ⇄ Nairobi corridor (minutes). */
export const TRIP_DURATION_MIN = 270;

export function estimatedArrival(departureIso: string) {
  return new Date(new Date(departureIso).getTime() + TRIP_DURATION_MIN * 60_000).toISOString();
}

export function formatDuration(min = TRIP_DURATION_MIN) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export const LUGGAGE_ALLOWANCE = "1 bag (20kg) + handbag";

export type TripStatusLabel = { label: string; tone: "ok" | "warn" | "bad" };

export function tripStatusLabel(status: string, departureIso: string): TripStatusLabel {
  if (status === "cancelled") return { label: "Cancelled", tone: "bad" };
  if (status === "full") return { label: "Fully booked", tone: "warn" };
  const late = Date.now() > new Date(departureIso).getTime() + 15 * 60_000;
  if (late) return { label: "Delayed", tone: "warn" };
  return { label: "On time", tone: "ok" };
}

const SAVED_KEY = "northgo.saved-trips";

function readSaved(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(SAVED_KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

/** Locally persisted favourite trips. */
export function useSavedTrips() {
  const [saved, setSaved] = useState<string[]>([]);

  useEffect(() => {
    setSaved(readSaved());
  }, []);

  const toggle = useCallback((id: string) => {
    setSaved((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try {
        window.localStorage.setItem(SAVED_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  return { saved, toggle, isSaved: (id: string) => saved.includes(id) };
}
