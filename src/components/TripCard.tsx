import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Bookmark,
  Clock,
  Flame,
  Heart,
  IdCard,
  Luggage,
  MapPin,
  Plug,
  Snowflake,
  Sofa,
  Star,
  Timer,
  Usb,
  Users,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Countdown } from "@/components/Countdown";
import { formatDay, formatKES, formatTime } from "@/lib/format";
import {
  LUGGAGE_ALLOWANCE,
  estimatedArrival,
  formatDuration,
  tripStatusLabel,
  useSavedTrips,
} from "@/lib/trip-extras";
import { cn } from "@/lib/utils";

type Trip = {
  id: string;
  route: string;
  departure_time: string;
  pickup_point: string;
  available_seats: number;
  total_seats: number;
  vehicle_name: string;
  price: number;
  status: string;
  driver_name: string;
  driver_phone: string;
  plate_number?: string | null;
  rating_avg?: number | null;
  rating_count?: number | null;
  notes?: string | null;
};

function splitRoute(route: string): [string, string] {
  const parts = route.split(/⇄|→|->|–|—|\bto\b|-/i).map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) return [parts[0], parts[1]];
  return [route, ""];
}

const AMENITIES = [
  { icon: Snowflake, label: "Air conditioning" },
  { icon: Usb, label: "USB charging" },
  { icon: Plug, label: "Charging ports" },
  { icon: Sofa, label: "Reclining seats" },
];

export function TripCard({ trip }: { trip: Trip }) {
  const [open, setOpen] = useState(false);
  const { toggle, isSaved } = useSavedTrips();
  const [from, to] = splitRoute(trip.route);
  const isFull = trip.available_seats <= 0;
  const lowSeats = trip.available_seats > 0 && trip.available_seats <= 2;
  const status = tripStatusLabel(trip.status, trip.departure_time);
  const arrival = estimatedArrival(trip.departure_time);
  const saved = isSaved(trip.id);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)]">
      {/* status strip */}
      <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/40 px-5 py-2.5">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
            status.tone === "ok" && "bg-success/15 text-success",
            status.tone === "warn" && "bg-orange-500/15 text-orange-600 dark:text-orange-400",
            status.tone === "bad" && "bg-destructive/15 text-destructive",
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {status.label}
        </span>
        <button
          type="button"
          onClick={() => toggle(trip.id)}
          aria-pressed={saved}
          aria-label={saved ? "Remove from saved trips" : "Save this trip"}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-accent hover:text-foreground"
        >
          {saved ? (
            <Heart className="h-4 w-4 fill-primary text-primary" />
          ) : (
            <Bookmark className="h-4 w-4" />
          )}
        </button>
      </div>

      <div className="flex flex-1 flex-col p-5">
        {/* route + times */}
        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
          <div className="min-w-0">
            <div className="font-display text-lg font-bold leading-tight">{formatTime(trip.departure_time)}</div>
            <div className="truncate text-sm text-muted-foreground">{from}</div>
          </div>
          <div className="flex shrink-0 flex-col items-center text-muted-foreground">
            <span className="text-[10px] font-medium uppercase tracking-wider">{formatDuration()}</span>
            <div className="my-1 h-px w-12 bg-border sm:w-16" />
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0 text-right">
            <div className="font-display text-lg font-bold leading-tight">{formatTime(arrival)}</div>
            <div className="truncate text-sm text-muted-foreground">{to || "Destination"}</div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-primary" />
            {formatDay(trip.departure_time)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Timer className="h-3.5 w-3.5 text-primary" />
            Arrives approx. {formatTime(arrival)}
          </span>
        </div>

        <div className="mt-3">
          <Countdown to={trip.departure_time} />
        </div>

        {/* seats + amenities */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {isFull ? (
            <Badge variant="destructive">Sold out</Badge>
          ) : lowSeats ? (
            <Badge className="bg-orange-500 text-white hover:bg-orange-500">
              <Flame className="mr-1 h-3 w-3" />
              Only {trip.available_seats} left
            </Badge>
          ) : (
            <Badge className="bg-success text-success-foreground hover:bg-success">
              <Users className="mr-1 h-3 w-3" />
              {trip.available_seats} of {trip.total_seats} seats left
            </Badge>
          )}
          <div className="flex items-center gap-1.5">
            {AMENITIES.map(({ icon: Icon, label }) => (
              <span
                key={label}
                title={label}
                aria-label={label}
                className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-muted-foreground"
              >
                <Icon className="h-3.5 w-3.5" />
              </span>
            ))}
          </div>
        </div>

        {/* driver strip */}
        <div className="mt-4 rounded-xl border border-border bg-muted/30 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0 text-xs text-muted-foreground">
              Driver · <span className="font-semibold text-foreground">{trip.driver_name}</span>
            </div>
            {(trip.rating_count ?? 0) > 0 ? (
              <div className="flex shrink-0 items-center gap-1 text-xs">
                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold text-foreground">{Number(trip.rating_avg ?? 0).toFixed(1)}</span>
                <span className="text-muted-foreground">({trip.rating_count})</span>
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">New driver</span>
            )}
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            <IdCard className="h-3.5 w-3.5" />
            {trip.plate_number ? (
              <span className="font-mono font-semibold tracking-wider text-foreground">{trip.plate_number}</span>
            ) : (
              <span>Plate shared after booking</span>
            )}
            <span>·</span>
            <span>{trip.vehicle_name}</span>
          </div>
        </div>

        {/* details */}
        {open && (
          <div className="mt-3 animate-fade-in space-y-2 rounded-xl border border-dashed border-border p-3 text-xs text-foreground/80">
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
              <span>
                <span className="font-semibold">Pickup:</span> {trip.pickup_point}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
              <span>
                <span className="font-semibold">Drop-off:</span> {to || "Town centre"} stage
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Luggage className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
              <span>
                <span className="font-semibold">Luggage:</span> {LUGGAGE_ALLOWANCE}
              </span>
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1">
              {AMENITIES.map(({ icon: Icon, label }) => (
                <span key={label} className="inline-flex items-center gap-1 text-muted-foreground">
                  <Icon className="h-3.5 w-3.5" /> {label}
                </span>
              ))}
            </div>
            {trip.notes && <p className="pt-1 text-muted-foreground">{trip.notes}</p>}
            <p className="pt-1 text-muted-foreground">Driver contact is shared after you reserve a seat.</p>
          </div>
        )}

        {/* price + actions */}
        <div className="mt-auto pt-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Fare per seat</div>
              <div className="font-display text-2xl font-bold text-foreground">{formatKES(trip.price)}</div>
            </div>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="inline-flex min-h-11 items-center gap-1 rounded-xl px-3 text-xs font-semibold text-muted-foreground transition hover:text-foreground"
            >
              View details
              <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
            </button>
          </div>
          <Button asChild disabled={isFull} size="lg" className="mt-3 h-12 w-full rounded-xl text-base">
            <Link to="/book/$tripId" params={{ tripId: trip.id }}>
              {isFull ? "Sold out" : "Book now"}
              {!isFull && <ArrowRight className="ml-1 h-4 w-4" />}
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
