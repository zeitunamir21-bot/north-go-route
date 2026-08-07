import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Support inbox is never rendered as text — only used to build mailto links. */
const SUPPORT_ADDRESS = "zeitun101@swiftlyme.com";

export const SUPPORT_TOPICS = [
  { key: "booking", label: "Booking inquiry", subject: "NorthGo booking inquiry" },
  { key: "support", label: "Customer support", subject: "NorthGo customer support request" },
  { key: "feedback", label: "Feedback", subject: "NorthGo feedback" },
  { key: "complaint", label: "Complaint", subject: "NorthGo complaint" },
  {
    key: "misconduct",
    label: "Report driver misconduct",
    subject: "NorthGo report: driver misconduct",
  },
  {
    key: "driving",
    label: "Reckless driving / overspeeding",
    subject: "NorthGo report: reckless driving or overspeeding",
  },
  { key: "lost", label: "Lost item", subject: "NorthGo lost item report" },
  { key: "payment", label: "Payment issue", subject: "NorthGo payment issue" },
  { key: "other", label: "Something else", subject: "NorthGo support" },
] as const;

export function supportMailto(subject = "NorthGo support", body?: string) {
  const params = new URLSearchParams({ subject });
  if (body) params.set("body", body);
  return `mailto:${SUPPORT_ADDRESS}?${params.toString()}`;
}

type Props = {
  subject?: string;
  label?: string;
  className?: string;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg";
};

/** Primary support call-to-action. Opens the visitor's email app; no address is shown. */
export function SupportEmailButton({
  subject = "NorthGo support",
  label = "Contact Support",
  className,
  variant = "default",
  size = "lg",
}: Props) {
  return (
    <Button asChild variant={variant} size={size} className={cn("rounded-xl", className)}>
      <a href={supportMailto(subject)} aria-label={`${label} by email`}>
        <Mail className="mr-2 h-4 w-4" aria-hidden="true" /> {label}
      </a>
    </Button>
  );
}

/** Compact icon-only variant for headers, footers and cards. */
export function SupportEmailIcon({ className }: { className?: string }) {
  return (
    <a
      href={supportMailto()}
      aria-label="Email NorthGo support"
      title="Email NorthGo support"
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border transition hover:border-primary hover:text-primary",
        className,
      )}
    >
      <Mail className="h-4 w-4" aria-hidden="true" />
    </a>
  );
}

/** Grid of pre-filled support reasons so visitors land in the right inbox thread. */
export function SupportTopics({ className }: { className?: string }) {
  return (
    <div className={cn("grid gap-2 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {SUPPORT_TOPICS.map((t) => (
        <a
          key={t.key}
          href={supportMailto(t.subject)}
          className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 text-sm font-medium transition hover:border-primary hover:text-primary"
        >
          <Mail className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          {t.label}
        </a>
      ))}
    </div>
  );
}
