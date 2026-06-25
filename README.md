# 🤖 WPSent AI Bot

A serverless WhatsApp AI bot that uses **WPSent** as the WhatsApp bridge and **Groq** for fast AI responses. Deployable to **Vercel** or **Netlify** in minutes.

---

## How It Works

```
WhatsApp User
     │ sends message
     ▼
  WPSent (wpsent.xyz)
     │ fires webhook POST
     ▼
  /api/webhook  ← your deployed app
     │ sends message to
     ▼
  Groq AI (llama3 / mixtral)
     │ returns AI reply
     ▼
  WPSent /send API
     │ delivers reply
     ▼
WhatsApp User ✅
```

---

## Setup

### 1. Get WPSent Credentials

1. Go to [wpsent.xyz](https://wpsent.xyz) and sign in / register
2. Scan the WhatsApp QR code with your phone
3. Copy your **Client ID** and **Secret Key** from the dashboard

### 2. Get a Groq API Key

1. Go to [console.groq.com](https://console.groq.com)
2. Create a free account and generate an API key

### 3. Deploy

#### Option A — Vercel (recommended)

```bash
# 1. Fork/clone this repo
git clone <your-repo-url>
cd wpsent-ai-bot

# 2. Install Vercel CLI
npm i -g vercel

# 3. Deploy
vercel

# 4. Set environment variables (or use Vercel dashboard)
vercel env add WPSENT_CLIENT_ID
vercel env add WPSENT_API_KEY
vercel env add GROQ_API_KEY
vercel env add SYSTEM_PROMPT
vercel env add GROQ_MODEL

# 5. Redeploy after setting env vars
vercel --prod
```

Your webhook URL will be: `https://your-project.vercel.app/api/webhook?key=Your Webhook Secret`

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/arisu-yamabuki/wpsent-bot)   
#### Option B — Netlify

```bash
# 1. Install Netlify CLI
npm i -g netlify-cli

# 2. Install the Next.js plugin
npm install @netlify/plugin-nextjs

# 3. Deploy
netlify deploy --build --prod
```

Set env vars in **Netlify → Site Settings → Environment Variables**.

Your webhook URL: `https://your-site.netlify.app/api/webhook?key=Your ENV Secret KEY`

### 4. Register the Webhook in WPSent

Using curl or any REST client:

```bash
curl -X POST https://wpsent.xyz/webhooks \
  -H "x-client-id: YOUR_CLIENT_ID" \
  -H "x-api-key: YOUR_SECRET_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-app.vercel.app/api/webhook?key=Your ENV Secret KEY",
    "method": "POST",
    "label": "AI Bot"
  }'
```

---

## Environment Variables

| Variable           | Required | Description                                              |
|--------------------|----------|----------------------------------------------------------|
| `WPSENT_CLIENT_ID` | ✅        | From wpsent.xyz dashboard                               |
| `WPSENT_API_KEY`   | ✅        | From wpsent.xyz dashboard                               |
| `GROQ_API_KEY`     | ✅        | From console.groq.com                                   |
| `WPSENT_BASE_URL`  | No       | Default: `https://wpsent.xyz`                           |
| `GROQ_MODEL`       | No       | Default: `llama3-8b-8192` (see models below)            |
| `SYSTEM_PROMPT`    | No       | Bot personality/instructions                             |
| `WEBHOOK_SECRET`   | No       | Extra security: match in WPSent webhook header with query ?key=         |

### Available Groq Models

| Model                  | Speed  | Quality |
|------------------------|--------|---------|
| `llama3-8b-8192`       | Fast   | Good    |
| `llama3-70b-8192`      | Medium | Great   |
| `mixtral-8x7b-32768`   | Fast   | Great   |
| `gemma2-9b-it`         | Fast   | Good    |

---

## Customize Your Bot

Edit `SYSTEM_PROMPT` to change the AI's personality:

```
# Customer support bot
SYSTEM_PROMPT=You are a customer support agent for Acme Corp. Be helpful, professional, and concise. Only answer questions related to our products.

# Fun assistant
SYSTEM_PROMPT=You are a witty and fun assistant. Keep replies short, use emojis, and make people smile!
```

---

## API Endpoints

| Endpoint       | Method | Description                        |
|----------------|--------|------------------------------------|
| `/api/webhook` | POST   | WPSent webhook receiver            |
| `/api/health`  | GET    | Check config & deployment status   |

---

## Local Development

```bash
cp .env.example .env.local
# Fill in your credentials in .env.local

npm install
npm run dev
# App runs at http://localhost:3000

# Test the webhook locally with ngrok:
npx ngrok http 3000
# Use the ngrok URL as your WPSent webhook
```
