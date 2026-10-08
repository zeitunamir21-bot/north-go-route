import { useState } from "react";
import { z } from "zod";
import { CarFront, MessageCircle, Sparkles, Loader2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { Textarea } from "@/components/ui/textarea";
import { draftHireRequest } from "@/lib/hire-ai.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const WA = "254729588851";

const hireSchema = z.object({
  direction: z.enum(["nairobi-isiolo", "isiolo-nairobi"]),
  date: z.string().trim().nonempty({ message: "Pick a travel date" }),
  pickup: z.string().trim().nonempty({ message: "Enter your pickup point" }).max(120),
  phone: z
    .string()
    .trim()
    .regex(/^(\+?254|0)?[17]\d{8}$/, { message: "Enter a valid Kenyan phone number" }),
});

export function PrivateHire() {
  const [direction, setDirection] = useState<"nairobi-isiolo" | "isiolo-nairobi">("nairobi-isiolo");
  const [date, setDate] = useState("");
  const [pickup, setPickup] = useState("");
  const [phone, setPhone] = useState("");
  const [needs, setNeeds] = useState("");
  const [draft, setDraft] = useState("");
  const [drafting, setDrafting] = useState(false);
  const draftFn = useServerFn(draftHireRequest);
  const routeText = direction === "nairobi-isiolo" ? "Nairobi → Isiolo" : "Isiolo → Nairobi";

  const generate = async () => {
    if (needs.trim().length < 3) {
      toast.error("Describe your luggage, stops or other needs first");
      return;
    }
    setDrafting(true);
    try {
      const res = await draftFn({ data: { route: routeText, date, pickup, needs: needs.slice(0, 600) } });
      if (res.ok) setDraft(res.text);
      else toast.error(res.error);
    } catch {
      toast.error("Couldn't write the request. Please try again.");
    } finally {
      setDrafting(false);
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = hireSchema.safeParse({ direction, date, pickup, phone });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form");
      return;
    }
    const routeLabel =
      parsed.data.direction === "nairobi-isiolo" ? "Nairobi → Isiolo" : "Isiolo → Nairobi";
    const msg = [
      "Hello NorthGo, I would like to hire a private car.",
      `Route: ${routeLabel}`,
      `Date: ${parsed.data.date}`,
      `Pickup point: ${parsed.data.pickup}`,
      `My phone: ${parsed.data.phone}`,
    ];
    if (needs.trim() && !draft.trim()) msg.push(`Extra needs: ${needs.trim()}`);
    const text = draft.trim()
      ? [draft.trim(), "", ...msg.slice(1)].join("\n")
      : msg.join("\n");
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(text)}`, "_blank", "noreferrer");
  };

  return (
    <section className="mx-auto max-w-6xl px-4 pb-16">
      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-card)]">
        <div className="grid gap-0 md:grid-cols-2">
          <div className="flex flex-col justify-center gap-3 p-6 md:p-10">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-primary">
              <CarFront className="h-3.5 w-3.5" /> Private hire
            </span>
            <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
              Travelling alone? Hire the whole car.
            </h2>
            <p className="text-muted-foreground">
              Even if it's just you, you can rent a private 7-seater Sienta between Nairobi and
              Isiolo — your own car, your own schedule. Send a request and we'll agree on the fare
              with you directly.
            </p>
          </div>

          <form onSubmit={submit} className="flex flex-col gap-4 border-t border-border bg-background p-6 md:border-l md:border-t-0 md:p-10">
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { value: "nairobi-isiolo", label: "Nairobi → Isiolo" },
                  { value: "isiolo-nairobi", label: "Isiolo → Nairobi" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDirection(opt.value)}
                  className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                    direction === opt.value
                      ? "border-primary bg-accent text-primary"
                      : "border-border bg-card text-muted-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="hire-date">Travel date</Label>
              <Input
                id="hire-date"
                type="date"
                value={date}
                min={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setDate(e.target.value)}
                className="h-11 rounded-xl"
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="hire-pickup">Pickup point</Label>
              <Input
                id="hire-pickup"
                placeholder="e.g. CBD, Nairobi"
                value={pickup}
                maxLength={120}
                onChange={(e) => setPickup(e.target.value)}
                className="h-11 rounded-xl"
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="hire-phone">Your phone number</Label>
              <Input
                id="hire-phone"
                type="tel"
                placeholder="07XX XXX XXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-11 rounded-xl"
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="hire-needs">Extra needs (optional)</Label>
              <Textarea
                id="hire-needs"
                placeholder="e.g. 2 big suitcases, stop in Nanyuki for lunch, leave by 6am"
                value={needs}
                maxLength={600}
                onChange={(e) => setNeeds(e.target.value)}
                className="min-h-20 rounded-xl"
              />
              <Button type="button" variant="outline" onClick={generate} disabled={drafting} className="rounded-xl">
                {drafting ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Sparkles className="mr-1 h-4 w-4" />}
                {drafting ? "Writing your request…" : "Write my request with AI"}
              </Button>
            </div>

            {draft && (
              <div className="grid gap-1.5">
                <Label htmlFor="hire-draft">Your request (edit if you like)</Label>
                <Textarea
                  id="hire-draft"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  className="min-h-36 rounded-xl"
                />
              </div>
            )}

            <Button type="submit" size="lg" className="mt-1 h-12 rounded-xl text-base font-semibold">
              <MessageCircle className="mr-1 h-5 w-5" /> Request private hire
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Your request opens in WhatsApp — we reply with the fare.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
