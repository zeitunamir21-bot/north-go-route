import { Link } from "@tanstack/react-router";
import { Home, Search, Ticket, User } from "lucide-react";
import { haptic } from "@/lib/native";
import { useRipple } from "@/components/native/Touchable";

const items: {
  to: "/" | "/trips" | "/my-bookings" | "/profile";
  label: string;
  icon: typeof Home;
  exact?: boolean;
}[] = [
  { to: "/", label: "Home", icon: Home, exact: true },
  { to: "/trips", label: "Bookings", icon: Search },
  { to: "/my-bookings", label: "Tickets", icon: Ticket },
  { to: "/profile", label: "Profile", icon: User },
];

/** Material 3 navigation bar: pill indicator, ripple, haptics, safe-area aware. */
export function BottomNav() {
  const ripple = useRipple<HTMLAnchorElement>();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
      style={{ boxShadow: "var(--elevation-2)" }}
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-around px-1 py-1.5">
        {items.map(({ to, label, icon: Icon, exact }) => (
          <li key={to} className="flex-1">
            <Link
              to={to}
              activeOptions={exact ? { exact: true } : undefined}
              onPointerDown={(e) => {
                ripple(e);
                haptic("light");
              }}
              activeProps={{ className: "nav-item-active text-foreground" }}
              className="m3-ripple group flex flex-col items-center justify-center gap-1 rounded-2xl px-1 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors"
            >
              <span className="nav-pill relative flex h-8 w-16 items-center justify-center rounded-full transition-[background-color,transform] duration-200">
                <Icon className="h-5 w-5 transition-transform duration-200 group-active:scale-90" />
              </span>
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
