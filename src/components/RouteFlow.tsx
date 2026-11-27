import { ArrowRight, Moon, Sun } from "lucide-react";
import { Link } from "@tanstack/react-router";
import roadVehicles from "@/assets/northgo-road-vehicles.jpeg.asset.json";

export function RouteFlow() {
  const routes = [
    { from: "Isiolo", to: "Nairobi", href: "/isiolo-to-nairobi" as const },
    { from: "Nairobi", to: "Isiolo", href: "/nairobi-to-isiolo" as const },
  ];

  return (
    <section aria-label="Choose your route" className="mt-4">
      <div className="grid grid-cols-2 gap-2.5">
        {routes.map((route) => (
          <Link
            key={route.href}
            to={route.href}
            className="group flex min-h-20 items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-3 shadow-[var(--shadow-card)] transition hover:border-primary/50 hover:bg-accent/40"
          >
            <span className="min-w-0">
              <span className="block text-[10px] font-semibold uppercase text-muted-foreground">Route</span>
              <span className="mt-1 flex items-center gap-1 font-display text-sm font-bold sm:text-base">
                <span className="truncate">{route.from}</span>
                <ArrowRight className="h-3.5 w-3.5 shrink-0 text-primary" />
                <span className="truncate">{route.to}</span>
              </span>
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </Link>
        ))}
      </div>

      <div className="mt-2.5 grid grid-cols-2 gap-2.5">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2.5">
          <Sun className="h-4 w-4 shrink-0 text-primary" />
          <span className="min-w-0"><span className="block text-xs font-semibold">Morning</span><span className="block text-[11px] text-muted-foreground">6:00 – 10:00 AM</span></span>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2.5">
          <Moon className="h-4 w-4 shrink-0 text-primary" />
          <span className="min-w-0"><span className="block text-xs font-semibold">Evening</span><span className="block text-[11px] text-muted-foreground">2:00 – 6:00 PM</span></span>
        </div>
      </div>

      <figure className="mt-3 overflow-hidden rounded-lg border border-border bg-muted">
        <img
          src={roadVehicles.url}
          alt="NorthGo passenger vehicles stopped along the Isiolo–Nairobi road"
          width={1290}
          height={1713}
          loading="eager"
          decoding="async"
          className="aspect-[16/7] w-full object-cover object-center"
        />
      </figure>
    </section>
  );
}
