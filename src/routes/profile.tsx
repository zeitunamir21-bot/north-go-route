import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Bell,
  ChevronRight,
  LogOut,
  Moon,
  ShieldCheck,
  Ticket,
  User as UserIcon,
  UserRoundCog,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/useAuth";
import { useTheme } from "@/lib/theme";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { haptic, passengerStore, useAppSetting, type SavedPassenger } from "@/lib/native";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — NorthGo Account & Settings" },
      {
        name: "description",
        content:
          "Manage your NorthGo profile: saved passenger details, booking history, notification settings and dark mode.",
      },
      { property: "og:title", content: "Profile — NorthGo Account & Settings" },
      {
        property: "og:description",
        content: "Saved passengers, booking history, notifications and appearance settings.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { session, user } = useAuth();
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const [notifyBooking, setNotifyBooking] = useAppSetting("notify.booking", true);
  const [notifyReminders, setNotifyReminders] = useAppSetting("notify.reminders", true);
  const [notifyDeparture, setNotifyDeparture] = useAppSetting("notify.departure", true);
  const [passenger, setPassenger] = useState<SavedPassenger>({ name: "", phone: "" });

  useEffect(() => {
    setPassenger(passengerStore.read() ?? { name: "", phone: "" });
  }, []);

  const savePassenger = () => {
    if (!passenger.name.trim() || !passenger.phone.trim()) {
      toast.error("Add both a name and a phone number");
      return;
    }
    passengerStore.save({ name: passenger.name.trim(), phone: passenger.phone.trim() });
    haptic("medium");
    toast.success("Passenger details saved on this device");
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-background pb-28">
      <Header />

      <main className="mx-auto max-w-2xl px-4 py-6">
        <h1 className="sr-only">Your NorthGo profile</h1>

        <section className="m3-card flex items-center gap-4 p-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UserIcon className="h-7 w-7" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-lg font-bold">
              {session ? (user?.email ?? "Signed in") : "Guest traveller"}
            </p>
            <p className="text-xs text-muted-foreground">
              {session ? "NorthGo account" : "Sign in to sync your tickets across devices"}
            </p>
          </div>
          {session ? (
            <Button variant="outline" size="sm" className="rounded-full" onClick={signOut}>
              <LogOut className="mr-1.5 h-3.5 w-3.5" /> Sign out
            </Button>
          ) : (
            <Button asChild size="sm" className="rounded-full">
              <Link to="/auth">Sign in</Link>
            </Button>
          )}
        </section>

        <section className="m3-card mt-4 p-5">
          <h2 className="flex items-center gap-2 font-display text-base font-bold">
            <UserRoundCog className="h-4 w-4 text-primary" /> Saved passenger
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Autofilled when you book. Stored only on this device.
          </p>
          <div className="mt-4 space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="p-name">Full name</Label>
              <Input
                id="p-name"
                autoComplete="name"
                enterKeyHint="next"
                value={passenger.name}
                onChange={(e) => setPassenger((p) => ({ ...p, name: e.target.value }))}
                placeholder="Amina Yusuf"
                className="h-12 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-phone">Phone number</Label>
              <Input
                id="p-phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                enterKeyHint="done"
                value={passenger.phone}
                onChange={(e) => setPassenger((p) => ({ ...p, phone: e.target.value }))}
                placeholder="07XX XXX XXX"
                className="h-12 rounded-xl"
              />
            </div>
            <Button className="h-12 w-full rounded-xl" onClick={savePassenger}>
              Save details
            </Button>
          </div>
        </section>

        <section className="m3-card mt-4 divide-y divide-border overflow-hidden">
          <RowLink to="/my-bookings" icon={Ticket} label="Booking history" hint="Tickets & receipts" />
          <RowLink to="/history" icon={ShieldCheck} label="Past trips" hint="Completed journeys" />
        </section>

        <section className="m3-card mt-4 p-5">
          <h2 className="flex items-center gap-2 font-display text-base font-bold">
            <Bell className="h-4 w-4 text-primary" /> Notifications
          </h2>
          <div className="mt-3 space-y-1">
            <ToggleRow
              label="Booking confirmations"
              checked={notifyBooking}
              onChange={setNotifyBooking}
            />
            <ToggleRow
              label="Trip reminders"
              checked={notifyReminders}
              onChange={setNotifyReminders}
            />
            <ToggleRow
              label="Departure alerts"
              checked={notifyDeparture}
              onChange={setNotifyDeparture}
            />
          </div>
        </section>

        <section className="m3-card mt-4 p-5">
          <h2 className="flex items-center gap-2 font-display text-base font-bold">
            <Moon className="h-4 w-4 text-primary" /> Appearance
          </h2>
          <ToggleRow
            label="Dark mode"
            checked={theme === "dark"}
            onChange={() => {
              haptic("light");
              toggle();
            }}
          />
        </section>
      </main>

      <BottomNav />
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-sm font-medium">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function RowLink({
  to,
  icon: Icon,
  label,
  hint,
}: {
  to: "/my-bookings" | "/history";
  icon: typeof Ticket;
  label: string;
  hint: string;
}) {
  return (
    <Link
      to={to}
      className="m3-ripple flex items-center gap-3 px-5 py-4 transition-colors active:bg-accent/60"
      onPointerDown={() => haptic("light")}
    >
      <Icon className="h-4 w-4 text-primary" />
      <span className="flex-1">
        <span className="block text-sm font-semibold">{label}</span>
        <span className="block text-xs text-muted-foreground">{hint}</span>
      </span>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}
