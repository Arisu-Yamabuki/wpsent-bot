// pages/api/webhook.js
// Receives incoming WhatsApp messages from WPSent,
// sends them to Groq AI, and replies via WPSent API.

import Groq from "groq-sdk";

// ── Config from env vars ──────────────────────────────────────────────────────
const WPSENT_CLIENT_ID = process.env.WPSENT_CLIENT_ID;
const WPSENT_API_KEY   = process.env.WPSENT_API_KEY;
const WPSENT_BASE_URL  = process.env.WPSENT_BASE_URL || "https://wpsent.xyz";
const GROQ_API_KEY     = process.env.GROQ_API_KEY;
const GROQ_MODEL       = process.env.GROQ_MODEL || "llama3-8b-8192";
const SYSTEM_PROMPT    = process.env.SYSTEM_PROMPT ||
  "You are a helpful WhatsApp assistant. Keep replies concise and friendly.";
const WEBHOOK_SECRET   = process.env.WEBHOOK_SECRET; // optional extra security

// ── Groq client ───────────────────────────────────────────────────────────────
const groq = new Groq({ apiKey: GROQ_API_KEY });

// ── Send reply via WPSent REST API ────────────────────────────────────────────
async function sendWhatsAppReply(to, message) {
  const url = `${WPSENT_BASE_URL}/send?clientid=${WPSENT_CLIENT_ID}&key=${WPSENT_API_KEY}&to=${to}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`WPSent send failed (${res.status}): ${err}`);
  }

  return res.json();
}

// ── Get AI reply from Groq ────────────────────────────────────────────────────
async function getAIReply(userMessage, from) {
  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `[Message from WhatsApp user ${from}]: ${userMessage}`,
      },
    ],
    max_tokens: 500,
    temperature: 0.7,
  });

  return completion.choices[0]?.message?.content?.trim() || "Sorry, I couldn't generate a response.";
}

// ── Main handler ──────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  // Only accept POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Optional: verify webhook secret
  if (WEBHOOK_SECRET) {
    const incoming = req.headers["x-webhook-secret"];
    if (incoming !== WEBHOOK_SECRET) {
      console.warn("Unauthorized webhook attempt");
      return res.status(401).json({ error: "Unauthorized" });
    }
  }

  try {
    const payload = req.body;
    console.log("Webhook received:", JSON.stringify(payload));

    // Only handle incoming text messages
    if (payload.event !== "message_received") {
      return res.status(200).json({ status: "ignored", reason: "not a message event" });
    }

    const { from, body: messageBody, type } = payload;

    // Skip non-text types (stickers, images, etc.) — respond politely
    if (type !== "text") {
      await sendWhatsAppReply(
        from,
        "Sorry, I can only handle text messages right now! Please send me a text. 😊"
      );
      return res.status(200).json({ status: "ok", handled: "non-text-reply" });
    }

    if (!messageBody || !messageBody.trim()) {
      return res.status(200).json({ status: "ignored", reason: "empty body" });
    }

    console.log(`Message from ${from}: ${messageBody}`);

    // Get AI response
    const aiReply = await getAIReply(messageBody, from);
    console.log(`AI reply to ${from}: ${aiReply}`);

    // Send it back via WPSent
    await sendWhatsAppReply(from, aiReply);

    return res.status(200).json({ status: "ok", replied: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    // Return 200 so WPSent doesn't keep retrying on our bug
    return res.status(200).json({ status: "error", message: error.message });
  }
}
