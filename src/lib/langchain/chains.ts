import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { AIMessage, HumanMessage, BaseMessage } from "@langchain/core/messages";
import { RAG_PROMPT, formatContextFromDocuments } from "./prompts";
import { hybridRetrieve, RetrievalResult } from "./retriever";
import { SourceReference } from "@/types";

// Initialize the LLM with Google Gemini
const llm = new ChatGoogleGenerativeAI({
  model: process.env.GOOGLE_MODEL || "gemini-1.5-pro",
  temperature: 0.7,
  streaming: true,
  apiKey: process.env.GOOGLE_API_KEY,
});

export interface ChatInput {
  question: string;
  chatHistory?: BaseMessage[];
}

export interface ChatOutput {
  answer: string;
  sources: SourceReference[];
  retrievalResult: RetrievalResult;
}

/**
 * Create the RAG chain for F1 chatbot
 */
export function createRAGChain() {
  return RunnableSequence.from([
    // Format inputs
    {
      context: async (input: ChatInput) => {
        const retrieval = await hybridRetrieve(input.question);
        return formatContextFromDocuments(
          retrieval.documents.map((d) => ({
            content: d.content,
            metadata: d.metadata,
          }))
        );
      },
      question: (input: ChatInput) => input.question,
      chat_history: (input: ChatInput) => input.chatHistory || [],
    },
    // Generate response
    RAG_PROMPT,
    llm,
    new StringOutputParser(),
  ]);
}

/**
 * Process a chat message with RAG
 */
export async function processMessage(
  question: string,
  chatHistory: BaseMessage[] = []
): Promise<ChatOutput> {
  // Retrieve relevant documents
  const retrievalResult = await hybridRetrieve(question);

  // Format context
  const context = formatContextFromDocuments(
    retrievalResult.documents.map((d) => ({
      content: d.content,
      metadata: d.metadata,
    }))
  );

  // Generate response
  const response = await llm.invoke([
    {
      role: "system",
      content: `You are an expert Formula 1 assistant with comprehensive knowledge about F1 racing.

Current context from F1 knowledge base:
${context}

Guidelines:
- Always prioritize information from the provided context
- Be precise with statistics and facts
- Be conversational and engaging
- If the context doesn't contain enough information, acknowledge this`,
    },
    ...chatHistory.map((msg) => ({
      role: msg._getType() === "human" ? "user" as const : "assistant" as const,
      content: msg.content as string,
    })),
    {
      role: "user",
      content: question,
    },
  ]);

  // Extract sources
  const sources: SourceReference[] = retrievalResult.documents.map((doc, i) => ({
    title: doc.metadata.title || doc.metadata.source,
    source: doc.metadata.source,
    url: doc.metadata.url,
    relevanceScore: retrievalResult.scores[i],
  }));

  return {
    answer: response.content as string,
    sources,
    retrievalResult,
  };
}

/**
 * Stream a chat response with RAG
 */
export async function* streamMessage(
  question: string,
  chatHistory: BaseMessage[] = []
): AsyncGenerator<string> {
  // Retrieve relevant documents
  const retrievalResult = await hybridRetrieve(question);

  // Format context
  const context = formatContextFromDocuments(
    retrievalResult.documents.map((d) => ({
      content: d.content,
      metadata: d.metadata,
    }))
  );

  // Stream response
  const stream = await llm.stream([
    {
      role: "system",
      content: `You are an expert Formula 1 assistant with comprehensive knowledge about F1 racing.

Current context from F1 knowledge base:
${context}

Guidelines:
- Always prioritize information from the provided context
- Be precise with statistics and facts
- Be conversational and engaging
- If the context doesn't contain enough information, acknowledge this`,
    },
    ...chatHistory.map((msg) => ({
      role: msg._getType() === "human" ? "user" as const : "assistant" as const,
      content: msg.content as string,
    })),
    {
      role: "user",
      content: question,
    },
  ]);

  for await (const chunk of stream) {
    if (chunk.content) {
      yield chunk.content as string;
    }
  }
}

/**
 * Convert message history to LangChain format
 */
export function formatChatHistory(
  messages: Array<{ role: string; content: string }>
): BaseMessage[] {
  return messages.map((msg) => {
    if (msg.role === "user") {
      return new HumanMessage(msg.content);
    } else {
      return new AIMessage(msg.content);
    }
  });
}
