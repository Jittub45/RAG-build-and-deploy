import * as cheerio from "cheerio";
import { v4 as uuidv4 } from "uuid";
import { F1Document } from "@/types";

const WIKIPEDIA_API = "https://en.wikipedia.org/w/api.php";

interface WikipediaPage {
  title: string;
  extract: string;
  fullurl: string;
}

/**
 * Fetch Wikipedia page content
 */
async function fetchWikipediaPage(title: string): Promise<WikipediaPage | null> {
  const params = new URLSearchParams({
    action: "query",
    titles: title,
    prop: "extracts|info",
    exintro: "false",
    explaintext: "true",
    inprop: "url",
    format: "json",
    origin: "*",
  });

  const response = await fetch(`${WIKIPEDIA_API}?${params}`);
  const data = await response.json();

  const pages = data.query?.pages;
  if (!pages) return null;

  const pageId = Object.keys(pages)[0];
  if (pageId === "-1") return null;

  return {
    title: pages[pageId].title,
    extract: pages[pageId].extract,
    fullurl: pages[pageId].fullurl,
  };
}

/**
 * Search Wikipedia for F1-related articles
 */
async function searchWikipedia(query: string, limit: number = 10): Promise<string[]> {
  const params = new URLSearchParams({
    action: "opensearch",
    search: query,
    limit: limit.toString(),
    namespace: "0",
    format: "json",
    origin: "*",
  });

  const response = await fetch(`${WIKIPEDIA_API}?${params}`);
  const data = await response.json();

  return data[1] || [];
}

/**
 * Extract key sections from Wikipedia content
 */
function extractSections(content: string, maxLength: number = 2000): string {
  // Split by double newlines (paragraph breaks)
  const paragraphs = content.split("\n\n").filter((p) => p.trim().length > 50);

  let result = "";
  for (const paragraph of paragraphs) {
    if (result.length + paragraph.length > maxLength) break;
    result += paragraph + "\n\n";
  }

  return result.trim();
}

/**
 * Convert Wikipedia page to F1Document
 */
function wikiPageToDocument(
  page: WikipediaPage,
  type: F1Document["metadata"]["type"],
  entities: string[]
): F1Document {
  const content = extractSections(page.extract);

  return {
    id: uuidv4(),
    content,
    metadata: {
      source: "wikipedia",
      type,
      date: new Date().toISOString().split("T")[0],
      title: page.title,
      entities,
      url: page.fullurl,
    },
  };
}

// Predefined F1-related Wikipedia pages to scrape
const F1_WIKIPEDIA_PAGES = [
  // Current teams
  { title: "Red Bull Racing", type: "team_info" as const, entities: ["Red Bull Racing", "Red Bull"] },
  { title: "Scuderia Ferrari", type: "team_info" as const, entities: ["Ferrari", "Scuderia Ferrari"] },
  { title: "Mercedes-AMG Petronas Formula One Team", type: "team_info" as const, entities: ["Mercedes", "Mercedes-AMG"] },
  { title: "McLaren", type: "team_info" as const, entities: ["McLaren"] },
  { title: "Aston Martin in Formula One", type: "team_info" as const, entities: ["Aston Martin"] },
  { title: "Alpine F1 Team", type: "team_info" as const, entities: ["Alpine"] },
  { title: "Williams Racing", type: "team_info" as const, entities: ["Williams"] },
  { title: "Kick Sauber", type: "team_info" as const, entities: ["Sauber", "Kick Sauber"] },
  { title: "Visa Cash App RB", type: "team_info" as const, entities: ["RB", "VCARB", "AlphaTauri"] },
  { title: "Haas F1 Team", type: "team_info" as const, entities: ["Haas"] },

  // Top drivers
  { title: "Max Verstappen", type: "driver_bio" as const, entities: ["Max Verstappen", "Verstappen"] },
  { title: "Lewis Hamilton", type: "driver_bio" as const, entities: ["Lewis Hamilton", "Hamilton"] },
  { title: "Charles Leclerc", type: "driver_bio" as const, entities: ["Charles Leclerc", "Leclerc"] },
  { title: "Lando Norris", type: "driver_bio" as const, entities: ["Lando Norris", "Norris"] },
  { title: "Carlos Sainz Jr.", type: "driver_bio" as const, entities: ["Carlos Sainz", "Sainz"] },
  { title: "George Russell (racing driver)", type: "driver_bio" as const, entities: ["George Russell", "Russell"] },
  { title: "Oscar Piastri", type: "driver_bio" as const, entities: ["Oscar Piastri", "Piastri"] },
  { title: "Sergio Pérez", type: "driver_bio" as const, entities: ["Sergio Perez", "Perez", "Checo"] },
  { title: "Fernando Alonso", type: "driver_bio" as const, entities: ["Fernando Alonso", "Alonso"] },
  { title: "Lance Stroll", type: "driver_bio" as const, entities: ["Lance Stroll", "Stroll"] },

  // F1 General
  { title: "Formula One", type: "regulation" as const, entities: ["Formula 1", "F1"] },
  { title: "Formula One regulations", type: "regulation" as const, entities: ["F1 regulations", "rules"] },
  { title: "Formula One World Championship", type: "historical" as const, entities: ["World Championship"] },
  { title: "List of Formula One World Drivers' Champions", type: "historical" as const, entities: ["World Champions", "drivers championship"] },

  // Famous circuits
  { title: "Circuit de Monaco", type: "circuit" as const, entities: ["Monaco", "Monte Carlo"] },
  { title: "Silverstone Circuit", type: "circuit" as const, entities: ["Silverstone", "British Grand Prix"] },
  { title: "Circuit de Spa-Francorchamps", type: "circuit" as const, entities: ["Spa", "Belgian Grand Prix"] },
  { title: "Autodromo Nazionale Monza", type: "circuit" as const, entities: ["Monza", "Italian Grand Prix"] },
  { title: "Suzuka International Racing Course", type: "circuit" as const, entities: ["Suzuka", "Japanese Grand Prix"] },
];

/**
 * Scrape F1 data from Wikipedia
 */
export async function scrapeWikipediaData(): Promise<F1Document[]> {
  const documents: F1Document[] = [];

  console.log("Scraping Wikipedia data...");

  for (const pageConfig of F1_WIKIPEDIA_PAGES) {
    try {
      console.log(`Fetching: ${pageConfig.title}`);
      const page = await fetchWikipediaPage(pageConfig.title);

      if (page && page.extract) {
        documents.push(wikiPageToDocument(page, pageConfig.type, pageConfig.entities));
        console.log(`Added: ${pageConfig.title}`);
      }

      // Rate limiting
      await new Promise((resolve) => setTimeout(resolve, 300));
    } catch (error) {
      console.error(`Error fetching ${pageConfig.title}:`, error);
    }
  }

  return documents;
}

/**
 * Search and scrape additional Wikipedia content
 */
export async function scrapeWikipediaSearch(
  query: string,
  limit: number = 5
): Promise<F1Document[]> {
  const documents: F1Document[] = [];

  try {
    const titles = await searchWikipedia(`Formula 1 ${query}`, limit);

    for (const title of titles) {
      const page = await fetchWikipediaPage(title);
      if (page && page.extract) {
        documents.push(
          wikiPageToDocument(page, "historical", [query])
        );
      }
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  } catch (error) {
    console.error(`Error searching Wikipedia for ${query}:`, error);
  }

  return documents;
}
