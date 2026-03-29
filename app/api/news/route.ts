import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface NewsItem {
  id: string;
  title: string;
  link: string;
  sourceUrl: string;
  sourceName: string;
  date: string;
  category: string;
  summary: string;
}

function extractSourceName(block: string): string {
  const m = block.match(/<source[^>]*>([\s\S]*?)<\/source>/);
  if (m) return m[1].replace(/<[^>]+>/g, "").trim();
  return "Unknown Source";
}

async function fetchRSS(url: string, category: string): Promise<NewsItem[]> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; NewsBot/1.0)",
        Accept: "application/rss+xml, application/xml, text/xml",
      },
      cache: "no-store",
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();

    const rawItems: {
      title: string;
      googleLink: string;
      sourceName: string;
      date: string;
    }[] = [];

    const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
    let match;

    while ((match = itemRegex.exec(text)) !== null) {
      const block = match[1];

      const titleMatch =
        block.match(/<title[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/title>/) ||
        block.match(/<title[^>]*>([\s\S]*?)<\/title>/);

      const linkMatch =
        block.match(/<link[^>]*>([\s\S]*?)<\/link>/) ||
        block.match(/<link\s+href="([^"]+)"/);

      const dateMatch = block.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/);

      if (titleMatch) {
        const title = titleMatch[1].replace(/<[^>]+>/g, "").trim();
        const googleLink = linkMatch ? linkMatch[1].trim() : "#";
        const date = dateMatch ? dateMatch[1].trim() : new Date().toUTCString();
        const sourceName = extractSourceName(block);

        if (title && title.length > 5) {
          rawItems.push({ title, googleLink, sourceName, date });
        }
      }
    }

    // ✅ No scraping — just return the data, Gemini reads the link later
    return rawItems.slice(0, 6).map((item, i) => ({
      id: Buffer.from(item.title + i).toString("base64").slice(0, 16),
      title: item.title,
      link: item.googleLink,
      sourceUrl: item.googleLink,
      sourceName: item.sourceName,
      date: item.date,
      category,
      summary: "",              // Gemini fills this context at generate time
    }));
  } catch (err) {
    console.error(`RSS fetch failed for ${category}:`, err);
    return [];
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const customQuery = searchParams.get("q");

  let feeds: { url: string; category: string }[];

  if (customQuery) {
    const topics = customQuery
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 6);

    feeds = topics.map((topic) => ({
      url: `https://news.google.com/rss/search?q=${encodeURIComponent(topic)}&hl=en-IN&gl=IN&ceid=IN:en`,
      category: topic,
    }));
  } else {
    feeds = [
      { url: "https://news.google.com/rss/search?q=Tamil+Nadu&hl=en-IN&gl=IN&ceid=IN:en", category: "Tamil Nadu" },
      { url: "https://news.google.com/rss/search?q=Chennai&hl=en-IN&gl=IN&ceid=IN:en", category: "Chennai" },
      { url: "https://news.google.com/rss/search?q=India+Politics&hl=en-IN&gl=IN&ceid=IN:en", category: "India Politics" },
      { url: "https://news.google.com/rss/search?q=IPL+2026&hl=en-IN&gl=IN&ceid=IN:en", category: "IPL" },
    ];
  }

  const results = await Promise.allSettled(
    feeds.map((f) => fetchRSS(f.url, f.category))
  );

  const allNews: NewsItem[] = [];
  results.forEach((r) => {
    if (r.status === "fulfilled") allNews.push(...r.value);
  });

  const seen = new Set<string>();
  const unique = allNews.filter((item) => {
    const key = item.title.slice(0, 40).toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return NextResponse.json(
    { news: unique, total: unique.length },
    { headers: { "Cache-Control": "no-store" } }
  );
}