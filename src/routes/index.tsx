import { SITE_URL } from "@/lib/site";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { ArrowRight, Check, ShieldCheck, Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TripCard } from "@/components/TripCard";
import { RecentAndPopular } from "@/components/RecentAndPopular";
import { BottomNav } from "@/components/BottomNav";
import { StickyBookCTA } from "@/components/StickyBookCTA";
import { PromoBanner } from "@/components/PromoBanner";
import { DownloadApkButton } from "@/components/DownloadApkButton";
import { RouteFlow } from "@/components/RouteFlow";
import { PrivateHire } from "@/components/PrivateHire";

const HOME_URL = SITE_URL + "/";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NorthGo Booking — Isiolo ⇄ Nairobi Transport" },
      {
        name: "description",
        content: "Choose Isiolo–Nairobi or Nairobi–Isiolo, check live seat availability, and reserve with NorthGo. Pay on board.",
      },
      { property: "og:title", content: "NorthGo Booking — Isiolo ⇄ Nairobi Transport" },
      { property: "og:description", content: "Choose a route, find a seat, and pay on board with NorthGo." },
      { property: "og:url", content: HOME_URL },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "NorthGo Booking — Isiolo ⇄ Nairobi Transport" },
      { name: "twitter:description", content: "Choose a route, find a seat, and pay on board with NorthGo." },
    ],
    links: [{ rel: "canonical", href: HOME_URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebPage",
              "@id": `${HOME_URL}#webpage`,
              name: "NorthGo Booking — Isiolo ⇄ Nairobi Transport",
              url: HOME_URL,
              description: "Choose a NorthGo route between Isiolo and Nairobi, check available seats, and reserve online.",
              isPartOf: { "@id": SITE_URL + "/#website" },
              about: { "@id": SITE_URL + "/#organization" },
            },
            {
              "@type": "Service",
              "@id": `${HOME_URL}#booking-service`,
              name: "NorthGo private transport booking",
              serviceType: "Private transport booking",
              provider: { "@id": SITE_URL + "/#organization" },
              areaServed: ["Isiolo", "Nairobi", "Kenya"],
              url: SITE_URL + "/trips",
            },
          ],
        }),
      },
    ],
  }),
  component: Home,
});

function Home() {
  const qc = useQueryClient();
  const { data: trips = [] } = useQuery({
    queryKey: ["trips", "upcoming"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("list_upcoming_trips_public");
      if (error) throw error;
      return ((data ?? []) as any[]).slice(0, 3);
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel("home-trips")
      .on("postgres_changes", { event: "*", schema: "public", table: "trips" }, () => {
        qc.invalidateQueries({ queryKey: ["trips", "upcoming"] });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);

  return (
    <div className="min-h-screen bg-background pb-32 md:pb-0">
      <PromoBanner />
      <Header />

      <main className="mx-auto max-w-5xl px-4">
        <section className="pt-5 sm:pt-8">
          <p className="text-xs font-semibold uppercase text-primary">NorthGo · Isiolo ⇄ Nairobi</p>
          <h1 className="mt-1 font-display text-2xl font-bold sm:text-3xl">Where are you travelling?</h1>
          <p className="mt-1 text-sm text-muted-foreground">Choose a direction to see available seats.</p>

          <RouteFlow />

          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <Button asChild size="lg" className="h-12 flex-1 rounded-lg text-base font-semibold">
              <Link to="/trips">
                Book a seat <ArrowRight className="ml-1 h-5 w-5" />
              </Link>
            </Button>
            <DownloadApkButton variant="compact" className="h-12 justify-center rounded-lg px-4 text-sm" />
          </div>

          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-border pt-3 text-xs font-medium text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-primary" /> Verified drivers</span>
            <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-primary" /> Live seat availability</span>
            <span className="inline-flex items-center gap-1.5"><Wallet className="h-3.5 w-3.5 text-primary" /> Cash or M-Pesa on board</span>
          </div>
        </section>

        <RecentAndPopular />

        <section className="py-8">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-bold sm:text-2xl">Upcoming trips</h2>
              <p className="mt-1 text-sm text-muted-foreground">Choose a departure and reserve your seat.</p>
            </div>
            <Button asChild variant="ghost" size="sm" className="shrink-0">
              <Link to="/trips">All trips <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>
          {trips.length === 0 ? (
            <div className="rounded-lg border border-border bg-card px-5 py-6">
              <h3 className="font-display text-lg font-bold">Ready to travel?</h3>
              <p className="mt-1 text-sm text-muted-foreground">No departures are listed right now. Check the schedule for updates.</p>
              <Button asChild size="sm" className="mt-4 rounded-lg">
                <Link to="/trips">Browse trips <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {trips.map((trip) => <TripCard key={trip.id} trip={trip} />)}
            </div>
          )}
        </section>

        <PrivateHire />
      </main>

      <Footer />
      <StickyBookCTA />
      <BottomNav />
    </div>
  );
}
