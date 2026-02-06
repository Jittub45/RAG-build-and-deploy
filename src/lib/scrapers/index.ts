export { scrapeErgastData } from "./ergast";
export { scrapeWikipediaData, scrapeWikipediaSearch } from "./wikipedia";
export { scrapeFormula1News, createHistoricalFacts } from "./news";
export { scrapeRSSFeeds, RSS_FEEDS } from "./rss-feeds";
export { scrapeOpenF1Data } from "./openf1";
export { scrapeJolpicaData } from "./jolpica";

import { F1Document } from "@/types";
import { scrapeErgastData } from "./ergast";
import { scrapeWikipediaData } from "./wikipedia";
import { scrapeFormula1News, createHistoricalFacts } from "./news";
import { scrapeRSSFeeds } from "./rss-feeds";
import { scrapeOpenF1Data } from "./openf1";
import { scrapeJolpicaData } from "./jolpica";

/**
 * 10 Data Sources:
 * 1. Ergast API - Historical F1 data
 * 2. Jolpica API - Modern Ergast alternative with latest data
 * 3. OpenF1 API - Real-time telemetry and session data
 * 4. Wikipedia - Detailed articles
 * 5. Autosport RSS - Latest news
 * 6. Motorsport.com RSS - Latest news
 * 7. RaceFans RSS - Latest news
 * 8. RacingNews365 RSS - Latest news
 * 9. The Race RSS - Latest news
 * 10. PlanetF1 RSS - Latest news
 * + Historical Facts (bonus)
 */

/**
 * Scrape all F1 data sources and return combined documents
 */
export async function scrapeAllSources(): Promise<F1Document[]> {
  const allDocuments: F1Document[] = [];

  console.log("🏎️  Starting comprehensive F1 data scraping from 10+ sources...\n");
  console.log("=".repeat(60) + "\n");

  // 1. Scrape Ergast API (race results, standings, drivers, teams, circuits)
  console.log("📊 [1/7] Scraping Ergast API...");
  try {
    const ergastDocs = await scrapeErgastData("current");
    allDocuments.push(...ergastDocs);
    console.log(`   ✓ Ergast: ${ergastDocs.length} documents\n`);
  } catch (error) {
    console.error("   ✗ Ergast scraping failed:", error);
  }

  // 2. Scrape Jolpica API (modern Ergast alternative)
  console.log("📈 [2/7] Scraping Jolpica F1 API...");
  try {
    const jolpicaDocs = await scrapeJolpicaData();
    allDocuments.push(...jolpicaDocs);
    console.log(`   ✓ Jolpica: ${jolpicaDocs.length} documents\n`);
  } catch (error) {
    console.error("   ✗ Jolpica scraping failed:", error);
  }

  // 3. Scrape OpenF1 API (real-time data)
  console.log("⚡ [3/7] Scraping OpenF1 API...");
  try {
    const openf1Docs = await scrapeOpenF1Data();
    allDocuments.push(...openf1Docs);
    console.log(`   ✓ OpenF1: ${openf1Docs.length} documents\n`);
  } catch (error) {
    console.error("   ✗ OpenF1 scraping failed:", error);
  }

  // 4. Scrape Wikipedia (detailed team/driver info)
  console.log("📚 [4/7] Scraping Wikipedia...");
  try {
    const wikiDocs = await scrapeWikipediaData();
    allDocuments.push(...wikiDocs);
    console.log(`   ✓ Wikipedia: ${wikiDocs.length} documents\n`);
  } catch (error) {
    console.error("   ✗ Wikipedia scraping failed:", error);
  }

  // 5. Scrape RSS Feeds (6 news sources)
  console.log("📰 [5/7] Scraping RSS News Feeds (6 sources)...");
  try {
    const rssDocs = await scrapeRSSFeeds();
    allDocuments.push(...rssDocs);
    console.log(`   ✓ RSS Feeds: ${rssDocs.length} documents\n`);
  } catch (error) {
    console.error("   ✗ RSS scraping failed:", error);
  }

  // 6. Scrape F1 News (curated content)
  console.log("🗞️  [6/7] Adding curated F1 content...");
  try {
    const newsDocs = await scrapeFormula1News();
    allDocuments.push(...newsDocs);
    console.log(`   ✓ Curated: ${newsDocs.length} documents\n`);
  } catch (error) {
    console.error("   ✗ News scraping failed:", error);
  }

  // 7. Add historical facts
  console.log("🏆 [7/7] Adding historical facts...");
  const historicalDocs = createHistoricalFacts();
  allDocuments.push(...historicalDocs);
  console.log(`   ✓ Historical: ${historicalDocs.length} documents\n`);

  console.log("=".repeat(60));
  console.log(`\n🏁 Scraping Complete!`);
  console.log(`   Total documents collected: ${allDocuments.length}`);
  console.log(`   Sources: Ergast, Jolpica, OpenF1, Wikipedia, 6x RSS Feeds, Historical\n`);

  return allDocuments;
}
