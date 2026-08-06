import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in to NorthGo — Manage your Isiolo Nairobi bookings" },
      {
        name: "description",
        content:
          "Create a NorthGo account to track, cancel, or rebook your Isiolo ⇄ Nairobi trips. Free, secure passenger access.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [accountType, setAccountType] = useState<"passenger" | "driver" | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/my-bookings" });
    });
  }, [navigate]);


  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/my-bookings`,
          data: { full_name: name },
        },
      });
      setLoading(false);
      if (error) return toast.error(error.message);
      toast.success("Check your email to confirm your account.");
      setMode("signin");
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    navigate({ to: "/my-bookings" });
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-md px-4 py-12">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-card)]">
          <h1 className="font-display text-3xl font-bold">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "signin"
              ? "Sign in to view and manage your NorthGo bookings."
              : "Track your trips, cancel bookings, and get receipts."}
          </p>

          <div className="mt-5 flex rounded-lg border border-border bg-muted p-1 text-sm font-medium">
            <button
              onClick={() => {
                setMode("signin");
                setAccountType(null);
              }}
              className={`flex-1 rounded-md py-1.5 ${mode === "signin" ? "bg-background shadow" : "text-muted-foreground"}`}
            >
              Sign in
            </button>
            <button
              onClick={() => {
                setMode("signup");
                setAccountType(null);
              }}
              className={`flex-1 rounded-md py-1.5 ${mode === "signup" ? "bg-background shadow" : "text-muted-foreground"}`}
            >
              Create account
            </button>
          </div>

          {mode === "signup" && accountType === null && (
            <div className="mt-5 space-y-3">
              <p className="text-sm font-medium">What kind of account do you need?</p>
              <button
                type="button"
                onClick={() => setAccountType("passenger")}
                className="flex w-full items-start gap-3 rounded-xl border border-border p-4 text-left transition hover:border-primary hover:bg-accent"
              >
                <UserRound className="mt-0.5 h-5 w-5 text-primary" />
                <span>
                  <span className="block font-semibold">Passenger sign up</span>
                  <span className="block text-xs text-muted-foreground">
                    Book seats, track trips and manage bookings. Takes 30 seconds.
                  </span>
                </span>
              </button>
              <Link
                to="/driver/signup"
                className="flex w-full items-start gap-3 rounded-xl border border-border p-4 text-left transition hover:border-primary hover:bg-accent"
              >
                <Car className="mt-0.5 h-5 w-5 text-primary" />
                <span>
                  <span className="block font-semibold">Driver sign up</span>
                  <span className="block text-xs text-muted-foreground">
                    Post trips and take bookings. We'll ask for your vehicle and licence details.
                  </span>
                </span>
              </Link>
            </div>
          )}

          {mode === "signin" && (
            <p className="mt-4 rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
              Passengers and drivers use the same sign in. Drivers land on their dashboard
              automatically — or go straight to{" "}
              <Link to="/driver/login" className="text-primary underline">
                driver sign in
              </Link>
              .
            </p>
          )}

          {(mode === "signin" || accountType === "passenger") && (
          <form onSubmit={onSubmit} className="mt-5 space-y-4">

            {mode === "signup" && (
              <div>
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1.5 h-11"
                />
              </div>
            )}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 h-11"
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {mode === "signin" && (
                  <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                    Forgot password?
                  </Link>
                )}
              </div>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 h-11"
              />
            </div>
            <Button type="submit" disabled={loading} size="lg" className="w-full rounded-xl">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "signin" ? "Sign in" : "Create account"}
            </Button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
