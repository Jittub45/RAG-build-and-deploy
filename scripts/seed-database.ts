/**
 * Database Seed Script
 * 
 * This script scrapes F1 data from multiple sources and populates
 * the vector database with embeddings.
 * 
 * Run with: npx tsx scripts/seed-database.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

import { scrapeAllSources } from '../src/lib/scrapers';
import { generateDocumentEmbeddings } from '../src/lib/vectordb/embeddings';
import { insertDocuments, getDocumentCount, resetCollection } from '../src/lib/vectordb/astra';

async function seed() {
  console.log('🏎️  F1 RAG Chatbot - Database Seeding\n');
  console.log('='.repeat(50));

  // Check environment variables
  if (!process.env.GOOGLE_API_KEY) {
    console.error('❌ GOOGLE_API_KEY is not set');
    process.exit(1);
  }

  if (!process.env.ASTRA_DB_APPLICATION_TOKEN || !process.env.ASTRA_DB_API_ENDPOINT) {
    console.error('❌ Astra DB credentials are not set');
    console.error('   Please set ASTRA_DB_APPLICATION_TOKEN and ASTRA_DB_API_ENDPOINT');
    process.exit(1);
  }

  try {
    // Reset collection to ensure correct dimensions
    console.log('\n📦 Resetting Astra DB collection (ensuring correct dimensions)...');
    await resetCollection();
    console.log('✓ Collection reset and ready\n');

    // Scrape data
    console.log('🔍 Scraping F1 data from all sources...\n');
    const documents = await scrapeAllSources();
    console.log(`\n✓ Scraped ${documents.length} documents\n`);

    if (documents.length === 0) {
      console.log('⚠️  No documents scraped. Check your internet connection.');
      return;
    }

    // Generate embeddings
    console.log('🧠 Generating embeddings...');
    console.log('   This may take a few minutes for large datasets.\n');
    
    const docsWithEmbeddings = await generateDocumentEmbeddings(documents);
    console.log(`✓ Generated ${docsWithEmbeddings.length} embeddings\n`);

    // Insert into database
    console.log('💾 Inserting into vector database...');
    await insertDocuments(docsWithEmbeddings);
    
    const totalCount = await getDocumentCount();
    console.log(`✓ Total documents in database: ${totalCount}\n`);

    console.log('='.repeat(50));
    console.log('🏁 Database seeding complete!');
    console.log('\nYou can now run: npm run dev');
    console.log('And start chatting about Formula 1! 🏎️\n');

  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run the seed function
seed();
