import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Menu,
  X,
  Home,
  Search,
  Ticket,
  User,
  Car,
  ShieldCheck,
  Info,
  HelpCircle,
  Phone,
  History,
  ArrowRight,
  MapPin,
  MessageCircle,
  Mail,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { haptic } from "@/lib/native";
import { cn } from "@/lib/utils";
import { supportMailto } from "@/components/SupportEmailButton";

const SUPPORT_PHONE = "254790179834";
const WHATSAPP_TEXT = encodeURIComponent("Hi NorthGo, I need help with a booking.");

type To =
  | "/"
  | "/trips"
  | "/my-bookings"
  | "/history"
  | "/drivers"
  | "/profile"
  | "/driver"
  | "/admin"
  | "/about"
  | "/faq"
  | "/contact";

const MAIN: { to: To; label: string; icon: typeof Home; exact?: boolean }[] = [
  { to: "/", label: "Home", icon: Home, exact: true },
  { to: "/trips", label: "Trips & booking", icon: Search },
  { to: "/my-bookings", label: "My tickets", icon: Ticket },
  { to: "/history", label: "Trip history", icon: History },
  { to: "/drivers", label: "Drivers", icon: Car },
  { to: "/profile", label: "Profile", icon: User },
];

const MORE: { to: To; label: string; icon: typeof Home }[] = [
  { to: "/driver", label: "Driver dashboard", icon: Car },
  { to: "/admin", label: "Admin", icon: ShieldCheck },
  { to: "/about", label: "About NorthGo", icon: Info },
  { to: "/faq", label: "FAQ", icon: HelpCircle },
];

const SUPPORT: { href: string; label: string; icon: typeof Home; external?: boolean }[] = [
  {
    href: `https://wa.me/${SUPPORT_PHONE}?text=${WHATSAPP_TEXT}`,
    label: "WhatsApp support",
    icon: MessageCircle,
    external: true,
  },
  { href: `tel:+${SUPPORT_PHONE}`, label: "Call support", icon: Phone, external: true },
  { href: supportMailto(), label: "Email support", icon: Mail, external: true },
  { href: "/contact", label: "Help & topics", icon: HelpCircle },
];

/** Slide-in side menu (drawer) with the full site navigation. */
export function SideMenu() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const isActive = (to: To, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(`${to}/`);

  const Item = ({ to, label, icon: Icon, exact }: { to: To; label: string; icon: typeof Home; exact?: boolean }) => (
    <Link
      to={to}
      onClick={() => {
        haptic("light");
        setOpen(false);
      }}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
        isActive(to, exact)
          ? "bg-primary/10 text-primary"
          : "text-foreground/80 hover:bg-accent hover:text-foreground"
      )}
    >
      <span
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-lg",
          isActive(to, exact) ? "bg-primary text-primary-foreground" : "bg-accent text-muted-foreground"
        )}
      >
        <Icon className="h-5 w-5" />
      </span>
      {label}
      {isActive(to, exact) && <ArrowRight className="ml-auto h-4 w-4" />}
    </Link>
  );

  const ActionItem = ({
    href,
    label,
    icon: Icon,
    external,
  }: {
    href: string;
    label: string;
    icon: typeof Home;
    external?: boolean;
  }) => {
    const linkProps = external
      ? { target: "_blank", rel: "noreferrer" }
      : {};
    return (
      <a
        href={href}
        onClick={() => {
          haptic("light");
          setOpen(false);
        }}
        {...linkProps}
        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-foreground"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-muted-foreground">
          <Icon className="h-5 w-5" />
        </span>
        {label}
        {external && <ArrowRight className="ml-auto h-4 w-4 -rotate-45 text-muted-foreground" />}
      </a>
    );
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          aria-label="Open menu"
          onClick={() => haptic("light")}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-foreground transition hover:bg-accent active:scale-95"
        >
          <Menu className="h-5 w-5" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 max-w-[85vw] p-0">
        <SheetHeader className="border-b border-border px-5 py-4">
          <SheetTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <MapPin className="h-5 w-5" />
              </span>
              <span className="font-display text-xl font-bold tracking-tight">
                North<span className="text-primary">Go</span>
              </span>
            </span>
            <button
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent"
            >
              <X className="h-5 w-5" />
            </button>
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Menu
          </p>
          <nav className="flex flex-col gap-1">
            {MAIN.map((item) => (
              <Item key={item.to} {...item} />
            ))}
          </nav>

          <p className="px-3 pb-2 pt-5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            More
          </p>
          <nav className="flex flex-col gap-1">
            {MORE.map((item) => (
              <Item key={item.to} {...item} />
            ))}
          </nav>
        </div>

        <div className="border-t border-border p-4">
          <Link
            to="/trips"
            onClick={() => setOpen(false)}
            className="flex h-12 w-full items-center justify-center gap-1.5 rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
          >
            Book your seat <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
