// pages/api/webhook.js
import Groq from "groq-sdk";

const WPSENT_CLIENT_ID         = process.env.WPSENT_CLIENT_ID;
const WPSENT_API_KEY           = process.env.WPSENT_API_KEY;
const WPSENT_BASE_URL          = process.env.WPSENT_BASE_URL || "https://wpsent.xyz";
const GROQ_API_KEY             = process.env.GROQ_API_KEY;
const GROQ_MODEL               = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
const SYSTEM_PROMPT            = process.env.SYSTEM_PROMPT ||
  "You are a helpful WhatsApp assistant. Keep replies concise and friendly.";
const WEBHOOK_SECRET           = process.env.WEBHOOK_SECRET;
const MAX_HISTORY              = parseInt(process.env.MAX_HISTORY || "500");
const UPSTASH_REDIS_REST_URL   = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

const groq = new Groq({ apiKey: GROQ_API_KEY });

// ── Upstash Redis (REST API) ──────────────────────────────────────────────────
// Correct Upstash REST format: GET /get/key  SET /set/key body=value (plain string)
async function redisGet(key) {
  const res = await fetch(`${UPSTASH_REDIS_REST_URL}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}` },
  });
  const data = await res.json();
  if (!data.result) return [];
  try {
    const parsed = JSON.parse(data.result);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function redisSet(key, value) {
  // Upstash REST SET: POST /set/key  with plain string body (not JSON-wrapped)
  const res = await fetch(`${UPSTASH_REDIS_REST_URL}/set/${encodeURIComponent(key)}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}`,
      "Content-Type": "application/json",
    },
    // Upstash REST expects: ["SET", "key", "value"] pipeline OR plain value as body param
    // Correct way: use the pipeline endpoint with array command
    body: JSON.stringify(["SET", key, JSON.stringify(value)]),
  });
  const data = await res.json();
  // If pipeline format failed, fallback to query param format
  if (!res.ok || data.error) {
    await fetch(`${UPSTASH_REDIS_REST_URL}/set/${encodeURIComponent(key)}/${encodeURIComponent(JSON.stringify(value))}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}` },
    });
  }
}

// ── Conversation history ───────────────────────────────────────────────────────
async function getHistory(number) {
  try {
    return await redisGet(`chat:${number}`);
  } catch {
    return [];
  }
}

async function saveHistory(number, history) {
  const trimmed = history.slice(-MAX_HISTORY);
  try {
    // Correct Upstash REST pipeline format
    await fetch(`${UPSTASH_REDIS_REST_URL}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["SET", `chat:${number}`, JSON.stringify(trimmed)]
      ]),
    });
  } catch (e) {
    console.error("Redis save error:", e.message);
  }
}

// ── Strip @lid suffix for logging only ────────────────────────────────────────
function cleanNumber(from) {
  return from ? from.replace(/@.*$/, "") : from;
}

// ── Send reply via WPSent ─────────────────────────────────────────────────────
async function sendWhatsAppReply(to, message) {
  const url = `${WPSENT_BASE_URL}/send?clientid=${WPSENT_CLIENT_ID}&key=${WPSENT_API_KEY}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, to }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`WPSent send failed (${res.status}): ${err}`);
  }
  return res.json();
}

// ── Extract only the reply from AI response (strips thinking) ─────────────────
function extractReply(raw) {
  // Method 1: JSON format {"thinking": "...", "reply": "..."}
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.reply) return parsed.reply.trim();
    }
  } catch {}

  // Method 2: Strip <think>...</think> blocks
  const stripped = raw.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
  if (stripped) return stripped;

  return raw.trim();
}

// ── Get AI reply from Groq ────────────────────────────────────────────────────
async function getAIReply(number, userMessage) {
  const history = await getHistory(number);

  const jsonInstruction = `IMPORTANT: Respond ONLY with a JSON object in this exact format, nothing else:
{"reply": "your response here"}
Do not include any thinking, reasoning, or explanation outside the JSON.`;

  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      { role: "system", content: `${SYSTEM_PROMPT}\n\n${jsonInstruction}` },
      ...history,
      { role: "user", content: userMessage },
    ],
    max_tokens: 1024,
    temperature: 0.7,
  });

  const raw = completion.choices[0]?.message?.content?.trim() || "";
  const reply = extractReply(raw);

  // Save full history to Redis (append new exchange)
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
    case "text":     return body;
    case "reaction":
      const emoji = body.match(/\[Reaction:\s*(.+)\]/)?.[1] || "👍";
      return `The user reacted with: ${emoji}. Acknowledge it warmly in 1 sentence.`;
    case "sticker":  return "The user sent a sticker. Reply fun and friendly in 1 sentence.";
    case "image":    return "The user sent an image. Tell them you can't view images yet, ask them to describe it.";
    case "video":    return "The user sent a video. Tell them you can't watch videos yet.";
    case "audio":    return "The user sent a voice note. Tell them you can't listen to audio, ask them to type.";
    case "document": return "The user sent a document. Tell them you can't read files yet.";
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

    // Skip system notifications
    if (type === "e2e_notification" || !messageBody) {
      return res.status(200).json({ status: "ignored", reason: type });
    }

    const number = cleanNumber(from);
    const prompt  = buildPrompt(type, messageBody);

    const aiReply = await getAIReply(number, prompt);
    console.log(`[${type}] ${number} → ${aiReply}`);

    await sendWhatsAppReply(from, aiReply);

    return res.status(200).json({ status: "ok", type, replied: true });

  } catch (error) {
    console.error("Error:", error.message);
    return res.status(200).json({ status: "error", message: error.message });
  }
}
