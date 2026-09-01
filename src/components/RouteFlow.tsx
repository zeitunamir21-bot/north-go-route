import { Sun, Moon } from "lucide-react";

export function RouteFlow() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="mx-auto max-w-2xl overflow-hidden rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-card)] sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              From
            </span>
            <span className="font-display text-xl font-bold sm:text-2xl">Isiolo</span>
          </div>

          <div className="flex min-w-0 flex-1 flex-col items-center px-2">
            {/* Isiolo → Nairobi flow */}
            <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <span className="flow-dot flow-east absolute top-0 h-full w-5 rounded-full bg-primary" />
              <span className="flow-dot flow-east absolute top-0 h-full w-4 rounded-full bg-primary/70 [animation-delay:-1.2s]" />
              <span className="flow-dot flow-east absolute top-0 h-full w-3 rounded-full bg-primary/45 [animation-delay:-2.4s]" />
              <svg
                className="absolute right-1 top-1/2 h-3 w-3 -translate-y-1/2 text-primary"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>

            <div className="my-1.5 rounded-full border border-border bg-background px-3 py-0.5 shadow-sm">
              <span className="whitespace-nowrap text-[10px] font-bold uppercase tracking-wide text-foreground">
                Daily departures both ways
              </span>
            </div>

            {/* Nairobi → Isiolo flow */}
            <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <span className="flow-dot flow-west absolute top-0 h-full w-5 rounded-full bg-muted-foreground/60" />
              <span className="flow-dot flow-west absolute top-0 h-full w-4 rounded-full bg-muted-foreground/40 [animation-delay:-1.2s]" />
              <span className="flow-dot flow-west absolute top-0 h-full w-3 rounded-full bg-muted-foreground/25 [animation-delay:-2.4s]" />
              <svg
                className="absolute left-1 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </div>
          </div>

          <div className="flex flex-col text-right">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              To
            </span>
            <span className="font-display text-xl font-bold sm:text-2xl">Nairobi</span>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="flex flex-col items-center rounded-2xl border border-border bg-background p-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-primary">
              <Sun className="h-4 w-4" />
            </div>
            <span className="mt-1.5 text-[10px] font-semibold uppercase text-muted-foreground">
              Morning
            </span>
            <span className="text-xs font-bold">6:00 – 10:00 AM</span>
          </div>
          <div className="flex flex-col items-center rounded-2xl border border-border bg-background p-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-primary">
              <Moon className="h-4 w-4" />
            </div>
            <span className="mt-1.5 text-[10px] font-semibold uppercase text-muted-foreground">
              Evening
            </span>
            <span className="text-xs font-bold">2:00 – 6:00 PM</span>
          </div>
        </div>
      </div>
    </section>
  );
}
