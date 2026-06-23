// pages/index.js
export default function Home() {
  return (
    <div style={{ fontFamily: "monospace", padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
      <h1>🤖 WPSent AI Bot</h1>
      <p>WhatsApp AI bot powered by <strong>WPSent</strong> + <strong>Groq</strong>.</p>
      <hr />
      <h2>Webhook URL</h2>
      <code style={{ background: "#f0f0f0", padding: "0.5rem 1rem", display: "block", borderRadius: "4px" }}>
        POST /api/webhook
      </code>
      <p>Register this URL in your WPSent dashboard as a webhook.</p>
      <hr />
      <h2>Health Check</h2>
      <a href="/api/health">/api/health</a>
    </div>
  );
}
