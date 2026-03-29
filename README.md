# AI Instagram Post Creator

Turn Tamil Nadu, Chennai, India Politics & IPL news into viral Instagram posts using AI.

## Features

- 📰 Real-time news from Google News RSS (Tamil Nadu, Chennai, India Politics, IPL)
- 🤖 AI-generated hook, caption, and hashtags using GPT-4o-mini
- 🖼️ 1080×1350 PNG image with bold yellow hook on black background
- 📋 Copy caption + hashtags to clipboard
- 💾 Download image and text files

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your OpenAI API key:

```
OPENAI_API_KEY=sk-...your-key-here...
```

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
ai-insta-creator/
├── app/
│   ├── api/
│   │   ├── news/route.ts      # Fetches Google News RSS feeds
│   │   ├── generate/route.ts  # OpenAI GPT-4o-mini content generation
│   │   └── image/route.ts     # Sharp-based 1080×1350 PNG generation
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx               # Main UI
├── .env.example
├── next.config.js
├── tailwind.config.js
└── package.json
```

## API Routes

### `GET /api/news`
Returns latest news from 4 categories.

```json
{
  "news": [
    {
      "id": "abc123",
      "title": "News headline here",
      "link": "https://...",
      "date": "Sat, 28 Mar 2026 ...",
      "category": "Tamil Nadu"
    }
  ],
  "total": 24
}
```

### `POST /api/generate`
```json
// Request
{ "title": "News headline", "category": "IPL" }

// Response
{
  "hook": "CHENNAI SUPER KINGS SHOCK THE WORLD",
  "caption": "Caption text here...",
  "hashtags": "#IPL2025 #CSK #Chennai ..."
}
```

### `POST /api/image`
```json
// Request
{ "hook": "HOOK TEXT", "caption": "...", "hashtags": "...", "category": "IPL" }

// Response: PNG binary (1080×1350)
```

## Notes

- News is cached for 5 minutes per Next.js fetch revalidation
- Image generation uses `sharp` to convert SVG → PNG (no font embedding needed)
- All styling via Tailwind CSS with custom dark theme
