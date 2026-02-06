export { scrapeErgastData } from "./ergast";
export { scrapeWikipediaData, scrapeWikipediaSearch } from "./wikipedia";
export { scrapeFormula1News, createHistoricalFacts } from "./news";

import { F1Document } from "@/types";
import { scrapeErgastData } from "./ergast";
import { scrapeWikipediaData } from "./wikipedia";
import { scrapeFormula1News, createHistoricalFacts } from "./news";

/**
 * Scrape all F1 data sources and return combined documents
 */
export async function scrapeAllSources(): Promise<F1Document[]> {
  const allDocuments: F1Document[] = [];

  console.log("Starting comprehensive F1 data scraping...\n");

  // 1. Scrape Ergast API (race results, standings, drivers, teams, circuits)
  console.log("=== Scraping Ergast API ===");
  try {
    const ergastDocs = await scrapeErgastData("current");
    allDocuments.push(...ergastDocs);
    console.log(`✓ Ergast: ${ergastDocs.length} documents\n`);
  } catch (error) {
    console.error("✗ Ergast scraping failed:", error);
  }

  // 2. Scrape Wikipedia (detailed team/driver info)
  console.log("=== Scraping Wikipedia ===");
  try {
    const wikiDocs = await scrapeWikipediaData();
    allDocuments.push(...wikiDocs);
    console.log(`✓ Wikipedia: ${wikiDocs.length} documents\n`);
  } catch (error) {
    console.error("✗ Wikipedia scraping failed:", error);
  }

  // 3. Scrape F1 News
  console.log("=== Scraping F1 News ===");
  try {
    const newsDocs = await scrapeFormula1News();
    allDocuments.push(...newsDocs);
    console.log(`✓ News: ${newsDocs.length} documents\n`);
  } catch (error) {
    console.error("✗ News scraping failed:", error);
  }

  // 4. Add historical facts
  console.log("=== Adding Historical Facts ===");
  const historicalDocs = createHistoricalFacts();
  allDocuments.push(...historicalDocs);
  console.log(`✓ Historical: ${historicalDocs.length} documents\n`);

  console.log("=== Scraping Complete ===");
  console.log(`Total documents collected: ${allDocuments.length}`);

  return allDocuments;
}
