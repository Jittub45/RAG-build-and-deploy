import { v4 as uuidv4 } from "uuid";
import { F1Document } from "@/types";

/**
 * OpenF1 API - Real-time F1 telemetry and session data
 * https://openf1.org/
 */

const OPENF1_BASE_URL = "https://api.openf1.org/v1";

interface OpenF1Session {
  session_key: number;
  session_name: string;
  session_type: string;
  date_start: string;
  date_end: string;
  gmt_offset: string;
  location: string;
  country_name: string;
  circuit_short_name: string;
}

interface OpenF1Driver {
  driver_number: number;
  broadcast_name: string;
  full_name: string;
  name_acronym: string;
  team_name: string;
  team_colour: string;
  country_code: string;
}

interface OpenF1Position {
  driver_number: number;
  position: number;
  date: string;
}

/**
 * Fetch data from OpenF1 API
 */
async function fetchOpenF1<T>(endpoint: string, params: Record<string, string> = {}): Promise<T[]> {
  try {
    const searchParams = new URLSearchParams(params);
    const url = `${OPENF1_BASE_URL}${endpoint}?${searchParams}`;
    
    const response = await fetch(url, {
      headers: { "Accept": "application/json" },
    });

    if (!response.ok) {
      console.log(`  ⚠ OpenF1 ${endpoint}: HTTP ${response.status}`);
      return [];
    }

    return await response.json();
  } catch (error) {
    console.log(`  ⚠ OpenF1 ${endpoint}: Failed to fetch`);
    return [];
  }
}

/**
 * Get latest sessions
 */
async function getLatestSessions(): Promise<OpenF1Session[]> {
  return fetchOpenF1<OpenF1Session>("/sessions", {
    year: new Date().getFullYear().toString(),
  });
}

/**
 * Get drivers for a session
 */
async function getSessionDrivers(sessionKey: number): Promise<OpenF1Driver[]> {
  return fetchOpenF1<OpenF1Driver>("/drivers", {
    session_key: sessionKey.toString(),
  });
}

/**
 * Scrape OpenF1 for real-time session data
 */
export async function scrapeOpenF1Data(): Promise<F1Document[]> {
  const documents: F1Document[] = [];

  console.log("Fetching from OpenF1 API...\n");

  // Get recent sessions
  const sessions = await getLatestSessions();
  const recentSessions = sessions.slice(-5); // Last 5 sessions

  for (const session of recentSessions) {
    // Create session document
    const sessionDoc: F1Document = {
      id: uuidv4(),
      content: `${session.session_type} - ${session.session_name}
Location: ${session.location}, ${session.country_name}
Circuit: ${session.circuit_short_name}
Date: ${session.date_start}

This ${session.session_type.toLowerCase()} session took place at ${session.circuit_short_name} in ${session.country_name}.`,
      metadata: {
        source: "openf1",
        type: "race",
        date: session.date_start.split("T")[0],
        title: `${session.session_name} - ${session.session_type}`,
        entities: [session.location, session.country_name],
        url: "https://openf1.org/",
      },
    };
    documents.push(sessionDoc);

    // Get drivers for this session
    const drivers = await getSessionDrivers(session.session_key);
    if (drivers.length > 0) {
      const driverList = drivers
        .map((d) => `${d.driver_number}. ${d.full_name} (${d.team_name})`)
        .join("\n");

      const driversDoc: F1Document = {
        id: uuidv4(),
        content: `Drivers participating in ${session.session_name}:\n\n${driverList}`,
        metadata: {
          source: "openf1",
          type: "driver",
          date: session.date_start.split("T")[0],
          title: `${session.session_name} Driver Lineup`,
          entities: drivers.map((d) => d.full_name),
          url: "https://openf1.org/",
        },
      };
      documents.push(driversDoc);
    }
  }

  console.log(`  ✓ OpenF1: ${documents.length} documents`);
  return documents;
}
