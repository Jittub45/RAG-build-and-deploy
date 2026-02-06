import { similaritySearch } from "@/lib/vectordb/astra";
import { generateEmbedding } from "@/lib/vectordb/embeddings";
import { F1Document } from "@/types";

export interface RetrievalResult {
  documents: F1Document[];
  scores: number[];
}

/**
 * Retrieve relevant documents for a query
 */
export async function retrieveDocuments(
  query: string,
  options: {
    limit?: number;
    minScore?: number;
    filter?: Record<string, unknown>;
  } = {}
): Promise<RetrievalResult> {
  const { limit = 5, minScore = 0.7, filter } = options;

  // Generate embedding for the query
  const queryEmbedding = await generateEmbedding(query);

  // Perform similarity search
  const results = await similaritySearch(queryEmbedding, limit, filter);

  // Filter by minimum score
  const filteredResults = results.filter((r) => r.score >= minScore);

  return {
    documents: filteredResults.map((r) => r.document),
    scores: filteredResults.map((r) => r.score),
  };
}

/**
 * Retrieve documents with metadata filtering
 */
export async function retrieveByType(
  query: string,
  type: F1Document["metadata"]["type"],
  limit: number = 5
): Promise<RetrievalResult> {
  return retrieveDocuments(query, {
    limit,
    filter: { "metadata.type": type },
  });
}

/**
 * Retrieve documents related to specific entities (drivers, teams)
 */
export async function retrieveByEntity(
  query: string,
  entity: string,
  limit: number = 5
): Promise<RetrievalResult> {
  // First try with filter, then fall back to general search
  const results = await retrieveDocuments(query, { limit: limit * 2 });

  // Filter for documents mentioning the entity
  const entityLower = entity.toLowerCase();
  const entityResults = results.documents.filter(
    (doc) =>
      doc.content.toLowerCase().includes(entityLower) ||
      doc.metadata.entities?.some((e) => e.toLowerCase().includes(entityLower))
  );

  if (entityResults.length >= limit) {
    return {
      documents: entityResults.slice(0, limit),
      scores: results.scores.slice(0, limit),
    };
  }

  return {
    documents: entityResults,
    scores: results.scores.slice(0, entityResults.length),
  };
}

/**
 * Multi-query retrieval for better coverage
 */
export async function multiQueryRetrieve(
  queries: string[],
  limit: number = 5
): Promise<RetrievalResult> {
  const allDocuments: Map<string, { doc: F1Document; maxScore: number }> =
    new Map();

  for (const query of queries) {
    const results = await retrieveDocuments(query, { limit });

    for (let i = 0; i < results.documents.length; i++) {
      const doc = results.documents[i];
      const score = results.scores[i];

      const existing = allDocuments.get(doc.id);
      if (!existing || existing.maxScore < score) {
        allDocuments.set(doc.id, { doc, maxScore: score });
      }
    }
  }

  // Sort by score and return top results
  const sorted = Array.from(allDocuments.values())
    .sort((a, b) => b.maxScore - a.maxScore)
    .slice(0, limit);

  return {
    documents: sorted.map((s) => s.doc),
    scores: sorted.map((s) => s.maxScore),
  };
}

/**
 * Hybrid retrieval combining semantic search with keyword matching
 */
export async function hybridRetrieve(
  query: string,
  limit: number = 5
): Promise<RetrievalResult> {
  // Extract potential keywords/entities
  const keywords = extractKeywords(query);

  // Generate multiple query variations
  const queries = [
    query,
    ...keywords.map((k) => `${k} Formula 1`),
  ].slice(0, 3);

  return multiQueryRetrieve(queries, limit);
}

/**
 * Extract F1-related keywords from query
 */
function extractKeywords(query: string): string[] {
  const keywords: string[] = [];

  // Driver names
  const drivers = [
    "Verstappen", "Hamilton", "Leclerc", "Norris", "Sainz", "Russell",
    "Piastri", "Perez", "Alonso", "Stroll", "Ocon", "Gasly", "Bottas",
    "Zhou", "Magnussen", "Hulkenberg", "Albon", "Tsunoda", "Ricciardo",
  ];

  // Team names
  const teams = [
    "Red Bull", "Ferrari", "Mercedes", "McLaren", "Aston Martin",
    "Alpine", "Williams", "Sauber", "RB", "Haas",
  ];

  // Circuits
  const circuits = [
    "Monaco", "Silverstone", "Spa", "Monza", "Suzuka", "Singapore",
    "Bahrain", "Jeddah", "Melbourne", "Miami", "Imola", "Barcelona",
  ];

  const queryLower = query.toLowerCase();

  for (const driver of drivers) {
    if (queryLower.includes(driver.toLowerCase())) {
      keywords.push(driver);
    }
  }

  for (const team of teams) {
    if (queryLower.includes(team.toLowerCase())) {
      keywords.push(team);
    }
  }

  for (const circuit of circuits) {
    if (queryLower.includes(circuit.toLowerCase())) {
      keywords.push(circuit);
    }
  }

  return keywords;
}
