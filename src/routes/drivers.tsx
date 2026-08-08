import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BottomNav } from "@/components/BottomNav";
import { DriverCard, type PublicDriver } from "@/components/DriverCard";
import { ShieldCheck, BadgeCheck, IdCard, ThumbsUp } from "lucide-react";

const URL = "https://north-go-route.lovable.app/drivers";

export const Route = createFileRoute("/drivers")({
  head: () => ({
    meta: [
      { title: "Verified NorthGo Drivers — Isiolo ⇄ Nairobi NorthGo Booking" },
      {
        name: "description",
        content:
          "Before your NorthGo booking, meet our verified Kenyan drivers: ratings, experience, completed trips, languages spoken and 7-seater Sienta vehicle details before you book.",
      },
      { property: "og:title", content: "Verified NorthGo Drivers — Isiolo ⇄ Nairobi" },
      { property: "og:description", content: "Ratings, experience and vehicle details for every verified NorthGo driver." },
      { property: "og:url", content: URL },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Verified NorthGo Drivers" },
      { name: "twitter:description", content: "Ratings, experience and vehicle details for every verified NorthGo driver." },
    ],
    links: [{ rel: "canonical", href: URL }],
  }),
  component: DriversPage,
});

const TRUST = [
  { icon: BadgeCheck, title: "Identity verified", desc: "Every driver's ID is checked before approval." },
  { icon: IdCard, title: "Licence verified", desc: "Valid Kenyan driving licence on file." },
  { icon: ShieldCheck, title: "Vehicle verified", desc: "Plate, inspection and vehicle photos reviewed." },
  { icon: ThumbsUp, title: "Customer recommended", desc: "Ratings come from real, completed bookings." },
];

function DriversPage() {
  const { data: drivers = [], isLoading } = useQuery({
    queryKey: ["drivers", "public"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("list_drivers_public");
      if (error) throw error;
      return (data ?? []) as unknown as PublicDriver[];
    },
  });

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">Our verified drivers</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Every NorthGo driver is vetted before they can post a trip. See their rating, experience and vehicle
          before you reserve a seat.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
              <Icon className="h-5 w-5 text-success" />
              <div className="mt-2 text-sm font-semibold">{title}</div>
              <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>

        {isLoading ? (
          <div className="mt-12 text-center text-muted-foreground">Loading drivers…</div>
        ) : drivers.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
            No approved drivers yet. Check back soon.
          </div>
        ) : (
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {drivers.map((d) => (
              <DriverCard key={d.id} driver={d} />
            ))}
          </div>
        )}
      </div>
      <Footer />
      <BottomNav />
    </div>
  );
}
