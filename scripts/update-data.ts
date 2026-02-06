/**
 * Database Update Script
 * 
 * This script updates the vector database with fresh F1 data.
 * Use this for scheduled updates (cron jobs) to keep data current.
 * 
 * Run with: npx tsx scripts/update-data.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

import { scrapeErgastData } from '../src/lib/scrapers/ergast';
import { scrapeFormula1News } from '../src/lib/scrapers/news';
import { generateDocumentEmbeddings } from '../src/lib/vectordb/embeddings';
import { insertDocuments, deleteDocuments, getDocumentCount } from '../src/lib/vectordb/astra';

async function update() {
  console.log('🏎️  F1 RAG Chatbot - Data Update\n');
  console.log('='.repeat(50));
  console.log(`📅 Update started at: ${new Date().toISOString()}\n`);

  try {
    // Delete old race results and standings (they change frequently)
    console.log('🗑️  Removing outdated data...');
    
    const deletedResults = await deleteDocuments({
      'metadata.source': 'ergast',
      'metadata.type': { $in: ['race_result', 'standings'] }
    });
    console.log(`   Removed ${deletedResults} old race results/standings`);

    const deletedNews = await deleteDocuments({
      'metadata.source': 'formula1.com',
      'metadata.type': 'news'
    });
    console.log(`   Removed ${deletedNews} old news articles\n`);

    // Scrape fresh data
    console.log('🔍 Scraping fresh F1 data...\n');
    
    const ergastDocs = await scrapeErgastData('current');
    console.log(`   Ergast: ${ergastDocs.length} documents`);
    
    const newsDocs = await scrapeFormula1News();
    console.log(`   News: ${newsDocs.length} documents\n`);

    const allDocs = [...ergastDocs, ...newsDocs];

    if (allDocs.length === 0) {
      console.log('⚠️  No new documents to add.');
      return;
    }

    // Generate embeddings
    console.log('🧠 Generating embeddings...');
    const docsWithEmbeddings = await generateDocumentEmbeddings(allDocs);
    console.log(`   Generated ${docsWithEmbeddings.length} embeddings\n`);

    // Insert new data
    console.log('💾 Inserting fresh data...');
    await insertDocuments(docsWithEmbeddings);

    const totalCount = await getDocumentCount();
    console.log(`   Total documents in database: ${totalCount}\n`);

    console.log('='.repeat(50));
    console.log('🏁 Update complete!');
    console.log(`📅 Finished at: ${new Date().toISOString()}\n`);

  } catch (error) {
    console.error('\n❌ Update failed:', error);
    process.exit(1);
  }
}

// Run the update function
update();
