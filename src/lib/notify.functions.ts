import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ADMIN_WHATSAPP = "254729588851"; // 0729588851 in international format, no '+'

/**
 * Notifies the admin about the *caller's own* driver application.
 * All message content is read server-side from the caller's drivers row —
 * nothing is taken from the client, so it cannot be used to send arbitrary
 * text to the admin's WhatsApp.
 */
export const notifyDriverApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const { data: driver, error } = await supabase
      .from("drivers")
      .select("full_name, phone, vehicle_name, status")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("driver lookup failed", error.message);
      return { sent: false, reason: "lookup_failed" };
    }
    if (!driver || driver.status !== "pending") {
      // No pending application for this user → nothing legitimate to notify about.
      return { sent: false, reason: "no_pending_application" };
    }

    const apiKey = process.env.CALLMEBOT_API_KEY;
    if (!apiKey) {
      console.warn("CALLMEBOT_API_KEY not configured; skipping WhatsApp notification");
      return { sent: false, reason: "no_api_key" };
    }

    const clean = (v: string | null) => (v ?? "").replace(/[\r\n]+/g, " ").slice(0, 120);
    const text = `🚐 New NorthGo driver application\nName: ${clean(driver.full_name)}\nPhone: ${clean(
      driver.phone,
    )}\nVehicle: ${clean(driver.vehicle_name)}\nReview: https://north-go-route.lovable.app/admin`;
    const url = `https://api.callmebot.com/whatsapp.php?phone=${ADMIN_WHATSAPP}&text=${encodeURIComponent(
      text,
    )}&apikey=${apiKey}`;

    try {
      const res = await fetch(url, { method: "GET" });
      const body = await res.text();
      if (!res.ok) {
        console.error(`CallMeBot error ${res.status}: ${body}`);
        return { sent: false, reason: `http_${res.status}` };
      }
      return { sent: true };
    } catch (err) {
      console.error("CallMeBot request failed", err);
      return { sent: false, reason: "network_error" };
    }
  });
