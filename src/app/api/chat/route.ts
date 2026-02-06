import { streamText } from "ai";
import { google } from "@ai-sdk/google";
import { hybridRetrieve } from "@/lib/langchain/retriever";
import { formatContextFromDocuments } from "@/lib/langchain/prompts";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Get the latest user message
    const latestMessage = messages[messages.length - 1];

    if (!latestMessage || latestMessage.role !== "user") {
      return new Response("No user message provided", { status: 400 });
    }

    const question = latestMessage.content;

    // Retrieve relevant documents
    let context = "No specific context available. Using general F1 knowledge.";

    try {
      const retrievalResult = await hybridRetrieve(question, 5);

      if (retrievalResult.documents.length > 0) {
        context = formatContextFromDocuments(
          retrievalResult.documents.map((d) => ({
            content: d.content,
            metadata: d.metadata,
          }))
        );
      }
    } catch (retrievalError) {
      console.error("Retrieval error:", retrievalError);
      // Continue with default context
    }

    // Create system message with context
    const systemMessage = `You are an expert Formula 1 assistant with comprehensive knowledge about F1 racing, including current and historical data about races, drivers, teams, circuits, regulations, and statistics.

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
${context}

Remember: You're helping F1 fans and enthusiasts get accurate information about their favorite sport. Be enthusiastic but accurate!`;

    // Stream the response using Vercel AI SDK with Gemini
    const result = streamText({
      model: google("gemini-2.5-flash"),
      system: systemMessage,
      messages: messages.slice(0, -1).concat([
        { role: "user", content: question },
      ]),
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process message" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
