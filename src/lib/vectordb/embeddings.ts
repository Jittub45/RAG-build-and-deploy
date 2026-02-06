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
    const result = await model.embedContent(texts[i]);
    allEmbeddings.push(result.embedding.values);

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
  const texts = documents.map((doc) => doc.content);
  const embeddings = await generateEmbeddings(texts);

  return documents.map((doc, index) => ({
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
