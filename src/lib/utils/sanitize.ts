/**
 * Sanitize text content for embedding
 */
export function sanitizeText(text: string): string {
  return text
    // Remove excessive whitespace
    .replace(/\s+/g, " ")
    // Remove special characters that might cause issues
    .replace(/[\x00-\x1F\x7F]/g, "")
    // Normalize quotes
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    // Remove URLs (they don't help with semantic search)
    .replace(/https?:\/\/[^\s]+/g, "[URL]")
    // Normalize dashes
    .replace(/[–—]/g, "-")
    // Trim
    .trim();
}

/**
 * Clean HTML content
 */
export function cleanHtml(html: string): string {
  return html
    // Remove script and style tags
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    // Remove HTML tags
    .replace(/<[^>]+>/g, " ")
    // Decode HTML entities
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    // Clean up whitespace
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Normalize F1-specific terms for better matching
 */
export function normalizeF1Terms(text: string): string {
  const replacements: Record<string, string> = {
    "Formula 1": "Formula 1 F1",
    "Formula One": "Formula 1 F1",
    "Grand Prix": "Grand Prix GP",
    "World Championship": "World Championship WDC WCC",
    "pole position": "pole position P1 first place qualifying",
    "fastest lap": "fastest lap FL",
    "pit stop": "pit stop pitstop pits",
    "DRS": "DRS Drag Reduction System",
    "DNF": "DNF Did Not Finish",
    "DNS": "DNS Did Not Start",
  };

  let normalized = text;
  for (const [term, replacement] of Object.entries(replacements)) {
    const regex = new RegExp(term, "gi");
    normalized = normalized.replace(regex, replacement);
  }

  return normalized;
}

/**
 * Extract and format date from various formats
 */
export function parseDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split("T")[0];
    }
  } catch {
    // Fall through
  }
  return new Date().toISOString().split("T")[0];
}
