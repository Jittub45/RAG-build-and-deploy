export { scrapeWikipediaData, scrapeWikipediaSearch } from "./wikipedia";
export { scrapeFormula1News, createHistoricalFacts } from "./news";
export { scrapeRSSFeeds, RSS_FEEDS } from "./rss-feeds";
export { scrapeOpenF1Data } from "./openf1";
export { scrapeJolpicaData } from "./jolpica";

import { F1Document } from "@/types";
import { scrapeWikipediaData } from "./wikipedia";
import { createHistoricalFacts } from "./news";
import { scrapeRSSFeeds } from "./rss-feeds";
import { scrapeOpenF1Data } from "./openf1";
import { scrapeJolpicaData } from "./jolpica";

/**
 * 5 Data Sources:
 * 1. Jolpica API - Current season data (standings, schedule)
 * 2. OpenF1 API - Real-time session data
 * 3. Wikipedia - Detailed team/driver articles
 * 4. RSS Feeds - Latest F1 news (4 working sources)
 * 5. Historical Facts - Core F1 knowledge
 */

/**
 * Scrape all F1 data sources and return combined documents
 */
export async function scrapeAllSources(): Promise<F1Document[]> {
  const allDocuments: F1Document[] = [];

  console.log("🏎️  Starting F1 data scraping from 5 sources...\n");
  console.log("=".repeat(50) + "\n");

  // 1. Scrape Jolpica API (current standings)
  console.log("📈 [1/5] Scraping Jolpica F1 API...");
  try {
    const jolpicaDocs = await scrapeJolpicaData();
    allDocuments.push(...jolpicaDocs);
    console.log(`   ✓ Jolpica: ${jolpicaDocs.length} documents\n`);
  } catch (error) {
    console.error("   ✗ Jolpica scraping failed:", error);
  }

  // 2. Scrape OpenF1 API (real-time data)
  console.log("⚡ [2/5] Scraping OpenF1 API...");
  try {
    const openf1Docs = await scrapeOpenF1Data();
    allDocuments.push(...openf1Docs);
    console.log(`   ✓ OpenF1: ${openf1Docs.length} documents\n`);
  } catch (error) {
    console.error("   ✗ OpenF1 scraping failed:", error);
  }

  // 3. Scrape Wikipedia (detailed team/driver info)
  console.log("📚 [3/5] Scraping Wikipedia...");
  try {
    const wikiDocs = await scrapeWikipediaData();
    allDocuments.push(...wikiDocs);
    console.log(`   ✓ Wikipedia: ${wikiDocs.length} documents\n`);
  } catch (error) {
    console.error("   ✗ Wikipedia scraping failed:", error);
  }

  // 4. Scrape RSS Feeds (news sources)
  console.log("📰 [4/5] Scraping RSS News Feeds...");
  try {
    const rssDocs = await scrapeRSSFeeds();
    allDocuments.push(...rssDocs);
    console.log(`   ✓ RSS Feeds: ${rssDocs.length} documents\n`);
  } catch (error) {
    console.error("   ✗ RSS scraping failed:", error);
  }

  // 5. Add historical facts
  console.log("🏆 [5/5] Adding historical facts...");
  const historicalDocs = createHistoricalFacts();
  allDocuments.push(...historicalDocs);
  console.log(`   ✓ Historical: ${historicalDocs.length} documents\n`);

  console.log("=".repeat(50));
  console.log(`\n🏁 Scraping Complete!`);
  console.log(`   Total documents collected: ${allDocuments.length}`);
  console.log(`   Sources: Jolpica, OpenF1, Wikipedia, RSS Feeds, Historical\n`);

  return allDocuments;
}
