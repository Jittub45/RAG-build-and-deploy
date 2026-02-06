import { GoogleGenerativeAI } from "@google/generative-ai";
import { F1Document } from "@/types";

// Model for embeddings - Gemini embedding model
const EMBEDDING_MODEL = "gemini-embedding-001";

// Lazy initialization of Gemini client
let genAI: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error("GOOGLE_API_KEY is not set");
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

/**
 * Generate embedding for a single text
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const model = getGenAI().getGenerativeModel({ model: EMBEDDING_MODEL });
  const result = await model.embedContent(text);
  return result.embedding.values;
}

/**
 * Generate embeddings for multiple texts in batch
 */
export async function generateEmbeddings(
  texts: string[]
): Promise<number[][]> {
  const model = getGenAI().getGenerativeModel({ model: EMBEDDING_MODEL });
  const allEmbeddings: number[][] = [];

  // Process texts one by one (Gemini doesn't support batch embedding)
  for (let i = 0; i < texts.length; i++) {
    const text = texts[i]?.trim();
    
    // Skip empty texts - use a placeholder embedding
    if (!text || text.length === 0) {
      console.log(`  Skipping empty text at index ${i}`);
      allEmbeddings.push(new Array(3072).fill(0));
      continue;
    }

    try {
      const result = await model.embedContent(text);
      allEmbeddings.push(result.embedding.values);
    } catch (error) {
      console.log(`  Error embedding text ${i}: ${error}`);
      allEmbeddings.push(new Array(3072).fill(0));
    }

    // Rate limiting - small delay between requests
    if (i < texts.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    // Log progress
    if ((i + 1) % 10 === 0) {
      console.log(`Generated ${i + 1}/${texts.length} embeddings`);
    }
  }

  return allEmbeddings;
}

/**
 * Generate embeddings for F1 documents
 */
export async function generateDocumentEmbeddings(
  documents: F1Document[]
): Promise<Array<{ document: F1Document; embedding: number[] }>> {
  // Filter out documents with empty content
  const validDocuments = documents.filter((doc) => doc.content?.trim().length > 0);
  console.log(`  Filtered ${documents.length - validDocuments.length} empty documents`);
  
  const texts = validDocuments.map((doc) => doc.content);
  const embeddings = await generateEmbeddings(texts);

  return validDocuments.map((doc, index) => ({
    document: doc,
    embedding: embeddings[index],
  }));
}

/**
 * Prepare text for embedding by combining content with metadata
 */
export function prepareTextForEmbedding(document: F1Document): string {
  const { content, metadata } = document;

  // Create a rich text representation including metadata
  const parts: string[] = [];

  if (metadata.title) {
    parts.push(`Title: ${metadata.title}`);
  }

  if (metadata.type) {
    parts.push(`Type: ${metadata.type.replace("_", " ")}`);
  }

  if (metadata.entities && metadata.entities.length > 0) {
    parts.push(`Related to: ${metadata.entities.join(", ")}`);
  }

  if (metadata.season) {
    parts.push(`Season: ${metadata.season}`);
  }

  parts.push(content);

  return parts.join("\n");
}
