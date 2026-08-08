import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { ArrowDownWideNarrow, Search, SlidersHorizontal, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TripCard } from "@/components/TripCard";
import { formatDay } from "@/lib/format";
import { BottomNav } from "@/components/BottomNav";
import { PullToRefresh } from "@/components/PullToRefresh";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TRIPS_URL = "https://north-go-route.lovable.app/trips";

export const Route = createFileRoute("/trips")({
  head: () => ({
    meta: [
      { title: "NorthGo Booking — Available Isiolo ⇄ Nairobi Trips" },
      { name: "description", content: "Browse upcoming NorthGo private transport trips between Isiolo and Nairobi. Live seat availability, verified Kenyan drivers, reserve online and pay on board." },
      { name: "keywords", content: "NorthGo booking, North Go booking, NorthGo transport booking, NorthGo Kenya booking, Isiolo Nairobi transport, Nairobi Isiolo transport, private transport Kenya" },
      { property: "og:title", content: "Available Trips — NorthGo Private Transport" },
      { property: "og:description", content: "Live seat availability for daily Isiolo ⇄ Nairobi private transport. Reserve online, pay on board." },
      { property: "og:url", content: TRIPS_URL },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Available Trips — NorthGo Private Transport" },
      { name: "twitter:description", content: "Live seat availability for daily Isiolo ⇄ Nairobi NorthGo trips." },
    ],
    links: [{ rel: "canonical", href: TRIPS_URL }],
  }),
  component: TripsPage,
});

type PublicTrip = {
  id: string;
  route: string;
  departure_time: string;
  pickup_point: string;
  total_seats: number;
  available_seats: number;
  vehicle_name: string;
  driver_name: string;
  driver_phone: string;
  price: number;
  status: string;
  plate_number: string | null;
  rating_avg: number | null;
  rating_count: number | null;
};

const TIME_SLOTS = [
  { id: "any", label: "Any time" },
  { id: "morning", label: "Morning (5am–12pm)" },
  { id: "afternoon", label: "Afternoon (12pm–5pm)" },
  { id: "evening", label: "Evening (5pm–11pm)" },
] as const;

const SORTS = [
  { id: "earliest", label: "Earliest departure" },
  { id: "cheapest", label: "Lowest price" },
  { id: "rated", label: "Highest rated driver" },
] as const;

function inSlot(iso: string, slot: string) {
  if (slot === "any") return true;
  const h = new Date(iso).getHours();
  if (slot === "morning") return h >= 5 && h < 12;
  if (slot === "afternoon") return h >= 12 && h < 17;
  return h >= 17 && h < 23;
}

function TripsPage() {
  const qc = useQueryClient();
  const { data: trips = [], isLoading, refetch } = useQuery({
    queryKey: ["trips", "all-upcoming"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("list_upcoming_trips_public");
      if (error) throw error;
      return (data ?? []) as unknown as PublicTrip[];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel("trips-page")
      .on("postgres_changes", { event: "*", schema: "public", table: "trips" }, () => {
        qc.invalidateQueries({ queryKey: ["trips", "all-upcoming"] });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);

  const [q, setQ] = useState("");
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState<string>("any");
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [minSeats, setMinSeats] = useState(1);
  const [sort, setSort] = useState<string>("earliest");
  const [showFilters, setShowFilters] = useState(false);

  const priceCeiling = useMemo(
    () => Math.max(1000, ...trips.map((t) => Number(t.price) || 0)),
    [trips],
  );

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const list = trips.filter((t) => {
      if (term && !`${t.route} ${t.pickup_point} ${t.driver_name}`.toLowerCase().includes(term)) return false;
      if (date && new Date(t.departure_time).toLocaleDateString("en-CA") !== date) return false;
      if (!inSlot(t.departure_time, slot)) return false;
      if (maxPrice != null && Number(t.price) > maxPrice) return false;
      if (t.available_seats < minSeats) return false;
      return true;
    });
    return [...list].sort((a, b) => {
      if (sort === "cheapest") return Number(a.price) - Number(b.price);
      if (sort === "rated") return Number(b.rating_avg ?? 0) - Number(a.rating_avg ?? 0);
      return new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime();
    });
  }, [trips, q, date, slot, maxPrice, minSeats, sort]);

  const grouped = useMemo(() => {
    const g: Record<string, PublicTrip[]> = {};
    for (const t of filtered) {
      const key = new Date(t.departure_time).toDateString();
      (g[key] ||= []).push(t);
    }
    return Object.entries(g);
  }, [filtered]);

  const activeFilters =
    (date ? 1 : 0) + (slot !== "any" ? 1 : 0) + (maxPrice != null ? 1 : 0) + (minSeats > 1 ? 1 : 0);

  const reset = () => {
    setQ("");
    setDate("");
    setSlot("any");
    setMaxPrice(null);
    setMinSeats(1);
    setSort("earliest");
  };

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      <Header />
      <PullToRefresh onRefresh={() => refetch()}>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:py-12">
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">Available trips</h1>
        <p className="mt-2 text-muted-foreground">Reserve a seat — pay on board.</p>

        {/* SEARCH BAR */}
        <div className="sticky top-16 z-30 -mx-4 mt-6 border-b border-border bg-background/90 px-4 py-3 backdrop-blur md:static md:mx-0 md:rounded-2xl md:border md:bg-card md:p-4 md:shadow-[var(--shadow-card)]">
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search destination, pickup or driver"
                aria-label="Search trips by destination"
                className="h-12 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm outline-none transition focus:border-primary"
              />
            </div>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              aria-label="Filter by departure date"
              className="h-12 rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary sm:w-44"
            />
            <button
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              className={cn(
                "inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-border px-4 text-sm font-semibold transition hover:bg-accent",
                activeFilters > 0 && "border-primary text-primary",
              )}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFilters > 0 && (
                <span className="rounded-full bg-primary px-1.5 text-[11px] text-primary-foreground">
                  {activeFilters}
                </span>
              )}
            </button>
          </div>

          {showFilters && (
            <div className="mt-3 animate-fade-in grid gap-4 rounded-xl border border-border bg-card p-4 md:grid-cols-3">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Departure time
                </label>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {TIME_SLOTS.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSlot(s.id)}
                      className={cn(
                        "min-h-9 rounded-full border border-border px-3 text-xs font-medium transition",
                        slot === s.id ? "border-primary bg-primary text-primary-foreground" : "hover:bg-accent",
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="maxprice" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Max price · {maxPrice != null ? `KES ${maxPrice.toLocaleString()}` : "Any"}
                </label>
                <input
                  id="maxprice"
                  type="range"
                  min={200}
                  max={priceCeiling}
                  step={100}
                  value={maxPrice ?? priceCeiling}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="mt-3 w-full accent-[var(--color-primary,currentColor)]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Seats needed
                </label>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {[1, 2, 3, 4].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setMinSeats(n)}
                      className={cn(
                        "h-9 w-9 rounded-full border border-border text-xs font-semibold transition",
                        minSeats === n ? "border-primary bg-primary text-primary-foreground" : "hover:bg-accent",
                      )}
                    >
                      {n}+
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <ArrowDownWideNarrow className="h-3.5 w-3.5" /> Sort
            </span>
            {SORTS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSort(s.id)}
                className={cn(
                  "min-h-9 rounded-full border border-border px-3 text-xs font-medium transition",
                  sort === s.id ? "border-primary bg-primary/10 text-primary" : "hover:bg-accent",
                )}
              >
                {s.label}
              </button>
            ))}
            {(activeFilters > 0 || q) && (
              <button
                type="button"
                onClick={reset}
                className="ml-auto inline-flex min-h-9 items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" /> Clear
              </button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="mt-12 text-center text-muted-foreground">Loading trips…</div>
        ) : grouped.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
            {trips.length === 0 ? "No trips scheduled. Please check back later." : "No trips match your filters."}
            {trips.length > 0 && (
              <div className="mt-4">
                <Button variant="outline" className="rounded-xl" onClick={reset}>
                  Clear filters
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-8 space-y-10">
            <p className="text-sm text-muted-foreground">
              {filtered.length} trip{filtered.length === 1 ? "" : "s"} found
            </p>
            {grouped.map(([day, dayTrips]) => (
              <div key={day}>
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  {formatDay(dayTrips[0].departure_time)}
                </h2>
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {dayTrips.map((t) => <TripCard key={t.id} trip={t} />)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </PullToRefresh>
      <Footer />
      <BottomNav />
    </div>
  );
}
