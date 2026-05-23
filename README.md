# RoomMind — core loop (zero-budget v1)

Upload a room, mark what to keep vs change, get an AI-generated, budget-aware
plan with no-buy alternatives and free local search links. The AI brain runs on
Groq's free tier (Llama 3.3 70B) — no credit card, no cost.

## What you need (all free)

1. **Node.js 18+** installed (you likely already have it). Check: `node --version`.
2. A **free Groq API key** — sign up at https://console.groq.com, go to
   "API Keys", create one. No card required.

## Setup (5 minutes)

1. Unzip this folder somewhere, open a terminal in it.
2. Install dependencies:
   ```
   npm install
   ```
3. Create a file named `.env.local` (copy from `.env.example`) and paste your key:
   ```
   GROQ_API_KEY=gsk_your_real_key_here
   ```
4. Start it:
   ```
   npm run dev
   ```
5. Open http://localhost:3000 in your browser. Upload a room, mark items,
   click "Build my plan".

## What's happening

- `app/page.js` — the screen you interact with.
- `app/api/plan/route.js` — sends your keep/change choices to Llama via Groq
  and gets a structured plan back. Also attaches free Amazon/Kijiji/Google
  search links per item (no scraping, never breaks).
- The photo is just shown back to you for now — item detection from the photo
  is a later feature. For v1 you check off items yourself.

## When you're ready to put it online (also free)

1. Push this folder to a GitHub repo.
2. Go to https://vercel.com, import the repo, add `GROQ_API_KEY` as an
   environment variable in the project settings, deploy. You get a public URL.

## What's deliberately NOT here yet (and why)

- **AI render** — costs money or needs your own GPU. Add on day two.
- **Login / saved gallery** — add with Supabase once the loop feels right.
- **Exact-product image match & live local inventory** — hard/expensive even
  for big companies. The free search-link version covers most of the value.

## Upgrading the AI later

In `app/api/plan/route.js`, the model is `llama-3.3-70b-versatile` on Groq.
To switch to a paid, more polished model later, that's roughly a one-line
change plus a different API key — nothing else in the app changes.
