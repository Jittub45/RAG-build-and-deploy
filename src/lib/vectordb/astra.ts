import { DataAPIClient, Collection } from "@datastax/astra-db-ts";
import { F1Document } from "@/types";

// Embedding dimensions for Google text-embedding-004
const EMBEDDING_DIMENSION = 768;

let client: DataAPIClient | null = null;
let collection: Collection | null = null;

/**
 * Get Astra DB credentials (read lazily to ensure dotenv has loaded)
 */
function getCredentials() {
  const token = process.env.ASTRA_DB_APPLICATION_TOKEN;
  const endpoint = process.env.ASTRA_DB_API_ENDPOINT;
  const collectionName = process.env.ASTRA_DB_COLLECTION || "f1_documents";
  return { token, endpoint, collectionName };
}

/**
 * Initialize Astra DB client
 */
export async function getAstraClient(): Promise<DataAPIClient> {
  if (!client) {
    const { token, endpoint } = getCredentials();
    if (!token || !endpoint) {
      throw new Error(
        "Missing Astra DB credentials. Please set ASTRA_DB_APPLICATION_TOKEN and ASTRA_DB_API_ENDPOINT"
      );
    }
    client = new DataAPIClient(token);
  }
  return client;
}

/**
 * Get or create the F1 documents collection
 */
export async function getCollection(): Promise<Collection> {
  if (!collection) {
    const { endpoint, collectionName } = getCredentials();
    const astraClient = await getAstraClient();
    const db = astraClient.db(endpoint!);

    // Check if collection exists, create if not
    const collections = await db.listCollections();
    const collectionExists = collections.some(
      (c) => c.name === collectionName
    );

    if (!collectionExists) {
      console.log(`Creating collection: ${collectionName}`);
      collection = await db.createCollection(collectionName, {
        vector: {
          dimension: EMBEDDING_DIMENSION,
          metric: "cosine",
        },
      });
    } else {
      collection = db.collection(collectionName);
    }
  }
  return collection;
}

/**
 * Insert a single document with its embedding
 */
export async function insertDocument(
  document: F1Document,
  embedding: number[]
): Promise<void> {
  const coll = await getCollection();

  await coll.insertOne({
    _id: document.id,
    content: document.content,
    $vector: embedding,
    metadata: document.metadata,
  });
}

/**
 * Insert multiple documents with their embeddings
 */
export async function insertDocuments(
  documents: Array<{ document: F1Document; embedding: number[] }>
): Promise<void> {
  const coll = await getCollection();

  const docsToInsert = documents.map(({ document, embedding }) => ({
    _id: document.id,
    content: document.content,
    $vector: embedding,
    metadata: document.metadata,
  }));

  // Insert in batches of 20
  const batchSize = 20;
  for (let i = 0; i < docsToInsert.length; i += batchSize) {
    const batch = docsToInsert.slice(i, i + batchSize);
    await coll.insertMany(batch);
    console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}`);
  }
}

/**
 * Perform similarity search using vector embedding
 */
export async function similaritySearch(
  queryEmbedding: number[],
  limit: number = 5,
  filter?: Record<string, unknown>
): Promise<Array<{ document: F1Document; score: number }>> {
  const coll = await getCollection();

  const cursor = coll.find(filter || {}, {
    sort: { $vector: queryEmbedding },
    limit,
    includeSimilarity: true,
  });

  const results: Array<{ document: F1Document; score: number }> = [];

  for await (const doc of cursor) {
    results.push({
      document: {
        id: doc._id as string,
        content: doc.content as string,
        metadata: doc.metadata as F1Document["metadata"],
      },
      score: doc.$similarity || 0,
    });
  }

  return results;
}

/**
 * Delete documents by filter
 */
export async function deleteDocuments(
  filter: Record<string, unknown>
): Promise<number> {
  const coll = await getCollection();
  const result = await coll.deleteMany(filter);
  return result.deletedCount;
}

/**
 * Delete document by ID
 */
export async function deleteDocumentById(id: string): Promise<boolean> {
  const coll = await getCollection();
  const result = await coll.deleteOne({ _id: id });
  return result.deletedCount > 0;
}

/**
 * Get document count
 */
export async function getDocumentCount(
  filter?: Record<string, unknown>
): Promise<number> {
  const coll = await getCollection();
  return await coll.countDocuments(filter || {}, 1000);
}

/**
 * Find document by ID
 */
export async function findDocumentById(
  id: string
): Promise<F1Document | null> {
  const coll = await getCollection();
  const doc = await coll.findOne({ _id: id });

  if (!doc) return null;

  return {
    id: doc._id as string,
    content: doc.content as string,
    metadata: doc.metadata as F1Document["metadata"],
  };
}

/**
 * Update document by ID
 */
export async function updateDocument(
  id: string,
  update: Partial<F1Document>,
  embedding?: number[]
): Promise<boolean> {
  const coll = await getCollection();

  const updateObj: Record<string, unknown> = {};
  if (update.content) updateObj.content = update.content;
  if (update.metadata) updateObj.metadata = update.metadata;
  if (embedding) updateObj.$vector = embedding;

  const result = await coll.updateOne({ _id: id }, { $set: updateObj });
  return result.modifiedCount > 0;
}

/**
 * Check if collection has documents
 */
export async function hasDocuments(): Promise<boolean> {
  const count = await getDocumentCount();
  return count > 0;
}

/**
 * Clear all documents from the collection
 */
export async function clearCollection(): Promise<void> {
  const coll = await getCollection();
  await coll.deleteMany({});
  console.log("Collection cleared");
}
