import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const input = z.object({
  route: z.string().max(40),
  date: z.string().max(20),
  pickup: z.string().max(120),
  needs: z.string().trim().min(3).max(600),
});

export const draftHireRequest = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => input.parse(d))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) return { ok: false as const, error: "AI is not configured yet." };
    const { createOpenAI } = await import("@ai-sdk/openai");
    const { streamText } = await import("ai");
    const provider = createOpenAI({
      baseURL: "https://ai.gateway.lovable.dev/v1",
      apiKey,
      headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    });
    let failure: unknown;
    try {
      const result = streamText({
        model: provider.responses("openai/gpt-6-astra"),
        system:
          "You write short, polite WhatsApp private-hire requests for NorthGo Transport (Isiolo ⇄ Nairobi, 7-seater Sienta). Start with 'Hello NorthGo,'. Organise the traveller's extra needs (luggage, stops, timing, passengers, special requests) as clear bullet points. Do not invent details, prices or phone numbers. Max 120 words. Plain text only.",
        messages: [
          {
            role: "user",
            content: `Route: ${data.route}\nDate: ${data.date || "not set"}\nPickup: ${data.pickup || "not set"}\nExtra needs: ${data.needs}`,
          },
        ],
        maxRetries: 0,
        onError: ({ error }) => {
          failure = error;
        },
        providerOptions: {
          openai: {
            forceReasoning: true,
            reasoningEffort: "low",
            reasoningSummary: "auto",
            store: false,
            include: ["reasoning.encrypted_content"],
          },
        },
      });
      const text = (await result.text).trim();
      if (failure || !text) throw failure ?? new Error("empty");
      return { ok: true as const, text };
    } catch (e) {
      const status = (e as { statusCode?: number })?.statusCode;
      const error =
        status === 429
          ? "Too many requests right now — please try again shortly."
          : status === 402 || status === 403
            ? "The AI assistant is unavailable at the moment."
            : "Couldn't write the request. Please try again.";
      console.error("draftHireRequest", status, e);
      return { ok: false as const, error };
    }
  });
