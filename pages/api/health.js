// pages/api/health.js
export default function handler(req, res) {
  res.status(200).json({
    status: "ok",
    service: "wpsent-ai-bot",
    timestamp: new Date().toISOString(),
    config: {
      wpsent_base_url: process.env.WPSENT_BASE_URL || "https://wpsent.xyz",
      groq_model: process.env.GROQ_MODEL || "llama3-8b-8192",
      wpsent_client_id_set: !!process.env.WPSENT_CLIENT_ID,
      wpsent_api_key_set: !!process.env.WPSENT_API_KEY,
      groq_api_key_set: !!process.env.GROQ_API_KEY,
    },
  });
}
