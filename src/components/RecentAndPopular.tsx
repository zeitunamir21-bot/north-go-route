import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Ticket } from "lucide-react";
import { useRecentBookings } from "@/lib/recent-bookings";
import { formatDateTime } from "@/lib/format";
import { haptic } from "@/lib/native";

/** Device-cached shortcuts to recent bookings. */
export function RecentAndPopular() {
  const recent = useRecentBookings();

  if (recent.length === 0) return null;

  return (
    <section className="pt-5">
      <h2 className="font-display text-base font-bold">Recent bookings</h2>
      <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {recent.map((b) => (
          <Link
            key={b.id}
            to="/booking/$bookingId"
            params={{ bookingId: b.id }}
            onPointerDown={() => haptic("light")}
            className="m3-card m3-press m3-ripple flex items-center gap-3 rounded-lg p-3"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Ticket className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">{b.route || "Your trip"}</span>
              <span className="block truncate text-xs text-muted-foreground">
                {b.departure_time ? formatDateTime(b.departure_time) : "View ticket"}
                {b.seats?.length ? ` · Seat ${b.seats.join(", ")}` : ""}
              </span>
            </span>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        ))}
      </div>
    </section>
  );
}
