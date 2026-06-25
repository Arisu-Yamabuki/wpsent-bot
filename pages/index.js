import { useState } from "react";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Inter:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #080C10;
    --bg-card: #0D1117;
    --bg-surface: #111820;
    --border: rgba(0,210,160,0.12);
    --border-mid: rgba(0,210,160,0.22);
    --border-bright: rgba(0,210,160,0.45);
    --accent: #00D2A0;
    --accent-dim: rgba(0,210,160,0.15);
    --accent-glow: rgba(0,210,160,0.08);
    --purple: #8B5CF6;
    --purple-dim: rgba(139,92,246,0.15);
    --amber: #F59E0B;
    --amber-dim: rgba(245,158,11,0.12);
    --text-primary: #E6EDF3;
    --text-secondary: #8B949E;
    --text-muted: #484F58;
    --mono: 'Share Tech Mono', monospace;
    --sans: 'Inter', system-ui, sans-serif;
    --radius: 8px;
    --radius-lg: 12px;
  }

  html { scroll-behavior: smooth; }

  body {
    background: var(--bg);
    color: var(--text-primary);
    font-family: var(--sans);
    font-size: 15px;
    line-height: 1.7;
    min-height: 100vh;
  }

  /* ── scan line overlay ── */
  body::before {
    content: '';
    position: fixed;
    inset: 0;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(0,0,0,0.03) 2px,
      rgba(0,0,0,0.03) 4px
    );
    pointer-events: none;
    z-index: 9999;
  }

  .page { max-width: 760px; margin: 0 auto; padding: 0 1.5rem 5rem; }

  /* ── header bar ── */
  .topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 0;
    border-bottom: 0.5px solid var(--border);
    margin-bottom: 3rem;
  }
  .topbar-brand {
    font-family: var(--mono);
    font-size: 13px;
    color: var(--accent);
    letter-spacing: .06em;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .topbar-brand span { color: var(--text-muted); }
  .status-dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    background: var(--accent);
    animation: pulse 2.4s ease-in-out infinite;
  }
  @keyframes pulse {
    0%,100% { opacity: 1; }
    50% { opacity: 0.3; }
  }
  .topbar-links { display: flex; gap: 1rem; }
  .topbar-links a {
    font-family: var(--mono);
    font-size: 12px;
    color: var(--text-muted);
    text-decoration: none;
    letter-spacing: .04em;
  }
  .topbar-links a:hover { color: var(--accent); }

  /* ── hero ── */
  .hero { padding: 2rem 0 3rem; }
  .hero-eyebrow {
    font-family: var(--mono);
    font-size: 11px;
    letter-spacing: .12em;
    color: var(--accent);
    text-transform: uppercase;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .hero-eyebrow::before {
    content: '';
    display: block;
    width: 24px;
    height: 1px;
    background: var(--accent);
  }
  .hero-title {
    font-family: var(--mono);
    font-size: clamp(28px, 5vw, 44px);
    font-weight: 400;
    letter-spacing: -.01em;
    line-height: 1.15;
    margin-bottom: 1.25rem;
    color: var(--text-primary);
  }
  .hero-title .accent { color: var(--accent); }
  .hero-title .dim { color: var(--text-secondary); }
  .hero-desc {
    font-size: 15px;
    color: var(--text-secondary);
    max-width: 520px;
    line-height: 1.75;
    margin-bottom: 2rem;
  }
  .hero-chips { display: flex; flex-wrap: wrap; gap: 8px; }
  .chip {
    font-family: var(--mono);
    font-size: 11px;
    padding: 5px 12px;
    border-radius: 4px;
    border: 0.5px solid var(--border-mid);
    color: var(--text-secondary);
    letter-spacing: .04em;
    background: var(--bg-card);
  }
  .chip.green { border-color: rgba(0,210,160,.35); color: var(--accent); background: var(--accent-dim); }

  /* ── section ── */
  .section { margin-bottom: 3rem; }
  .section-head {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 1.25rem;
  }
  .section-tag {
    font-family: var(--mono);
    font-size: 10px;
    letter-spacing: .1em;
    text-transform: uppercase;
    color: var(--text-muted);
    border: 0.5px solid var(--border);
    padding: 3px 8px;
    border-radius: 3px;
  }
  .section-line {
    flex: 1;
    height: 0.5px;
    background: var(--border);
  }

  /* ── flow diagram ── */
  .flow {
    background: var(--bg-card);
    border: 0.5px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 1.5rem 1.25rem;
    overflow-x: auto;
  }
  .flow-inner {
    display: flex;
    align-items: center;
    gap: 0;
    min-width: 500px;
  }
  .flow-node {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    flex: 1;
  }
  .flow-icon-wrap {
    width: 44px;
    height: 44px;
    border-radius: 10px;
    border: 0.5px solid var(--border-mid);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    background: var(--bg-surface);
    position: relative;
  }
  .flow-icon-wrap.accent-node {
    border-color: var(--border-bright);
    background: var(--accent-glow);
  }
  .flow-label {
    font-family: var(--mono);
    font-size: 10px;
    color: var(--text-muted);
    letter-spacing: .05em;
    text-align: center;
    line-height: 1.4;
  }
  .flow-label.bright { color: var(--accent); }
  .flow-arrow {
    font-family: var(--mono);
    font-size: 13px;
    color: var(--text-muted);
    padding: 0 4px;
    margin-bottom: 22px;
    flex-shrink: 0;
  }

  /* ── step cards ── */
  .step-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 10px;
  }
  .step-card {
    background: var(--bg-card);
    border: 0.5px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 1.1rem 1.15rem;
    transition: border-color .2s;
  }
  .step-card:hover { border-color: var(--border-mid); }
  .step-num {
    font-family: var(--mono);
    font-size: 10px;
    color: var(--accent);
    letter-spacing: .1em;
    margin-bottom: .5rem;
  }
  .step-card h3 {
    font-size: 14px;
    font-weight: 500;
    margin-bottom: .4rem;
    color: var(--text-primary);
  }
  .step-card p {
    font-size: 13px;
    color: var(--text-secondary);
    line-height: 1.55;
  }
  .step-card a { color: var(--accent); text-decoration: none; }
  .step-card a:hover { text-decoration: underline; }

  /* ── tables ── */
  .table-wrap {
    border: 0.5px solid var(--border);
    border-radius: var(--radius-lg);
    overflow: hidden;
  }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th {
    text-align: left;
    font-family: var(--mono);
    font-size: 10px;
    letter-spacing: .08em;
    text-transform: uppercase;
    color: var(--text-muted);
    padding: 10px 14px;
    background: var(--bg-surface);
    border-bottom: 0.5px solid var(--border);
    font-weight: 400;
  }
  td {
    padding: 10px 14px;
    border-bottom: 0.5px solid var(--border);
    color: var(--text-secondary);
    vertical-align: middle;
    line-height: 1.5;
  }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: rgba(255,255,255,.015); }
  .mono-cell {
    font-family: var(--mono);
    font-size: 12px;
    color: var(--text-primary);
    white-space: nowrap;
  }
  .badge-req {
    font-family: var(--mono);
    font-size: 10px;
    padding: 2px 8px;
    border-radius: 3px;
    background: var(--accent-dim);
    color: var(--accent);
    border: 0.5px solid rgba(0,210,160,.3);
    letter-spacing: .04em;
  }
  .badge-opt {
    font-family: var(--mono);
    font-size: 10px;
    padding: 2px 8px;
    border-radius: 3px;
    background: var(--bg-surface);
    color: var(--text-muted);
    border: 0.5px solid var(--border);
    letter-spacing: .04em;
  }
  .speed-row { display: flex; align-items: center; gap: 6px; }
  .speed-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
  .fast { background: var(--accent); }
  .med  { background: var(--amber); }
  .quality-great { color: var(--accent); font-size: 12px; font-family: var(--mono); }
  .quality-good  { color: var(--text-secondary); font-size: 12px; font-family: var(--mono); }

  /* ── code blocks ── */
  .code-block {
    background: var(--bg-surface);
    border: 0.5px solid var(--border);
    border-radius: var(--radius);
    padding: 1rem 1.1rem;
    font-family: var(--mono);
    font-size: 12px;
    color: #A5D6FF;
    line-height: 1.8;
    overflow-x: auto;
    white-space: pre;
  }
  .code-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--bg-surface);
    border: 0.5px solid var(--border);
    border-bottom: none;
    border-radius: var(--radius) var(--radius) 0 0;
    padding: 7px 12px;
  }
  .code-header-label {
    font-family: var(--mono);
    font-size: 10px;
    color: var(--text-muted);
    letter-spacing: .06em;
    text-transform: uppercase;
  }
  .code-header + .code-block {
    border-radius: 0 0 var(--radius) var(--radius);
    border-top: 0.5px solid var(--border);
  }
  .copy-btn {
    font-family: var(--mono);
    font-size: 10px;
    padding: 3px 9px;
    border-radius: 4px;
    background: transparent;
    border: 0.5px solid var(--border-mid);
    color: var(--text-muted);
    cursor: pointer;
    letter-spacing: .04em;
    transition: all .15s;
  }
  .copy-btn:hover { border-color: var(--accent); color: var(--accent); }
  .copy-btn.copied { border-color: var(--accent); color: var(--accent); }

  /* ── endpoint cards ── */
  .endpoint-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 10px;
  }
  .endpoint-card {
    background: var(--bg-card);
    border: 0.5px solid var(--border);
    border-radius: var(--radius-lg);
    padding: .9rem 1.1rem;
    display: flex;
    align-items: center;
    gap: 12px;
    transition: border-color .2s;
  }
  .endpoint-card:hover { border-color: var(--border-mid); }
  .method-badge {
    font-family: var(--mono);
    font-size: 10px;
    padding: 3px 9px;
    border-radius: 4px;
    letter-spacing: .06em;
    flex-shrink: 0;
  }
  .badge-post { background: var(--purple-dim); color: var(--purple); border: 0.5px solid rgba(139,92,246,.3); }
  .badge-get  { background: var(--accent-dim); color: var(--accent);  border: 0.5px solid rgba(0,210,160,.3);  }
  .endpoint-info h3 {
    font-family: var(--mono);
    font-size: 13px;
    font-weight: 400;
    color: var(--text-primary);
    margin-bottom: 2px;
  }
  .endpoint-info p { font-size: 12px; color: var(--text-secondary); }

  /* ── tip box ── */
  .tip {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    background: var(--amber-dim);
    border: 0.5px solid rgba(245,158,11,.25);
    border-radius: var(--radius);
    padding: .85rem 1rem;
    font-size: 13px;
    color: var(--text-secondary);
    line-height: 1.6;
  }
  .tip-icon { flex-shrink: 0; margin-top: 1px; font-size: 15px; }
  .tip code {
    font-family: var(--mono);
    font-size: 12px;
    background: rgba(245,158,11,.15);
    padding: 1px 5px;
    border-radius: 3px;
    color: var(--amber);
  }

  /* ── deploy section ── */
  .deploy-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 10px;
    margin-bottom: 1rem;
  }
  .deploy-card {
    background: var(--bg-card);
    border: 0.5px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 1.1rem 1.15rem;
    transition: border-color .2s;
  }
  .deploy-card:hover { border-color: var(--border-mid); }
  .deploy-card.featured { border-color: var(--border-bright); background: var(--accent-glow); }
  .deploy-label {
    font-family: var(--mono);
    font-size: 10px;
    letter-spacing: .1em;
    color: var(--accent);
    margin-bottom: .4rem;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .deploy-badge {
    font-size: 9px;
    padding: 1px 6px;
    border-radius: 3px;
    background: var(--accent-dim);
    color: var(--accent);
    border: 0.5px solid rgba(0,210,160,.3);
  }
  .deploy-card h3 { font-size: 14px; font-weight: 500; margin-bottom: .3rem; }
  .deploy-card p  { font-size: 12px; color: var(--text-secondary); line-height: 1.5; }

  /* ── footer ── */
  .footer {
    border-top: 0.5px solid var(--border);
    padding-top: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: .75rem;
  }
  .footer-text {
    font-family: var(--mono);
    font-size: 11px;
    color: var(--text-muted);
    letter-spacing: .05em;
  }
  .footer-links { display: flex; gap: 1rem; }
  .footer-links a {
    font-family: var(--mono);
    font-size: 11px;
    color: var(--text-muted);
    text-decoration: none;
    letter-spacing: .04em;
  }
  .footer-links a:hover { color: var(--accent); }

  /* ── robot ascii art ── */
  .robot-ascii {
    font-family: var(--mono);
    font-size: 11px;
    color: var(--text-muted);
    line-height: 1.4;
    white-space: pre;
    padding: 1rem 1.25rem;
    background: var(--bg-card);
    border: 0.5px solid var(--border);
    border-radius: var(--radius-lg);
    margin-bottom: 2.5rem;
    overflow: hidden;
  }

  /* ── inline code ── */
  .ic {
    font-family: var(--mono);
    font-size: 12px;
    background: var(--bg-surface);
    border: 0.5px solid var(--border);
    padding: 1px 6px;
    border-radius: 3px;
    color: var(--accent);
  }

  @media (max-width: 500px) {
    .topbar-links { display: none; }
    .hero-title { font-size: 26px; }
  }
`;

const WEBHOOK_CURL = `curl -X POST https://wpsent.xyz/webhooks \\
  -H "x-client-id: YOUR_CLIENT_ID" \\
  -H "x-api-key: YOUR_SECRET_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://your-app.vercel.app/api/webhook?key=SECRET",
    "method": "POST",
    "label": "AI Bot"
  }'`;

const SYSTEM_PROMPT_EXAMPLE = `# Customer support bot
SYSTEM_PROMPT=You are a support agent for Acme Corp. Be concise.

# Fun assistant
SYSTEM_PROMPT=You are a witty assistant. Use emojis and make people smile!`;

const LOCAL_DEV = `cp .env.example .env.local
npm install
npm run dev
# Then expose locally:
npx ngrok http 3000`;

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button className={`copy-btn${copied ? " copied" : ""}`} onClick={handle}>
      {copied ? "COPIED" : "COPY"}
    </button>
  );
}

function SectionHead({ label }) {
  return (
    <div className="section-head">
      <span className="section-tag">{label}</span>
      <div className="section-line" />
    </div>
  );
}

export default function Home() {
  return (
    <>
      <style>{STYLES}</style>

      <div className="page">

        {/* ── top bar ── */}
        <div className="topbar">
          <div className="topbar-brand">
            <div className="status-dot" />
            <span>WPSENT</span>
            <span>/</span>
            <span style={{ color: "var(--accent)" }}>AI_BOT</span>
          </div>
          <div className="topbar-links">
            <a href="/api/health">/api/health</a>
            <a href="https://wpsent.xyz" target="_blank" rel="noreferrer">wpsent.xyz ↗</a>
            <a href="https://console.groq.com" target="_blank" rel="noreferrer">groq ↗</a>
          </div>
        </div>

        {/* ── robot ascii ── */}
        <div className="robot-ascii">{
`  ┌─────────────────────────────────────────────────┐
  │  ┌───┐  ╔═╗╔═╗╔╦╗  ╔╗ ╔═╗╔╦╗  ┌─┐╦  ┌─┐      │
  │  │ ◉ │  ╠═╣║║║ ║   ╠╩╗║ ║ ║   ├─┤║  ║       │
  │  │ ◉ │  ╩ ╩╝╚╝ ╩   ╚═╝╚═╝ ╩   ┴ ┴╩═╝└─┘  v1 │
  │  └─┬─┘                                         │
  │    │   Serverless WhatsApp AI · Groq · WPSent  │
  └────┴────────────────────────────────────────────┘`}
        </div>

        {/* ── hero ── */}
        <div className="hero">
          <div className="hero-eyebrow">Serverless WhatsApp AI</div>
          <h1 className="hero-title">
            <span className="accent">WPSent</span>{" "}
            <span className="dim">×</span>{" "}
            <span className="accent">Groq</span>
            <br />
            <span style={{ fontSize: "0.6em", color: "var(--text-secondary)", letterSpacing: ".02em" }}>
              deploy in minutes
            </span>
          </h1>
          <p className="hero-desc">
            A serverless WhatsApp AI bot that uses WPSent as the WhatsApp bridge
            and Groq for fast LLM responses. Deploy to Vercel or Netlify — no
            servers, no containers.
          </p>
          <div className="hero-chips">
            <span className="chip green">● ONLINE</span>
            <span className="chip">SERVERLESS</span>
            <span className="chip">NEXT.JS</span>
            <span className="chip">LLAMA-3 / MIXTRAL</span>
            <span className="chip">WEBHOOK-DRIVEN</span>
          </div>
        </div>

        {/* ── how it works ── */}
        <div className="section">
          <SectionHead label="How it works" />
          <div className="flow">
            <div className="flow-inner">
              {[
                { icon: "📱", label: "WhatsApp\nUser", bright: false },
                null,
                { icon: "🔗", label: "WPSent\nBridge", bright: false },
                null,
                { icon: "⚡", label: "/api/\nwebhook", bright: true },
                null,
                { icon: "🧠", label: "Groq\nAI", bright: false },
                null,
                { icon: "✅", label: "Reply\nDelivered", bright: true },
              ].map((item, i) =>
                item === null ? (
                  <div key={i} className="flow-arrow">──▶</div>
                ) : (
                  <div key={i} className="flow-node">
                    <div className={`flow-icon-wrap${item.bright ? " accent-node" : ""}`}>
                      {item.icon}
                    </div>
                    <div className={`flow-label${item.bright ? " bright" : ""}`}>
                      {item.label}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* ── setup steps ── */}
        <div className="section">
          <SectionHead label="Setup" />
          <div className="step-grid">
            <div className="step-card">
              <div className="step-num">// STEP 01</div>
              <h3>WPSent credentials</h3>
              <p>
                Go to <a href="https://wpsent.xyz" target="_blank" rel="noreferrer">wpsent.xyz</a>,
                sign in, scan the WhatsApp QR code, then copy your{" "}
                <strong style={{ fontWeight: 500 }}>Client ID</strong> and{" "}
                <strong style={{ fontWeight: 500 }}>Secret Key</strong>.
              </p>
            </div>
            <div className="step-card">
              <div className="step-num">// STEP 02</div>
              <h3>Groq API key</h3>
              <p>
                Create a free account at{" "}
                <a href="https://console.groq.com" target="_blank" rel="noreferrer">console.groq.com</a>{" "}
                and generate an API key to unlock fast LLM inference.
              </p>
            </div>
            <div className="step-card">
              <div className="step-num">// STEP 03</div>
              <h3>Register webhook</h3>
              <p>
                Deploy, set your env vars, then POST to{" "}
                <span className="ic">wpsent.xyz/webhooks</span> to
                register your endpoint as the message receiver.
              </p>
            </div>
          </div>
        </div>

        {/* ── deploy ── */}
        <div className="section">
          <SectionHead label="Deploy" />
          <div className="deploy-grid">
            <div className="deploy-card featured">
              <div className="deploy-label">
                OPTION A <span className="deploy-badge">RECOMMENDED</span>
              </div>
              <h3>Vercel</h3>
              <p>
                Push to GitHub, import in Vercel, add env vars in the
                dashboard. Webhook URL:{" "}
                <span className="ic">your-project.vercel.app/api/webhook</span>
              </p>
            </div>
            <div className="deploy-card">
              <div className="deploy-label">OPTION B</div>
              <h3>Netlify</h3>
              <p>
                Install <span className="ic">@netlify/plugin-nextjs</span>,
                run <span className="ic">netlify deploy --build --prod</span>. Add
                env vars under Site Settings.
              </p>
            </div>
          </div>

          <div className="code-header">
            <span className="code-header-label">BASH — Register webhook</span>
            <CopyButton text={WEBHOOK_CURL} />
          </div>
          <div className="code-block">{WEBHOOK_CURL}</div>
        </div>

        {/* ── env vars ── */}
        <div className="section">
          <SectionHead label="Environment variables" />
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Variable</th>
                  <th>Required</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "WPSENT_CLIENT_ID", req: true,  desc: "From wpsent.xyz dashboard" },
                  { name: "WPSENT_API_KEY",   req: true,  desc: "From wpsent.xyz dashboard" },
                  { name: "GROQ_API_KEY",     req: true,  desc: "From console.groq.com" },
                  { name: "WPSENT_BASE_URL",  req: false, desc: "Default: https://wpsent.xyz" },
                  { name: "GROQ_MODEL",       req: false, desc: "Default: llama3-8b-8192" },
                  { name: "SYSTEM_PROMPT",    req: false, desc: "Bot personality and instructions" },
                  { name: "WEBHOOK_SECRET",   req: false, desc: "Matched via ?key= query param for auth" },
                ].map((v) => (
                  <tr key={v.name}>
                    <td className="mono-cell">{v.name}</td>
                    <td>
                      {v.req
                        ? <span className="badge-req">REQUIRED</span>
                        : <span className="badge-opt">OPTIONAL</span>}
                    </td>
                    <td>{v.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── models ── */}
        <div className="section">
          <SectionHead label="Groq models" />
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Model</th>
                  <th>Speed</th>
                  <th>Quality</th>
                  <th>Context</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { model: "llama3-8b-8192",     speed: "fast", quality: "Good",  ctx: "8 192" },
                  { model: "llama3-70b-8192",    speed: "med",  quality: "Great", ctx: "8 192" },
                  { model: "mixtral-8x7b-32768", speed: "fast", quality: "Great", ctx: "32 768" },
                  { model: "gemma2-9b-it",       speed: "fast", quality: "Good",  ctx: "8 192" },
                ].map((m) => (
                  <tr key={m.model}>
                    <td className="mono-cell">{m.model}</td>
                    <td>
                      <div className="speed-row">
                        <span className={`speed-dot ${m.speed}`} />
                        <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--text-secondary)" }}>
                          {m.speed === "fast" ? "Fast" : "Medium"}
                        </span>
                      </div>
                    </td>
                    <td className={m.quality === "Great" ? "quality-great" : "quality-good"}>
                      {m.quality}
                    </td>
                    <td style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--text-muted)" }}>
                      {m.ctx} tok
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── endpoints ── */}
        <div className="section">
          <SectionHead label="API endpoints" />
          <div className="endpoint-grid">
            <div className="endpoint-card">
              <span className="method-badge badge-post">POST</span>
              <div className="endpoint-info">
                <h3>/api/webhook</h3>
                <p>WPSent webhook receiver</p>
              </div>
            </div>
            <div className="endpoint-card">
              <span className="method-badge badge-get">GET</span>
              <div className="endpoint-info">
                <h3>/api/health</h3>
                <p>Config & deployment status</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── system prompt ── */}
        <div className="section">
          <SectionHead label="Customise your bot" />
          <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: ".75rem" }}>
            Edit <span className="ic">SYSTEM_PROMPT</span> to shape the AI's personality and scope:
          </p>
          <div className="code-header">
            <span className="code-header-label">.env.local — example prompts</span>
            <CopyButton text={SYSTEM_PROMPT_EXAMPLE} />
          </div>
          <div className="code-block">{SYSTEM_PROMPT_EXAMPLE}</div>
        </div>

        {/* ── local dev ── */}
        <div className="section">
          <SectionHead label="Local development" />
          <div className="code-header">
            <span className="code-header-label">BASH — dev setup</span>
            <CopyButton text={LOCAL_DEV} />
          </div>
          <div className="code-block">{LOCAL_DEV}</div>
          <div style={{ marginTop: "1rem" }}>
            <div className="tip">
              <span className="tip-icon">⚡</span>
              <span>
                Use <code>npx ngrok http 3000</code> to get a public URL during
                local dev — paste it as your WPSent webhook URL to test
                the full message flow on your machine before deploying.
              </span>
            </div>
          </div>
        </div>

        {/* ── footer ── */}
        <div className="footer">
          <span className="footer-text">© WPSENT AI BOT — MIT LICENSE</span>
          <div className="footer-links">
            <a href="/api/health">/api/health</a>
            <a href="https://wpsent.xyz" target="_blank" rel="noreferrer">wpsent.xyz</a>
            <a href="https://console.groq.com" target="_blank" rel="noreferrer">groq</a>
          </div>
        </div>

      </div>
    </>
  );
}
