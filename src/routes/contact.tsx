import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BottomNav } from "@/components/BottomNav";
import { ContactSupport } from "@/components/ContactSupport";

const URL = "https://north-go-route.lovable.app/contact";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact NorthGo Support — Private Transport Isiolo ⇄ Nairobi" },
      { name: "description", content: "Contact NorthGo support 7 days a week by email, WhatsApp or phone for private transport bookings, complaints, lost items and payment issues." },
      { name: "keywords", content: "NorthGo support, NorthGo Kenya contact, NorthGo transport booking help, private transport Kenya" },
      { property: "og:title", content: "Contact NorthGo Support" },
      { property: "og:description", content: "Email, WhatsApp or call NorthGo for help with Isiolo ⇄ Nairobi private transport bookings." },
      { property: "og:url", content: URL },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ContactPage",
          name: "Contact NorthGo Support",
          url: URL,
          isPartOf: { "@id": "https://north-go-route.lovable.app/#website" },
          about: { "@id": "https://north-go-route.lovable.app/#organization" },
        }),
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <div className="min-h-screen bg-background pb-28 md:pb-0">
      <Header />
      <section className="mx-auto max-w-4xl px-4 py-14 text-center">
        <span className="text-xs font-semibold uppercase tracking-wider text-primary">Support</span>
        <h1 className="mt-3 font-display text-5xl font-bold tracking-tight">Contact NorthGo support.</h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Talk to a real person about your NorthGo private transport booking. We're on WhatsApp and
          email 7 days a week and respond within minutes during operating hours (6 AM – 10 PM EAT).
        </p>
      </section>
      <ContactSupport />
      <Footer />
      <BottomNav />
    </div>
  );
}
