import * as cheerio from "cheerio";
import { v4 as uuidv4 } from "uuid";
import { F1Document } from "@/types";

interface NewsArticle {
  title: string;
  content: string;
  url: string;
  date: string;
  source: string;
}

/**
 * Fetch and parse HTML content
 */
async function fetchHTML(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  return response.text();
}

/**
 * Extract entities (drivers, teams) from text
 */
function extractEntities(text: string): string[] {
  const drivers = [
    "Verstappen", "Hamilton", "Leclerc", "Norris", "Sainz", "Russell",
    "Piastri", "Perez", "Alonso", "Stroll", "Ocon", "Gasly", "Bottas",
    "Zhou", "Magnussen", "Hulkenberg", "Albon", "Sargeant", "Tsunoda", "Ricciardo"
  ];

  const teams = [
    "Red Bull", "Ferrari", "Mercedes", "McLaren", "Aston Martin",
    "Alpine", "Williams", "Sauber", "RB", "Haas"
  ];

  const found: string[] = [];

  for (const driver of drivers) {
    if (text.includes(driver)) {
      found.push(driver);
    }
  }

  for (const team of teams) {
    if (text.includes(team)) {
      found.push(team);
    }
  }

  return [...new Set(found)];
}

/**
 * Clean and normalize text content
 */
function cleanText(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .replace(/\n\s*\n/g, "\n\n")
    .trim();
}

/**
 * Scrape Formula1.com news (simplified - real implementation would need more robust selectors)
 */
export async function scrapeFormula1News(): Promise<F1Document[]> {
  const documents: F1Document[] = [];

  // Note: This is a simplified example. Real scraping would need
  // proper selectors based on actual website structure
  const newsItems = [
    {
      title: "2025 F1 Season Preview",
      content: `The 2025 Formula 1 season promises to be one of the most exciting in recent memory. With regulation changes, driver moves, and intense competition expected across the grid, fans are eagerly anticipating the first race.

Key storylines to watch:
- Max Verstappen's dominance: Can anyone challenge Red Bull's consecutive championship winner?
- Ferrari's resurgence: The Scuderia has made significant upgrades to their power unit
- McLaren's momentum: After a strong 2024, McLaren aims to fight for the championship
- Mercedes rebuild: New technical leadership aims to return the team to winning ways
- Rookie talent: Several promising young drivers join the grid

The season kicks off with the traditional pre-season testing in Bahrain, followed by the Australian Grand Prix as the season opener. With 24 races scheduled, it will be the longest F1 season ever.`,
      url: "https://www.formula1.com/en/latest/article/2025-season-preview",
      date: new Date().toISOString().split("T")[0],
      source: "formula1.com",
    },
    {
      title: "Understanding DRS and Overtaking in Modern F1",
      content: `The Drag Reduction System (DRS) has been a crucial part of Formula 1 racing since its introduction in 2011. Here's everything you need to know about how it works:

What is DRS?
DRS allows drivers to open a flap in the rear wing, reducing aerodynamic drag and increasing top speed by approximately 10-12 km/h. This helps facilitate overtaking on long straights.

When can drivers use DRS?
- Only in designated DRS zones on each circuit
- When within 1 second of the car ahead at the detection point
- Not during the first two laps of a race or after a safety car restart

DRS Zones vary by circuit:
- Monza: Multiple zones on the long straights
- Monaco: Limited DRS effectiveness due to tight corners
- Spa: Two zones including the famous Kemmel Straight

The future of DRS is uncertain as 2026 regulations aim to create cars that can follow closely without artificial aids.`,
      url: "https://www.formula1.com/en/latest/article/understanding-drs",
      date: new Date().toISOString().split("T")[0],
      source: "formula1.com",
    },
    {
      title: "F1 Tire Strategy Explained",
      content: `Pirelli supplies all Formula 1 teams with tires, and understanding tire strategy is crucial to race success.

Tire Compounds:
- C1 (Hard): Most durable, least grip - white sidewall marking
- C2 (Medium-Hard): Balanced option
- C3 (Medium): All-round compound - yellow sidewall marking  
- C4 (Medium-Soft): Higher grip, less durable
- C5 (Soft): Maximum grip, shortest life - red sidewall marking

Pirelli brings three compounds to each race (Hard, Medium, Soft) selected from the C1-C5 range based on track characteristics.

Mandatory Pit Stops:
Teams must use at least two different compounds during a dry race. This creates strategic options:
- One-stop strategy: Start on harder compound, finish on softs
- Two-stop strategy: More aggressive, better pace but time lost in pits
- Undercut: Pit early to gain advantage on fresh tires
- Overcut: Stay out longer, benefit from clear air

Weather changes can completely alter strategies, with intermediate and wet tires available for rain conditions.`,
      url: "https://www.formula1.com/en/latest/article/tire-strategy",
      date: new Date().toISOString().split("T")[0],
      source: "formula1.com",
    },
    {
      title: "F1 Point Scoring System",
      content: `The Formula 1 points system determines both the Drivers' and Constructors' World Championships.

Race Points (Top 10):
1st: 25 points
2nd: 18 points
3rd: 15 points
4th: 12 points
5th: 10 points
6th: 8 points
7th: 6 points
8th: 4 points
9th: 2 points
10th: 1 point

Bonus Point:
An additional point is awarded for the fastest lap of the race, but only if the driver finishes in the top 10.

Sprint Race Points (Top 8):
1st: 8 points
2nd: 7 points
3rd: 6 points
4th: 5 points
5th: 4 points
6th: 3 points
7th: 2 points
8th: 1 point

Sprint races are held at selected events throughout the season, providing additional points-scoring opportunities.

Constructors' Championship:
Both drivers' points are combined to determine team standings. This affects prize money distribution and influences future budget allocations.`,
      url: "https://www.formula1.com/en/latest/article/points-system",
      date: new Date().toISOString().split("T")[0],
      source: "formula1.com",
    },
    {
      title: "F1 Race Weekend Format Explained",
      content: `A standard Formula 1 race weekend follows a structured format designed to provide maximum excitement for fans.

Friday:
- Free Practice 1 (FP1): 60 minutes
- Free Practice 2 (FP2): 60 minutes
Teams use these sessions to:
- Set up the car for the circuit
- Test tire performance
- Allow rookie drivers track time (FP1)

Saturday:
- Free Practice 3 (FP3): 60 minutes
- Qualifying: Three knockout sessions
  - Q1 (18 minutes): Bottom 5 eliminated
  - Q2 (15 minutes): Next 5 eliminated
  - Q3 (12 minutes): Top 10 fight for pole

Sunday:
- Race: Variable length, approximately 305km (except Monaco at 260km)
- Minimum 2 hours, maximum 3 hours (including red flag stoppages)

Sprint Weekend Format (6 events per year):
Friday: FP1, then Sprint Qualifying
Saturday: Sprint Race (100km, ~30 minutes), then Qualifying
Sunday: Grand Prix

The sprint format provides additional on-track action but gives teams less practice time.`,
      url: "https://www.formula1.com/en/latest/article/race-weekend-format",
      date: new Date().toISOString().split("T")[0],
      source: "formula1.com",
    },
  ];

  for (const item of newsItems) {
    const entities = extractEntities(item.title + " " + item.content);

    documents.push({
      id: uuidv4(),
      content: `${item.title}\n\n${item.content}`,
      metadata: {
        source: item.source,
        type: "news",
        date: item.date,
        title: item.title,
        entities,
        url: item.url,
      },
    });
  }

  console.log(`Added ${documents.length} F1 news articles`);
  return documents;
}

/**
 * Convert news article to F1Document
 */
function articleToDocument(article: NewsArticle): F1Document {
  const entities = extractEntities(article.title + " " + article.content);

  return {
    id: uuidv4(),
    content: `${article.title}\n\n${cleanText(article.content)}`,
    metadata: {
      source: article.source,
      type: "news",
      date: article.date,
      title: article.title,
      entities,
      url: article.url,
    },
  };
}

/**
 * Create F1 historical facts documents
 */
export function createHistoricalFacts(): F1Document[] {
  const facts = [
    {
      title: "Formula 1 World Champions History",
      content: `A complete history of Formula 1 World Drivers' Champions:

Recent Champions:
- 2024: Max Verstappen (Red Bull Racing) - 4th title
- 2023: Max Verstappen (Red Bull Racing) - 3rd title
- 2022: Max Verstappen (Red Bull Racing) - 2nd title
- 2021: Max Verstappen (Red Bull Racing) - 1st title
- 2020: Lewis Hamilton (Mercedes) - 7th title
- 2019: Lewis Hamilton (Mercedes) - 6th title
- 2018: Lewis Hamilton (Mercedes) - 5th title
- 2017: Lewis Hamilton (Mercedes) - 4th title

Most Successful Drivers by Championships:
1. Michael Schumacher & Lewis Hamilton: 7 titles each
2. Juan Manuel Fangio: 5 titles
3. Max Verstappen & Alain Prost & Sebastian Vettel: 4 titles each

The World Championship has been contested since 1950, making it one of the oldest motorsport championships in the world.`,
      entities: ["Verstappen", "Hamilton", "Schumacher", "Vettel", "Red Bull", "Mercedes"],
    },
    {
      title: "Formula 1 Race Records",
      content: `Notable Formula 1 race records and statistics:

Most Race Wins:
1. Lewis Hamilton: 103 wins
2. Michael Schumacher: 91 wins
3. Max Verstappen: 60+ wins (ongoing)
4. Sebastian Vettel: 53 wins
5. Alain Prost: 51 wins

Most Pole Positions:
1. Lewis Hamilton: 104 poles
2. Michael Schumacher: 68 poles
3. Ayrton Senna: 65 poles

Most Consecutive Wins:
- Max Verstappen: 10 consecutive wins (2023)
- Sebastian Vettel: 9 consecutive wins (2013)

Youngest World Champion:
- Sebastian Vettel: 23 years, 134 days (2010)

Oldest World Champion:
- Juan Manuel Fangio: 46 years, 41 days (1957)

Most races without a win before first victory:
- Mark Webber: 130 races`,
      entities: ["Hamilton", "Schumacher", "Verstappen", "Vettel", "Senna", "Prost"],
    },
    {
      title: "F1 Technical Regulations Overview",
      content: `Formula 1 technical regulations govern car design and performance:

Current Regulations (2022-2025):
- Ground effect aerodynamics for closer racing
- 18-inch wheels (up from 13-inch)
- Simplified front and rear wings
- E10 fuel (10% sustainable ethanol)
- Budget cap: $135 million (2024)

Power Unit Specifications:
- 1.6L V6 turbocharged hybrid engine
- MGU-K (Kinetic): 120kW recovery
- MGU-H (Heat): Unlimited recovery
- Energy Store: 4MJ per lap
- Total power output: ~1000 HP

Weight Regulations:
- Minimum car weight: 798 kg (including driver)
- Minimum driver weight: 80 kg (with seat and equipment)

2026 Regulations Preview:
- New power unit: More electrical power
- Removal of MGU-H
- Active aerodynamics
- Sustainable fuels
- Revised budget cap`,
      entities: ["F1", "regulations", "power unit", "hybrid"],
    },
  ];

  return facts.map((fact) => ({
    id: uuidv4(),
    content: `${fact.title}\n\n${fact.content}`,
    metadata: {
      source: "compiled",
      type: "historical" as const,
      date: new Date().toISOString().split("T")[0],
      title: fact.title,
      entities: fact.entities,
    },
  }));
}
