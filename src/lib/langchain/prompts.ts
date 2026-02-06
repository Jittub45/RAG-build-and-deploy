import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";

/**
 * System prompt for the F1 chatbot
 */
export const F1_SYSTEM_PROMPT = `You are an expert Formula 1 assistant with comprehensive knowledge about F1 racing, including current and historical data about races, drivers, teams, circuits, regulations, and statistics.

Your role is to:
1. Answer questions about Formula 1 accurately and helpfully
2. Use the provided context to give informed, up-to-date responses
3. Cite your sources when providing specific facts or statistics
4. Acknowledge when you're not certain about something
5. Be conversational and engaging while maintaining accuracy

Guidelines:
- Always prioritize information from the provided context
- When discussing statistics, mention the source and date if available
- If the context doesn't contain enough information, say so and provide what general knowledge you can
- Format responses clearly with bullet points or numbered lists when appropriate
- For race results, standings, and statistics, be precise with numbers
- Explain F1 terminology when it might not be clear to casual fans

Current context from F1 knowledge base:
{context}

Remember: You're helping F1 fans and enthusiasts get accurate information about their favorite sport. Be enthusiastic but accurate!`;

/**
 * Prompt template for RAG chain
 */
export const RAG_PROMPT = ChatPromptTemplate.fromMessages([
  ["system", F1_SYSTEM_PROMPT],
  new MessagesPlaceholder("chat_history"),
  ["human", "{question}"],
]);

/**
 * Condense question prompt for follow-up questions
 */
export const CONDENSE_QUESTION_PROMPT = ChatPromptTemplate.fromTemplate(`
Given the following conversation history and a follow-up question, rephrase the follow-up question to be a standalone question that captures the full context needed to answer it.

Chat History:
{chat_history}

Follow-up Question: {question}

Standalone Question:`);

/**
 * Simple QA prompt without history
 */
export const SIMPLE_QA_PROMPT = ChatPromptTemplate.fromMessages([
  ["system", F1_SYSTEM_PROMPT],
  ["human", "{question}"],
]);

/**
 * Prompt for generating source citations
 */
export const SOURCE_CITATION_PROMPT = `
Based on the context provided, include relevant source citations in your response.
Format citations as: [Source: {source_name}]

If multiple sources are used, cite each one where the information is referenced.
`;

/**
 * Prompt for handling out-of-scope questions
 */
export const OUT_OF_SCOPE_RESPONSE = `I'm specifically designed to answer questions about Formula 1 racing. This includes:
- Race results and statistics
- Driver and team information
- Circuit details
- F1 regulations and rules
- Historical F1 data
- Current season updates

If you have any F1-related questions, I'd be happy to help! 🏎️`;

/**
 * Generate context string from retrieved documents
 */
export function formatContextFromDocuments(
  documents: Array<{ content: string; metadata: { source: string; title?: string } }>
): string {
  if (documents.length === 0) {
    return "No specific context available. Using general F1 knowledge.";
  }

  return documents
    .map((doc, index) => {
      const source = doc.metadata.title || doc.metadata.source;
      return `[Source ${index + 1}: ${source}]\n${doc.content}`;
    })
    .join("\n\n---\n\n");
}
