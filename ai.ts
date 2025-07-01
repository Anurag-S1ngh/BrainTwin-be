import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function AIResponse(content: any, query: string) {
  // Extract chunk_texts
  const textChunks = content
    .map((item: any) => item.fields?.chunk_text)
    .filter(Boolean)
    .join("\n\n");

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: `
You are an AI assistant. Use the following retrieved information to answer the user's question as accurately as possible.

Retrieved Information:
${textChunks}

User's Question:
${query}


Instructions:
- If the retrieved information clearly answers the user's question, provide a clear, helpful, and concise answer.
- If the user's question does not match the retrieved information or no relevant information is found, say: "This information does not relate to your question."
- Do not summarize any unrelated content.
- Do not mention that the content was retrieved from a database.
`,
  });

  return response.text;
}
