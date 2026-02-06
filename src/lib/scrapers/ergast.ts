import { v4 as uuidv4 } from "uuid";
import {
  F1Document,
  ErgastResponse,
  RaceTable,
  Race,
  RaceResult,
  Driver,
  Constructor,
  StandingsTable,
  DriverStanding,
  ConstructorStanding,
} from "@/types";

const ERGAST_BASE_URL = "https://ergast.com/api/f1";

/**
 * Fetch data from Ergast API
 */
async function fetchErgast<T>(endpoint: string): Promise<ErgastResponse<T>> {
  const response = await fetch(`${ERGAST_BASE_URL}${endpoint}.json`, {
    next: { revalidate: 3600 }, // Cache for 1 hour
  });

  if (!response.ok) {
    throw new Error(`Ergast API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Get current season races
 */
export async function getCurrentSeasonRaces(): Promise<Race[]> {
  const data = await fetchErgast<RaceTable>("/current");
  return data.MRData.RaceTable.Races;
}

/**
 * Get race results for a specific race
 */
export async function getRaceResults(
  season: string | number,
  round: string | number
): Promise<Race | null> {
  const data = await fetchErgast<RaceTable>(`/${season}/${round}/results`);
  return data.MRData.RaceTable.Races[0] || null;
}

/**
 * Get qualifying results for a specific race
 */
export async function getQualifyingResults(
  season: string | number,
  round: string | number
): Promise<Race | null> {
  const data = await fetchErgast<RaceTable>(`/${season}/${round}/qualifying`);
  return data.MRData.RaceTable.Races[0] || null;
}

/**
 * Get current driver standings
 */
export async function getDriverStandings(
  season: string | number = "current"
): Promise<DriverStanding[]> {
  const data = await fetchErgast<StandingsTable>(
    `/${season}/driverStandings`
  );
  return data.MRData.StandingsTable.StandingsLists[0]?.DriverStandings || [];
}

/**
 * Get current constructor standings
 */
export async function getConstructorStandings(
  season: string | number = "current"
): Promise<ConstructorStanding[]> {
  const data = await fetchErgast<StandingsTable>(
    `/${season}/constructorStandings`
  );
  return (
    data.MRData.StandingsTable.StandingsLists[0]?.ConstructorStandings || []
  );
}

/**
 * Get all drivers for a season
 */
export async function getDrivers(
  season: string | number = "current"
): Promise<Driver[]> {
  const data = await fetchErgast<{ DriverTable: { Drivers: Driver[] } }>(
    `/${season}/drivers`
  );
  return data.MRData.DriverTable.Drivers;
}

/**
 * Get all constructors for a season
 */
export async function getConstructors(
  season: string | number = "current"
): Promise<Constructor[]> {
  const data = await fetchErgast<{
    ConstructorTable: { Constructors: Constructor[] };
  }>(`/${season}/constructors`);
  return data.MRData.ConstructorTable.Constructors;
}

/**
 * Get all circuits for current season
 */
export async function getCircuits(season: string | number = "current") {
  const data = await fetchErgast<{
    CircuitTable: { Circuits: Race["Circuit"][] };
  }>(`/${season}/circuits`);
  return data.MRData.CircuitTable.Circuits;
}

// Document Generation Functions

/**
 * Convert race result to F1Document
 */
function raceResultToDocument(race: Race): F1Document {
  const results = race.Results || [];
  const winner = results[0];

  let content = `${race.raceName} - ${race.season} Season, Round ${race.round}\n`;
  content += `Circuit: ${race.Circuit.circuitName}, ${race.Circuit.Location.locality}, ${race.Circuit.Location.country}\n`;
  content += `Date: ${race.date}\n\n`;

  if (winner) {
    content += `Race Winner: ${winner.Driver.givenName} ${winner.Driver.familyName} (${winner.Constructor.name})\n`;
    if (winner.Time) {
      content += `Winning Time: ${winner.Time.time}\n`;
    }
  }

  content += "\nFull Results:\n";
  results.forEach((result: RaceResult) => {
    content += `${result.position}. ${result.Driver.givenName} ${result.Driver.familyName} (${result.Constructor.name}) - ${result.points} pts`;
    if (result.Time) {
      content += ` - ${result.Time.time}`;
    }
    if (result.status !== "Finished") {
      content += ` - ${result.status}`;
    }
    content += "\n";
  });

  const entities = [
    ...results.map(
      (r: RaceResult) => `${r.Driver.givenName} ${r.Driver.familyName}`
    ),
    ...new Set(results.map((r: RaceResult) => r.Constructor.name)),
    race.Circuit.circuitName,
  ];

  return {
    id: uuidv4(),
    content,
    metadata: {
      source: "ergast",
      type: "race_result",
      date: race.date,
      title: `${race.raceName} ${race.season} Results`,
      season: parseInt(race.season),
      round: parseInt(race.round),
      entities,
      url: race.url,
    },
  };
}

/**
 * Convert driver standings to F1Document
 */
function driverStandingsToDocument(
  standings: DriverStanding[],
  season: string
): F1Document {
  let content = `Formula 1 ${season} Driver Championship Standings\n\n`;

  standings.forEach((standing) => {
    content += `${standing.position}. ${standing.Driver.givenName} ${standing.Driver.familyName}`;
    content += ` (${standing.Constructors.map((c) => c.name).join(", ")})`;
    content += ` - ${standing.points} points, ${standing.wins} wins\n`;
  });

  const entities = standings.map(
    (s) => `${s.Driver.givenName} ${s.Driver.familyName}`
  );

  return {
    id: uuidv4(),
    content,
    metadata: {
      source: "ergast",
      type: "standings",
      date: new Date().toISOString().split("T")[0],
      title: `${season} Driver Championship Standings`,
      season: parseInt(season),
      entities,
    },
  };
}

/**
 * Convert constructor standings to F1Document
 */
function constructorStandingsToDocument(
  standings: ConstructorStanding[],
  season: string
): F1Document {
  let content = `Formula 1 ${season} Constructor Championship Standings\n\n`;

  standings.forEach((standing) => {
    content += `${standing.position}. ${standing.Constructor.name}`;
    content += ` - ${standing.points} points, ${standing.wins} wins\n`;
  });

  const entities = standings.map((s) => s.Constructor.name);

  return {
    id: uuidv4(),
    content,
    metadata: {
      source: "ergast",
      type: "standings",
      date: new Date().toISOString().split("T")[0],
      title: `${season} Constructor Championship Standings`,
      season: parseInt(season),
      entities,
    },
  };
}

/**
 * Convert driver info to F1Document
 */
function driverToDocument(driver: Driver, season: string): F1Document {
  const content = `Driver Profile: ${driver.givenName} ${driver.familyName}
Nationality: ${driver.nationality}
Date of Birth: ${driver.dateOfBirth}
${driver.permanentNumber ? `Number: ${driver.permanentNumber}` : ""}
${driver.code ? `Code: ${driver.code}` : ""}

${driver.givenName} ${driver.familyName} is a ${driver.nationality} Formula 1 driver competing in the ${season} season.`;

  return {
    id: uuidv4(),
    content,
    metadata: {
      source: "ergast",
      type: "driver_bio",
      date: new Date().toISOString().split("T")[0],
      title: `${driver.givenName} ${driver.familyName} Profile`,
      season: parseInt(season),
      entities: [`${driver.givenName} ${driver.familyName}`],
      url: driver.url,
    },
  };
}

/**
 * Convert constructor info to F1Document
 */
function constructorToDocument(
  constructor: Constructor,
  season: string
): F1Document {
  const content = `Team Profile: ${constructor.name}
Nationality: ${constructor.nationality}

${constructor.name} is a ${constructor.nationality} Formula 1 constructor competing in the ${season} season.`;

  return {
    id: uuidv4(),
    content,
    metadata: {
      source: "ergast",
      type: "team_info",
      date: new Date().toISOString().split("T")[0],
      title: `${constructor.name} Team Profile`,
      season: parseInt(season),
      entities: [constructor.name],
      url: constructor.url,
    },
  };
}

/**
 * Convert circuit info to F1Document
 */
function circuitToDocument(circuit: Race["Circuit"]): F1Document {
  const content = `Circuit: ${circuit.circuitName}
Location: ${circuit.Location.locality}, ${circuit.Location.country}
Coordinates: ${circuit.Location.lat}, ${circuit.Location.long}

${circuit.circuitName} is located in ${circuit.Location.locality}, ${circuit.Location.country}. It is one of the circuits on the Formula 1 calendar.`;

  return {
    id: uuidv4(),
    content,
    metadata: {
      source: "ergast",
      type: "circuit",
      date: new Date().toISOString().split("T")[0],
      title: `${circuit.circuitName} Circuit Information`,
      entities: [circuit.circuitName, circuit.Location.country],
      url: circuit.url,
    },
  };
}

/**
 * Scrape all data from Ergast API and convert to F1Documents
 */
export async function scrapeErgastData(
  season: string = "current"
): Promise<F1Document[]> {
  const documents: F1Document[] = [];

  console.log(`Scraping Ergast data for season: ${season}`);

  try {
    // Get race calendar
    const races = await getCurrentSeasonRaces();
    console.log(`Found ${races.length} races`);

    // Get results for completed races
    for (const race of races) {
      try {
        const raceWithResults = await getRaceResults(race.season, race.round);
        if (raceWithResults && raceWithResults.Results) {
          documents.push(raceResultToDocument(raceWithResults));
          console.log(`Added results for ${race.raceName}`);
        }
      } catch (error) {
        console.log(`No results yet for ${race.raceName}`);
      }

      // Rate limiting
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    // Get driver standings
    const driverStandings = await getDriverStandings(season);
    if (driverStandings.length > 0) {
      const actualSeason =
        season === "current" ? new Date().getFullYear().toString() : season;
      documents.push(driverStandingsToDocument(driverStandings, actualSeason));
      console.log("Added driver standings");
    }

    // Get constructor standings
    const constructorStandings = await getConstructorStandings(season);
    if (constructorStandings.length > 0) {
      const actualSeason =
        season === "current" ? new Date().getFullYear().toString() : season;
      documents.push(
        constructorStandingsToDocument(constructorStandings, actualSeason)
      );
      console.log("Added constructor standings");
    }

    // Get drivers
    const drivers = await getDrivers(season);
    const actualSeason =
      season === "current" ? new Date().getFullYear().toString() : season;
    for (const driver of drivers) {
      documents.push(driverToDocument(driver, actualSeason));
    }
    console.log(`Added ${drivers.length} driver profiles`);

    // Get constructors
    const constructors = await getConstructors(season);
    for (const constructor of constructors) {
      documents.push(constructorToDocument(constructor, actualSeason));
    }
    console.log(`Added ${constructors.length} constructor profiles`);

    // Get circuits
    const circuits = await getCircuits(season);
    for (const circuit of circuits) {
      documents.push(circuitToDocument(circuit));
    }
    console.log(`Added ${circuits.length} circuit profiles`);
  } catch (error) {
    console.error("Error scraping Ergast data:", error);
  }

  return documents;
}
