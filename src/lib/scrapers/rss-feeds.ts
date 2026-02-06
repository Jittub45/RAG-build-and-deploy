import { v4 as uuidv4 } from "uuid";
import { F1Document } from "@/types";

interface RSSItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  source: string;
}

/**
 * Parse RSS XML feed
 */
function parseRSSXML(xml: string, source: string): RSSItem[] {
  const items: RSSItem[] = [];
  
  // Simple regex-based RSS parsing (works for most feeds)
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  const titleRegex = /<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/i;
  const linkRegex = /<link>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/link>/i;
  const descRegex = /<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i;
  const pubDateRegex = /<pubDate>(.*?)<\/pubDate>/i;

  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const itemContent = match[1];
    
    const title = titleRegex.exec(itemContent)?.[1]?.trim() || "";
    const link = linkRegex.exec(itemContent)?.[1]?.trim() || "";
    const description = descRegex.exec(itemContent)?.[1]?.trim() || "";
    const pubDate = pubDateRegex.exec(itemContent)?.[1]?.trim() || new Date().toISOString();

    if (title && description) {
      items.push({
        title: cleanHTML(title),
        link,
        description: cleanHTML(description),
        pubDate,
        source,
      });
    }
  }

  return items;
}

/**
 * Clean HTML tags from text
 */
function cleanHTML(text: string): string {
  return text
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Fetch RSS feed with timeout
 */
async function fetchRSSFeed(url: string, source: string): Promise<RSSItem[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; F1RagBot/1.0)",
        "Accept": "application/rss+xml, application/xml, text/xml",
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.log(`  ⚠ ${source}: HTTP ${response.status}`);
      return [];
    }

    const xml = await response.text();
    return parseRSSXML(xml, source);
  } catch (error) {
    console.log(`  ⚠ ${source}: Failed to fetch`);
    return [];
  }
}

/**
 * F1 RSS Feed Sources
 */
const RSS_FEEDS = [
  {
    url: "https://www.autosport.com/rss/f1/news/",
    source: "Autosport",
    category: "news",
  },
  {
    url: "https://www.motorsport.com/rss/f1/news/",
    source: "Motorsport.com",
    category: "news",
  },
  {
    url: "https://www.racefans.net/feed/",
    source: "RaceFans",
    category: "news",
  },
  {
    url: "https://racingnews365.com/feed",
    source: "RacingNews365",
    category: "news",
  },
  {
    url: "https://the-race.com/feed/",
    source: "The Race",
    category: "news",
  },
  {
    url: "https://www.planetf1.com/feed/",
    source: "PlanetF1",
    category: "news",
  },
];

/**
 * Extract F1 entities from text
 */
function extractEntities(text: string): string[] {
  const drivers = [
    "Verstappen", "Hamilton", "Leclerc", "Norris", "Sainz", "Russell",
    "Piastri", "Perez", "Alonso", "Stroll", "Ocon", "Gasly", "Bottas",
    "Zhou", "Magnussen", "Hulkenberg", "Albon", "Colapinto", "Tsunoda", 
    "Lawson", "Antonelli", "Bearman", "Doohan"
  ];

  const teams = [
    "Red Bull", "Ferrari", "Mercedes", "McLaren", "Aston Martin",
    "Alpine", "Williams", "Sauber", "RB", "Haas", "Racing Bulls"
  ];

  const found: string[] = [];
  const lowerText = text.toLowerCase();

  for (const driver of drivers) {
    if (lowerText.includes(driver.toLowerCase())) {
      found.push(driver);
    }
  }

  for (const team of teams) {
    if (lowerText.includes(team.toLowerCase())) {
      found.push(team);
    }
  }

  return [...new Set(found)];
}

/**
 * Convert RSS item to F1Document
 */
function rssItemToDocument(item: RSSItem): F1Document {
  const fullContent = `${item.title}\n\n${item.description}`;
  const entities = extractEntities(fullContent);

  return {
    id: uuidv4(),
    content: fullContent,
    metadata: {
      source: item.source.toLowerCase().replace(/\s+/g, "-"),
      type: "news",
      date: new Date(item.pubDate).toISOString().split("T")[0],
      title: item.title,
      entities,
      url: item.link,
    },
  };
}

/**
 * Scrape all RSS feeds for latest F1 news
 */
export async function scrapeRSSFeeds(): Promise<F1Document[]> {
  const allDocuments: F1Document[] = [];

  console.log("Fetching from RSS feeds...\n");

  for (const feed of RSS_FEEDS) {
    console.log(`  Fetching: ${feed.source}...`);
    const items = await fetchRSSFeed(feed.url, feed.source);
    
    // Take latest 10 articles per source
    const docs = items.slice(0, 10).map(rssItemToDocument);
    allDocuments.push(...docs);
    console.log(`  ✓ ${feed.source}: ${docs.length} articles`);
  }

  return allDocuments;
}

export { RSS_FEEDS };
