# Deep Agent quickstart

A small TypeScript research agent based on LangChain's Deep Agents quickstart. It uses Gemini 3.8 Flash with Google's built-in Search grounding, so it does not need a separate search API key or Tavily.

## Setup

1. Use Node.js 22 or newer.
2. Copy `.env.example` to `.env` and set `GOOGLE_API_KEY` to your Gemini API key. `GEMINI_API_KEY` is also accepted.
3. Install dependencies and run the sample:

   ```bash
   npm install
   npm start
   ```

Pass a different research question as an argument:

```bash
npm start -- "How does static analysis find security vulnerabilities?"
```

The default question is “What is LangGraph?”. The API key stays in the local, git-ignored `.env` file. Gemini API free-tier availability and limits depend on your region and Google account; check Google's current pricing and usage pages.
