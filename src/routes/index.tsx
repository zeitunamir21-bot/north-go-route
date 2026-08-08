import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { ArrowRight, Car, Check, Clock, ShieldCheck, Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TripCard } from "@/components/TripCard";
import { ReviewsSection } from "@/components/ReviewsSection";
import { RecentAndPopular } from "@/components/RecentAndPopular";
import { ContactSupport } from "@/components/ContactSupport";

import { BottomNav } from "@/components/BottomNav";
import { StickyBookCTA } from "@/components/StickyBookCTA";
import { PromoBanner } from "@/components/PromoBanner";
import { DownloadApkButton } from "@/components/DownloadApkButton";

import heroImg from "@/assets/hero-van.jpg";

const HOME_URL = "https://north-go-route.lovable.app/";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NorthGo Booking — Isiolo ⇄ Nairobi Private Transport" },
      {
        name: "description",
        content:
          "Book a seat between Isiolo and Nairobi in minutes. Live seat availability, verified drivers, pay on board.",
      },

      { property: "og:title", content: "NorthGo Booking — Official Isiolo ⇄ Nairobi Private Transport" },
      { property: "og:description", content: "The official NorthGo booking website. Book private transport between Isiolo and Nairobi with live seat availability, verified Kenyan drivers, pay on board." },
      { property: "og:url", content: HOME_URL },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "NorthGo Booking — Isiolo ⇄ Nairobi Private Transport" },
      { name: "twitter:description", content: "Official NorthGo booking site. Daily private 7-seater Sienta transport, live seat availability, verified drivers." },
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
              name: "NorthGo Booking — Official Isiolo ⇄ Nairobi Private Transport",
              url: HOME_URL,
              description: "Official NorthGo booking website. Book your Isiolo ⇄ Nairobi seat online: daily 7-seater Sienta private transport, verified Kenyan drivers, pay on board.",
              isPartOf: { "@id": "https://north-go-route.lovable.app/#website" },
              about: { "@id": "https://north-go-route.lovable.app/#organization" },
              primaryImageOfPage: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/23f4e545-2583-4432-990c-1431b6d34504",
            },
            {
              "@type": "Service",
              "@id": `${HOME_URL}#booking-service`,
              name: "NorthGo booking — private transport Isiolo ⇄ Nairobi",
              serviceType: "Private transport booking",
              provider: { "@id": "https://north-go-route.lovable.app/#organization" },
              areaServed: ["Isiolo", "Nairobi", "Kenya"],
              offers: { "@type": "Offer", price: "1300", priceCurrency: "KES", url: "https://north-go-route.lovable.app/trips" },
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

  // Live availability: refresh when any trip changes
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
    <div className="min-h-screen bg-background pb-28 md:pb-0">
      <PromoBanner />
      <Header />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <img
          src={heroImg}
          alt="View from a comfortable 7-seater Sienta traveling toward Mount Kenya at sunrise"
          width={1600}
          height={1024}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{ background: "var(--gradient-hero)" }}
        />
        <div className="relative mx-auto max-w-6xl px-4 py-24 md:py-36">
          <div className="max-w-2xl text-white">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Daily private transport · Isiolo ⇄ Nairobi
            </span>
            <h1 className="mt-5 font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
              NorthGo booking — <span className="text-primary">Isiolo ⇄ Nairobi</span> private
              transport.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-white/85">
              Book a seat in under a minute. Live seat availability, verified drivers, pay on board.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="h-14 rounded-xl px-8 text-base font-semibold">
                <Link to="/trips">
                  Book your seat <ArrowRight className="ml-1 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-14 rounded-xl border-white/30 bg-white/10 px-8 text-base font-semibold text-white backdrop-blur hover:bg-white/20 hover:text-white"
              >
                <a href="tel:+254790179834">Call driver</a>
              </Button>
              <DownloadApkButton variant="hero" />
            </div>
            <p className="mt-3 text-xs text-white/70">
              Get the Android app · APK 4 MB · Enable "Install unknown apps" on your phone if prompted.
            </p>

            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/85">
              {[
                "Daily Trips",
                "Live Seat Availability",
                "Verified Drivers",
                "Pay on Board",
              ].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* RECENT + POPULAR */}
      <RecentAndPopular />



      {/* WHY US */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-12 max-w-2xl">
          <h2 className="font-display text-4xl font-bold tracking-tight">Why ride with NorthGo</h2>
          <p className="mt-3 text-muted-foreground">
            Built for the Isiolo-Nairobi corridor. Simple, honest, and made for everyday travelers.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: Wallet, title: "Pay on board", desc: "Cash or M-Pesa after boarding. No deposits, no risk." },
            { icon: Clock, title: "Always on time", desc: "Daily departures. We leave when we say we will." },
            { icon: ShieldCheck, title: "Trusted drivers", desc: "Experienced, vetted, and friendly drivers you can call directly." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-primary">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-display text-xl font-bold">{title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>




      {/* TRIPS PREVIEW */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-display text-4xl font-bold tracking-tight">Upcoming trips</h2>
            <p className="mt-2 text-muted-foreground">Pick a departure that works for you.</p>
          </div>
          <Button asChild variant="ghost" className="hidden md:inline-flex">
            <Link to="/trips">
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        {trips.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
            No upcoming trips listed yet. Check back soon.
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {trips.map((t) => <TripCard key={t.id} trip={t} />)}
          </div>
        )}
      </section>

      <ReviewsSection />


      {/* DRIVER SIGNUP */}
      <section className="mx-auto max-w-6xl px-4 pb-4">
        <div className="flex flex-col items-start gap-4 rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-card)] sm:flex-row sm:items-center sm:justify-between md:p-8">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-primary">
              <Car className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-xl font-bold">Own a 7-seater?</h2>
              <p className="text-sm text-muted-foreground">Post your trips and fill your seats.</p>
            </div>
          </div>
          <Button asChild size="lg" className="rounded-xl">
            <Link to="/driver/signup">
              Become a driver <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>


      <ContactSupport />


      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-24">
        <div
          className="overflow-hidden rounded-3xl p-10 text-white shadow-[var(--shadow-elevated)] md:p-16"
          style={{ background: "var(--gradient-primary)" }}
        >
          <h2 className="font-display text-4xl font-bold md:text-5xl">
            Ready to ride? Reserve in 30 seconds.
          </h2>
          <p className="mt-3 max-w-xl text-white/90">
            No app, no login required. Just your name and phone — we'll confirm your seat instantly.
          </p>
          <Button asChild size="lg" variant="secondary" className="mt-8 h-14 rounded-xl px-8 text-base font-semibold">
            <Link to="/trips">Book your seat</Link>
          </Button>
        </div>
      </section>

      <Footer />
      <StickyBookCTA />
      <BottomNav />
    </div>
  );
}
