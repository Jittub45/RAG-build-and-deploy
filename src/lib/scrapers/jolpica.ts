import { v4 as uuidv4 } from "uuid";
import { F1Document } from "@/types";

/**
 * Jolpica F1 API - Modern Ergast alternative with latest data
 * https://github.com/jolpica/jolpica-f1
 */

const JOLPICA_BASE_URL = "https://api.jolpi.ca/ergast/f1";

interface JolpicaResponse<T> {
  MRData: {
    xmlns: string;
    series: string;
    url: string;
    limit: string;
    offset: string;
    total: string;
  } & T;
}

/**
 * Fetch data from Jolpica API
 */
async function fetchJolpica<T>(endpoint: string): Promise<JolpicaResponse<T> | null> {
  try {
    const response = await fetch(`${JOLPICA_BASE_URL}${endpoint}.json`, {
      headers: { "Accept": "application/json" },
    });

    if (!response.ok) {
      console.log(`  ⚠ Jolpica ${endpoint}: HTTP ${response.status}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.log(`  ⚠ Jolpica ${endpoint}: Failed to fetch`);
    return null;
  }
}

/**
 * Scrape latest race results from Jolpica
 */
export async function scrapeJolpicaData(): Promise<F1Document[]> {
  const documents: F1Document[] = [];
  const currentYear = new Date().getFullYear();

  console.log("Fetching from Jolpica F1 API...\n");

  // Get current season schedule
  const scheduleData = await fetchJolpica<{ RaceTable: { Races: any[] } }>(`/${currentYear}`);
  
  if (scheduleData?.MRData.RaceTable.Races) {
    const races = scheduleData.MRData.RaceTable.Races;
    
    // Create schedule document
    const scheduleContent = races.map((race: any, idx: number) => 
      `Round ${idx + 1}: ${race.raceName} - ${race.Circuit.circuitName}, ${race.Circuit.Location.country} (${race.date})`
    ).join("\n");

    documents.push({
      id: uuidv4(),
      content: `${currentYear} Formula 1 Race Calendar:\n\n${scheduleContent}`,
      metadata: {
        source: "jolpica",
        type: "calendar",
        date: new Date().toISOString().split("T")[0],
        title: `${currentYear} F1 Season Calendar`,
        entities: races.map((r: any) => r.Circuit.Location.country),
        url: "https://api.jolpi.ca/ergast/f1",
      },
    });
  }

  // Get latest race result
  const lastRaceData = await fetchJolpica<{ RaceTable: { Races: any[] } }>(`/${currentYear}/last/results`);
  
  if (lastRaceData?.MRData.RaceTable.Races[0]) {
    const race = lastRaceData.MRData.RaceTable.Races[0];
    const results = race.Results || [];
    
    const resultsContent = results.slice(0, 10).map((r: any) => 
      `P${r.position}: ${r.Driver.givenName} ${r.Driver.familyName} (${r.Constructor.name}) - ${r.status}`
    ).join("\n");

    documents.push({
      id: uuidv4(),
      content: `${race.raceName} ${race.season} - Race Results\n\nCircuit: ${race.Circuit.circuitName}\nDate: ${race.date}\n\nTop 10 Results:\n${resultsContent}`,
      metadata: {
        source: "jolpica",
        type: "race",
        date: race.date,
        title: `${race.raceName} ${race.season} Results`,
        entities: results.slice(0, 10).map((r: any) => r.Driver.familyName),
        url: "https://api.jolpi.ca/ergast/f1",
      },
    });
  }

  // Get current driver standings
  const standingsData = await fetchJolpica<{ StandingsTable: { StandingsLists: any[] } }>(`/${currentYear}/driverStandings`);
  
  if (standingsData?.MRData.StandingsTable.StandingsLists[0]) {
    const standings = standingsData.MRData.StandingsTable.StandingsLists[0].DriverStandings || [];
    
    const standingsContent = standings.map((s: any) => 
      `${s.position}. ${s.Driver.givenName} ${s.Driver.familyName} (${s.Constructors[0]?.name}) - ${s.points} pts (${s.wins} wins)`
    ).join("\n");

    documents.push({
      id: uuidv4(),
      content: `${currentYear} F1 Driver Championship Standings:\n\n${standingsContent}`,
      metadata: {
        source: "jolpica",
        type: "standings",
        date: new Date().toISOString().split("T")[0],
        title: `${currentYear} Driver Standings`,
        entities: standings.map((s: any) => s.Driver.familyName),
        url: "https://api.jolpi.ca/ergast/f1",
      },
    });
  }

  // Get constructor standings
  const constructorData = await fetchJolpica<{ StandingsTable: { StandingsLists: any[] } }>(`/${currentYear}/constructorStandings`);
  
  if (constructorData?.MRData.StandingsTable.StandingsLists[0]) {
    const standings = constructorData.MRData.StandingsTable.StandingsLists[0].ConstructorStandings || [];
    
    const standingsContent = standings.map((s: any) => 
      `${s.position}. ${s.Constructor.name} - ${s.points} pts (${s.wins} wins)`
    ).join("\n");

    documents.push({
      id: uuidv4(),
      content: `${currentYear} F1 Constructor Championship Standings:\n\n${standingsContent}`,
      metadata: {
        source: "jolpica",
        type: "standings",
        date: new Date().toISOString().split("T")[0],
        title: `${currentYear} Constructor Standings`,
        entities: standings.map((s: any) => s.Constructor.name),
        url: "https://api.jolpi.ca/ergast/f1",
      },
    });
  }

  console.log(`  ✓ Jolpica: ${documents.length} documents`);
  return documents;
}
