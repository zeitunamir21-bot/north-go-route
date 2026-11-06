import { createOpenAI } from "@ai-sdk/openai";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

const SYSTEM_PROMPT = `You are the NorthGo Transport online assistant. NorthGo runs 7-seater Toyota Sienta vehicles between Isiolo and Nairobi, Kenya, with daily departures both ways, morning and evening.

You answer basic questions about:
- Booking: visitors book seats on the website's booking page, choose a trip, pick seats, and pay on board. They can also book via WhatsApp.
- Routes: Isiolo to Nairobi and Nairobi to Isiolo.
- Private hire: a solo traveller can hire the whole car through the "Hire a private car" section on the homepage.
- Fares: say fares are favourable and shown during booking; never quote a fixed price.
- Drivers: verified drivers with profiles, ratings and reviews on the Drivers page.
- Contact: WhatsApp and phone contact options are on the site; support email is available on the Contact page.

Rules: be friendly, short and clear (max ~80 words per reply). Never invent prices, schedules, phone numbers or promises like "always on time". If you don't know something, suggest booking via the site or contacting support on WhatsApp. Plain text or simple markdown only.`;

export async function handleChat(request: Request): Promise<Response> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "The assistant is not configured yet." }, { status: 500 });
  }

  let body: { messages?: UIMessage[]; sessionId?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const messages = body.messages ?? [];
  const sessionId = typeof body.sessionId === "string" ? body.sessionId.slice(0, 80) : "";
  if (messages.length === 0 || sessionId.length < 10) {
    return Response.json({ error: "Missing messages or session." }, { status: 400 });
  }

  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
  });

  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const lastUserText =
    lastUser?.parts
      ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
      .map((p) => p.text)
      .join(" ")
      .slice(0, 2000) ?? "";

  const result = streamText({
    model: provider.responses("openai/gpt-6-astra"),
    system: SYSTEM_PROMPT,
    messages: convertToModelMessages(messages),
    maxRetries: 0,
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

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    onFinish: async ({ responseMessage }) => {
      try {
        const assistantText = responseMessage.parts
          .filter((p): p is { type: "text"; text: string } => p.type === "text")
          .map((p) => p.text)
          .join("")
          .trim();
        if (!assistantText) return;
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        await supabaseAdmin.from("chat_messages").insert([
          { session_id: sessionId, role: "user", content: lastUserText },
          { session_id: sessionId, role: "assistant", content: assistantText.slice(0, 4000) },
        ]);
      } catch (e) {
        console.error("chat persist failed", e);
      }
    },
  });
}
