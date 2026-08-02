import { Link } from "@tanstack/react-router";
import {
  BadgeCheck,
  Car,
  Clock,
  IdCard,
  Languages,
  ShieldCheck,
  Star,
  ThumbsUp,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DriverPhoto } from "@/components/DriverPhoto";
import { cn } from "@/lib/utils";

export type PublicDriver = {
  id: string;
  full_name: string;
  vehicle_name: string;
  plate_number: string | null;
  photos: string[];
  bio: string | null;
  languages: string[] | null;
  experience_years: number | null;
  vehicle_color: string | null;
  vehicle_year: number | null;
  seat_capacity: number | null;
  member_since: string;
  rating_avg: number | null;
  rating_count: number | null;
  completed_trips: number | null;
  upcoming_trips: number | null;
  status: "available" | "on_trip" | "offline";
};

const STATUS: Record<PublicDriver["status"], { label: string; className: string }> = {
  available: { label: "Available", className: "bg-success/15 text-success" },
  on_trip: { label: "On trip", className: "bg-orange-500/15 text-orange-600 dark:text-orange-400" },
  offline: { label: "Offline", className: "bg-muted text-muted-foreground" },
};

const TRUST = [
  { icon: BadgeCheck, label: "Identity verified" },
  { icon: IdCard, label: "Licence verified" },
  { icon: Car, label: "Vehicle verified" },
  { icon: ThumbsUp, label: "Customer recommended" },
];

export function DriverCard({ driver }: { driver: PublicDriver }) {
  const photo = driver.photos?.[0];
  const status = STATUS[driver.status] ?? STATUS.offline;
  const years =
    driver.experience_years ??
    Math.max(1, new Date().getFullYear() - new Date(driver.member_since).getFullYear());
  const rating = Number(driver.rating_avg ?? 0);
  const languages = driver.languages?.length ? driver.languages : ["English", "Kiswahili"];

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)]">
      <div className="flex items-start gap-4 p-5">
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-border bg-muted">
          {photo ? (
            <DriverPhoto src={photo} alt={driver.full_name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-muted-foreground">
              {driver.full_name.charAt(0)}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate font-display text-lg font-bold tracking-tight">{driver.full_name}</h3>
            <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold", status.className)}>
              {status.label}
            </span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 font-semibold text-primary">
              <BadgeCheck className="h-3.5 w-3.5" /> Verified driver
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 font-medium text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" /> Safe driving
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {(driver.rating_count ?? 0) > 0 ? (
              <span className="inline-flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold text-foreground">{rating.toFixed(1)}</span>({driver.rating_count})
              </span>
            ) : (
              <span>New driver</span>
            )}
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {years} yr{years > 1 ? "s" : ""} experience
            </span>
            <span className="inline-flex items-center gap-1">
              <Car className="h-3.5 w-3.5" /> {driver.completed_trips ?? 0} trip
              {(driver.completed_trips ?? 0) === 1 ? "" : "s"}
            </span>

          </div>
        </div>
      </div>

      {driver.bio && (
        <p className="-mt-1 px-5 pb-4 text-sm leading-relaxed text-foreground/80">{driver.bio}</p>
      )}

      <div className="mx-5 grid gap-2 rounded-xl border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Car className="h-3.5 w-3.5 shrink-0 text-primary" />
          <span className="text-foreground">
            {[driver.vehicle_year, driver.vehicle_color, driver.vehicle_name].filter(Boolean).join(" · ")}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="inline-flex items-center gap-1.5">
            <IdCard className="h-3.5 w-3.5 text-primary" />
            {driver.plate_number ? (
              <span className="font-mono font-semibold tracking-wider text-foreground">{driver.plate_number}</span>
            ) : (
              "Plate on request"
            )}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-primary" /> {driver.seat_capacity ?? 7} seats
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Languages className="h-3.5 w-3.5 shrink-0 text-primary" />
          <span>{languages.join(", ")}</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 px-5">
        {TRUST.map(({ icon: Icon, label }) => (
          <span key={label} className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
            <Icon className="h-3.5 w-3.5 text-success" /> {label}
          </span>
        ))}
      </div>

      <div className="mt-auto p-5">
        <Button asChild className="h-11 w-full rounded-xl">
          <Link to="/driver/$driverId" params={{ driverId: driver.id }}>
            View profile
          </Link>
        </Button>
      </div>
    </article>
  );
}
