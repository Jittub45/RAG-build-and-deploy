// F1 Document types for vector database
export interface F1Document {
  id: string;
  content: string;
  embedding?: number[];
  metadata: F1Metadata;
}

export interface F1Metadata {
  source: string;
  type: DocumentType;
  date: string;
  entities: string[];
  url?: string;
  title?: string;
  season?: number;
  round?: number;
}

export type DocumentType = 
  | 'race_result'
  | 'driver_bio'
  | 'team_info'
  | 'news'
  | 'regulation'
  | 'stats'
  | 'qualifying'
  | 'standings'
  | 'circuit'
  | 'historical';

// Ergast API Types
export interface ErgastResponse<T> {
  MRData: {
    xmlns: string;
    series: string;
    url: string;
    limit: string;
    offset: string;
    total: string;
  } & T;
}

export interface RaceTable {
  RaceTable: {
    season: string;
    Races: Race[];
  };
}

export interface Race {
  season: string;
  round: string;
  url: string;
  raceName: string;
  Circuit: Circuit;
  date: string;
  time?: string;
  Results?: RaceResult[];
  QualifyingResults?: QualifyingResult[];
}

export interface Circuit {
  circuitId: string;
  url: string;
  circuitName: string;
  Location: {
    lat: string;
    long: string;
    locality: string;
    country: string;
  };
}

export interface RaceResult {
  number: string;
  position: string;
  positionText: string;
  points: string;
  Driver: Driver;
  Constructor: Constructor;
  grid: string;
  laps: string;
  status: string;
  Time?: {
    millis: string;
    time: string;
  };
  FastestLap?: {
    rank: string;
    lap: string;
    Time: { time: string };
    AverageSpeed: { units: string; speed: string };
  };
}

export interface QualifyingResult {
  number: string;
  position: string;
  Driver: Driver;
  Constructor: Constructor;
  Q1?: string;
  Q2?: string;
  Q3?: string;
}

export interface Driver {
  driverId: string;
  permanentNumber?: string;
  code?: string;
  url: string;
  givenName: string;
  familyName: string;
  dateOfBirth: string;
  nationality: string;
}

export interface Constructor {
  constructorId: string;
  url: string;
  name: string;
  nationality: string;
}

export interface DriverStanding {
  position: string;
  positionText: string;
  points: string;
  wins: string;
  Driver: Driver;
  Constructors: Constructor[];
}

export interface ConstructorStanding {
  position: string;
  positionText: string;
  points: string;
  wins: string;
  Constructor: Constructor;
}

export interface StandingsTable {
  StandingsTable: {
    season: string;
    StandingsLists: StandingsList[];
  };
}

export interface StandingsList {
  season: string;
  round: string;
  DriverStandings?: DriverStanding[];
  ConstructorStandings?: ConstructorStanding[];
}

// Chat Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  sources?: SourceReference[];
  createdAt: Date;
}

export interface SourceReference {
  title: string;
  source: string;
  url?: string;
  relevanceScore?: number;
}

// Scraper Types
export interface ScrapedData {
  content: string;
  metadata: Partial<F1Metadata>;
}

export interface ScraperResult {
  success: boolean;
  documents: F1Document[];
  errors?: string[];
}
