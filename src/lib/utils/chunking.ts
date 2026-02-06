/**
 * Split text into chunks with overlap for better retrieval
 */
export function chunkText(
  text: string,
  chunkSize: number = 1000,
  overlap: number = 200
): string[] {
  const chunks: string[] = [];

  // Split by paragraphs first
  const paragraphs = text.split(/\n\n+/);

  let currentChunk = "";

  for (const paragraph of paragraphs) {
    // If adding this paragraph would exceed chunk size
    if (currentChunk.length + paragraph.length > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());

      // Start new chunk with overlap from previous
      const words = currentChunk.split(/\s+/);
      const overlapWords = words.slice(-Math.floor(overlap / 5)); // Approximate word count for overlap
      currentChunk = overlapWords.join(" ") + "\n\n" + paragraph;
    } else {
      currentChunk += (currentChunk ? "\n\n" : "") + paragraph;
    }
  }

  // Don't forget the last chunk
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

/**
 * Split text by sentences with maximum chunk size
 */
export function chunkBySentences(
  text: string,
  maxChunkSize: number = 1000,
  minChunkSize: number = 200
): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks: string[] = [];
  let currentChunk = "";

  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();

    if (currentChunk.length + trimmedSentence.length > maxChunkSize) {
      if (currentChunk.length >= minChunkSize) {
        chunks.push(currentChunk.trim());
        currentChunk = trimmedSentence;
      } else {
        currentChunk += " " + trimmedSentence;
      }
    } else {
      currentChunk += (currentChunk ? " " : "") + trimmedSentence;
    }
  }

  if (currentChunk.trim() && currentChunk.length >= minChunkSize) {
    chunks.push(currentChunk.trim());
  } else if (currentChunk.trim() && chunks.length > 0) {
    // Append small remaining chunk to previous
    chunks[chunks.length - 1] += " " + currentChunk.trim();
  } else if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

/**
 * Smart chunking that preserves semantic boundaries
 */
export function smartChunk(
  text: string,
  options: {
    maxSize?: number;
    minSize?: number;
    overlap?: number;
    preserveHeaders?: boolean;
  } = {}
): string[] {
  const {
    maxSize = 1000,
    minSize = 200,
    overlap = 100,
    preserveHeaders = true,
  } = options;

  const chunks: string[] = [];
  const lines = text.split("\n");
  let currentChunk = "";
  let currentHeader = "";

  for (const line of lines) {
    const isHeader = preserveHeaders && /^#+\s|^[A-Z][^.]*:$/.test(line.trim());

    if (isHeader) {
      // Save current chunk if it exists
      if (currentChunk.trim().length >= minSize) {
        chunks.push(currentChunk.trim());
        currentChunk = "";
      }
      currentHeader = line.trim();
      currentChunk = currentHeader + "\n";
    } else if (currentChunk.length + line.length > maxSize && currentChunk.length >= minSize) {
      // Chunk is full
      chunks.push(currentChunk.trim());

      // Start new chunk with overlap
      const overlapText = currentChunk.slice(-overlap);
      currentChunk = (currentHeader ? currentHeader + "\n" : "") + overlapText + line + "\n";
    } else {
      currentChunk += line + "\n";
    }
  }

  // Add remaining content
  if (currentChunk.trim().length >= minSize) {
    chunks.push(currentChunk.trim());
  } else if (currentChunk.trim() && chunks.length > 0) {
    chunks[chunks.length - 1] += "\n" + currentChunk.trim();
  } else if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}
