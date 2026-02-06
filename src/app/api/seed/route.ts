import { NextResponse } from "next/server";
import { scrapeAllSources } from "@/lib/scrapers";
import { generateDocumentEmbeddings } from "@/lib/vectordb/embeddings";
import { insertDocuments, getDocumentCount, clearCollection } from "@/lib/vectordb/astra";

export const maxDuration = 300; // 5 minutes timeout

/**
 * POST /api/seed - Trigger database seeding with latest F1 data
 * 
 * Headers:
 *   Authorization: Bearer <SEED_API_KEY>
 * 
 * Query params:
 *   clear=true - Clear existing data before seeding
 */
export async function POST(req: Request) {
  try {
    // Verify API key
    const authHeader = req.headers.get("Authorization");
    const apiKey = process.env.SEED_API_KEY || process.env.SCRAPE_API_KEY;

    if (apiKey && authHeader !== `Bearer ${apiKey}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const shouldClear = url.searchParams.get("clear") === "true";

    console.log("🏎️  Starting F1 data seeding...\n");

    // Clear existing data if requested
    if (shouldClear) {
      console.log("🗑️  Clearing existing data...");
      await clearCollection();
      console.log("✓ Collection cleared\n");
    }

    // Scrape data from all sources
    console.log("🔍 Scraping F1 data from 10+ sources...\n");
    const documents = await scrapeAllSources();

    if (documents.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No documents scraped",
        documentsScraped: 0,
      });
    }

    // Generate embeddings
    console.log("🧠 Generating embeddings...\n");
    const docsWithEmbeddings = await generateDocumentEmbeddings(documents);

    // Insert into database
    console.log("💾 Inserting into vector database...\n");
    await insertDocuments(docsWithEmbeddings);

    const totalCount = await getDocumentCount();

    console.log("🏁 Seeding complete!\n");

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
      documentsScraped: documents.length,
      documentsWithEmbeddings: docsWithEmbeddings.length,
      totalInDatabase: totalCount,
      sources: [
        "Ergast API",
        "Jolpica API",
        "OpenF1 API",
        "Wikipedia",
        "Autosport RSS",
        "Motorsport.com RSS",
        "RaceFans RSS",
        "RacingNews365 RSS",
        "The Race RSS",
        "PlanetF1 RSS",
        "Historical Facts",
      ],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Seeding failed:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Seeding failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/seed - Get seeding status
 */
export async function GET() {
  try {
    const count = await getDocumentCount();

    return NextResponse.json({
      status: "ready",
      documentsInDatabase: count,
      sources: [
        "Ergast API",
        "Jolpica API", 
        "OpenF1 API",
        "Wikipedia",
        "Autosport RSS",
        "Motorsport.com RSS",
        "RaceFans RSS",
        "RacingNews365 RSS",
        "The Race RSS",
        "PlanetF1 RSS",
        "Historical Facts",
      ],
      instructions: {
        seed: "POST /api/seed with Authorization: Bearer <API_KEY>",
        seedAndClear: "POST /api/seed?clear=true",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { status: "error", message: "Failed to get database status" },
      { status: 500 }
    );
  }
}
