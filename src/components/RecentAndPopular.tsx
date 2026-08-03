import { Link } from "@tanstack/react-router";
import { ArrowUpRight, MapPin, Ticket } from "lucide-react";
import { useRecentBookings } from "@/lib/recent-bookings";
import { formatDateTime } from "@/lib/format";
import { haptic } from "@/lib/native";

const POPULAR: { label: string; to: "/isiolo-to-nairobi" | "/nairobi-to-isiolo"; note: string }[] = [
  { label: "Isiolo → Nairobi", to: "/isiolo-to-nairobi", note: "Daily morning departures" },
  { label: "Nairobi → Isiolo", to: "/nairobi-to-isiolo", note: "Afternoon & evening runs" },
];

/** Device-cached recent bookings + popular destination shortcuts. */
export function RecentAndPopular() {
  const recent = useRecentBookings();

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      {recent.length > 0 && (
        <>
          <h2 className="font-display text-2xl font-bold tracking-tight">Your recent bookings</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((b) => (
              <Link
                key={b.id}
                to="/booking/$bookingId"
                params={{ bookingId: b.id }}
                onPointerDown={() => haptic("light")}
                className="m3-card m3-press m3-ripple flex items-center gap-3 p-4"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Ticket className="h-5 w-5" />
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
        </>
      )}

      <h2 className="mt-10 font-display text-2xl font-bold tracking-tight">Popular destinations</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {POPULAR.map((p) => (
          <Link
            key={p.to}
            to={p.to}
            onPointerDown={() => haptic("light")}
            className="m3-card m3-press m3-ripple flex items-center gap-3 p-5"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-primary">
              <MapPin className="h-5 w-5" />
            </span>
            <span className="flex-1">
              <span className="block font-display text-base font-bold">{p.label}</span>
              <span className="block text-xs text-muted-foreground">{p.note}</span>
            </span>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        ))}
      </div>
    </section>
  );
}
