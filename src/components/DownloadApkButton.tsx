import { Download } from "lucide-react";

// Served through our own endpoint so the file arrives as an installable Android
// package instead of a generic .zip download.
const APK_URL = (import.meta.env.VITE_APK_URL as string | undefined)?.trim() || "/api/public/northgo-apk";


export function DownloadApkButton({
  variant = "default",
  className = "",
}: {
  variant?: "default" | "hero" | "compact";
  className?: string;
}) {
  const base =
    "inline-flex items-center gap-2 rounded-xl font-semibold transition active:scale-[0.98]";
  const styles =
    variant === "hero"
      ? "h-14 px-6 text-base bg-white text-primary hover:bg-white/90"
      : variant === "compact"
        ? "h-9 px-3 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
        : "h-11 px-4 text-sm bg-primary text-primary-foreground hover:bg-primary/90";

  return (
    <a
      href={APK_URL}
      download="northgo.apk"
      // Embedded preview iframes block same-tab downloads — open in a new tab.
      target="_blank"
      rel="noopener noreferrer"
      className={`${base} ${styles} ${className}`}
      aria-label="Download the NorthGo Android app (APK)"
    >
      <Download className="h-4 w-4" />
      <span>Download App</span>
    </a>
  );
}
