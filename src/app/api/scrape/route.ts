import { NextResponse } from "next/server";
import { scrapeAllSources } from "@/lib/scrapers";
import { generateDocumentEmbeddings } from "@/lib/vectordb/embeddings";
import { insertDocuments, getDocumentCount } from "@/lib/vectordb/astra";

export const maxDuration = 300; // 5 minutes max for scraping

export async function POST(req: Request) {
  try {
    // Optional: Add API key protection
    const authHeader = req.headers.get("authorization");
    const apiKey = process.env.SCRAPE_API_KEY;

    if (apiKey && authHeader !== `Bearer ${apiKey}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Starting data scraping...");

    // Scrape all sources
    const documents = await scrapeAllSources();
    console.log(`Scraped ${documents.length} documents`);

    if (documents.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No documents scraped",
      });
    }

    // Generate embeddings
    console.log("Generating embeddings...");
    const docsWithEmbeddings = await generateDocumentEmbeddings(documents);
    console.log(`Generated ${docsWithEmbeddings.length} embeddings`);

    // Insert into vector database
    console.log("Inserting into vector database...");
    await insertDocuments(docsWithEmbeddings);

    const totalCount = await getDocumentCount();

    return NextResponse.json({
      success: true,
      message: "Data scraping and embedding complete",
      documentsProcessed: documents.length,
      totalDocumentsInDb: totalCount,
    });
  } catch (error) {
    console.error("Scrape API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const count = await getDocumentCount();
    return NextResponse.json({
      status: "ready",
      documentCount: count,
    });
  } catch (error) {
    return NextResponse.json({
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
