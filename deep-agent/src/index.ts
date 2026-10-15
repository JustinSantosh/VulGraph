import "dotenv/config";
import { createDeepAgent } from "deepagents";

const apiKey = process.env.GOOGLE_API_KEY ?? process.env.GEMINI_API_KEY;

// The LangChain Google provider reads GOOGLE_API_KEY. Accept GEMINI_API_KEY too
// so keys copied from Google AI Studio work without renaming the .env entry.
if (apiKey) process.env.GOOGLE_API_KEY = apiKey;

if (!apiKey) {
  console.error(
    "Missing GOOGLE_API_KEY. Copy .env.example to .env and add your Gemini API key.",
  );
  process.exitCode = 1;
} else {
  const researchInstructions = `You are an expert researcher. Research the user's question and write a clear, well-organized report. Use web search as your primary way to gather current information. Cite source URLs in your report and distinguish confirmed facts from uncertainty.`;

  const agent = createDeepAgent({
    model: "google:gemini-3.8-flash",
    tools: [{ googleSearch: {} }],
    systemPrompt: researchInstructions,
  });

  const question = process.argv.slice(2).join(" ") || "What is LangGraph?";
  const result = await agent.invoke({
    messages: [{ role: "user", content: question }],
  });
  const answer = result.messages.at(-1)?.content;

  console.log(typeof answer === "string" ? answer : JSON.stringify(answer, null, 2));
}
