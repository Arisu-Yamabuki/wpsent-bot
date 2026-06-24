// pages/api/webhook.js
import Groq from "groq-sdk";

const WPSENT_CLIENT_ID = process.env.WPSENT_CLIENT_ID;
const WPSENT_API_KEY   = process.env.WPSENT_API_KEY;
const WPSENT_BASE_URL  = process.env.WPSENT_BASE_URL || "https://wpsent.xyz";
const GROQ_API_KEY     = process.env.GROQ_API_KEY;
const GROQ_MODEL       = process.env.GROQ_MODEL || "llama3-8b-8192";
const SYSTEM_PROMPT    = process.env.SYSTEM_PROMPT ||
  "You are a helpful WhatsApp assistant. Keep replies concise and friendly.";
const WEBHOOK_SECRET       = process.env.WEBHOOK_SECRET;
const MAX_HISTORY          = parseInt(process.env.MAX_HISTORY || "500");
const UPSTASH_REDIS_REST_URL   = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

const groq = new Groq({ apiKey: GROQ_API_KEY });

// ── Upstash Redis helpers (REST API, no extra package needed) ─────────────────
async function redisGet(key) {
  const res = await fetch(`${UPSTASH_REDIS_REST_URL}/get/${key}`, {
    headers: { Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}` },
  });
  const data = await res.json();
  if (!data.result) return [];
  const parsed = JSON.parse(data.result);
  return Array.isArray(parsed) ? parsed : [];
}

async function redisSet(key, value) {
  await fetch(`${UPSTASH_REDIS_REST_URL}/set/${key}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ value: JSON.stringify(value) }),
  });
}

// ── Conversation history (per user, max 500 messages) ─────────────────────────
async function getHistory(number) {
  try {
    return await redisGet(`chat:${number}`);
  } catch {
    return [];
  }
}

async function saveHistory(number, history) {
  // Keep only last MAX_HISTORY messages
  const trimmed = history.slice(-MAX_HISTORY);
  await redisSet(`chat:${number}`, trimmed);
}

// ── Strip @lid / @s.whatsapp.net suffixes ─────────────────────────────────────
function cleanNumber(from) {
  return from ? from.replace(/@.*$/, "") : from;
}

// ── Strip <think>...</think> blocks (reasoning models) ────────────────────────
function stripThinking(text) {
  return text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
}

// ── Send reply via WPSent ─────────────────────────────────────────────────────
async function sendWhatsAppReply(to, message) {
  const cleanTo = cleanNumber(to);
  const url = `${WPSENT_BASE_URL}/send?clientid=${WPSENT_CLIENT_ID}&key=${WPSENT_API_KEY}&to=${cleanTo}`;
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

// ── Get AI reply from Groq (with full conversation history) ───────────────────
async function getAIReply(number, userMessage) {
  const history = await getHistory(number);

  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      ...history,
      { role: "user", content: userMessage },
    ],
    max_tokens: 500,
    temperature: 0.7,
  });

  const raw = completion.choices[0]?.message?.content?.trim() ||
    "Sorry, I couldn't generate a response.";

  const reply = stripThinking(raw);

  // Save updated history to Upstash
  await saveHistory(number, [
    ...history,
    { role: "user",      content: userMessage },
    { role: "assistant", content: reply },
  ]);

  return reply;
}

// ── Build prompt per message type ─────────────────────────────────────────────
function buildPrompt(type, body) {
  switch (type) {
    case "text":
      return body;
    case "reaction":
      const emoji = body.match(/\[Reaction:\s*(.+)\]/)?.[1] || "👍";
      return `The user reacted with: ${emoji}. Acknowledge it warmly in 1 sentence.`;
    case "sticker":
      return "The user sent a sticker. Reply fun and friendly in 1 sentence.";
    case "image":
      return "The user sent an image. Tell them you can't view images yet and ask them to describe it. Keep it short.";
    case "video":
      return "The user sent a video. Tell them you can't watch videos yet. Keep it short.";
    case "audio":
      return "The user sent a voice note. Tell them you can't listen to audio and ask them to type instead. Keep it short.";
    case "document":
      return "The user sent a document. Tell them you can't read files yet. Keep it short.";
    case "location":
      const coords = body.match(/\[Location:\s*([\d.]+),([\d.]+)\]/);
      if (coords) return `The user shared their location: lat ${coords[1]}, lng ${coords[2]}. Acknowledge it.`;
      return "The user shared their location. Acknowledge it kindly.";
    default:
      return `The user sent a "${type}" message: ${body}. Respond appropriately.`;
  }
}

// ── Main handler ──────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (WEBHOOK_SECRET) {
    if (req.headers["x-webhook-secret"] !== WEBHOOK_SECRET) {
      return res.status(401).json({ error: "Unauthorized" });
    }
  }

  try {
    const payload = req.body;
    console.log("Webhook:", JSON.stringify(payload));

    if (payload.event !== "message_received") {
      return res.status(200).json({ status: "ignored" });
    }

    const { from, body: messageBody, type } = payload;
    if (!from) return res.status(200).json({ status: "ignored" });

    const number = cleanNumber(from);
    const prompt  = buildPrompt(type, messageBody || "");

    // Get AI reply (loads history from Upstash, saves back after)
    const aiReply = await getAIReply(number, prompt);

    console.log(`[${type}] ${number} → ${aiReply}`);

    await sendWhatsAppReply(from, aiReply);

    return res.status(200).json({ status: "ok", type, replied: true });

  } catch (error) {
    console.error("Error:", error.message);
    return res.status(200).json({ status: "error", message: error.message });
  }
}
