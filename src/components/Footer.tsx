import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="mt-8 border-t border-border bg-background">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-5 text-xs text-muted-foreground">
        <span className="font-display text-sm font-bold text-foreground">NorthGo</span>
        <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Link to="/trips" className="transition hover:text-primary">Trips</Link>
          <Link to="/about" className="transition hover:text-primary">About</Link>
          <Link to="/faq" className="transition hover:text-primary">Help</Link>
          <Link to="/contact" className="transition hover:text-primary">Contact</Link>
        </nav>
        <span>© {new Date().getFullYear()} NorthGo</span>
      </div>
    </footer>
  );
}
