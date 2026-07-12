# Industry Investment Chatbot 📈

**Deployed Link:** [https://industry-inverstment-chatbot.vercel.app/](https://industry-inverstment-chatbot.vercel.app/)

## Overview
The Industry Investment Chatbot is a modern, full-stack AI-powered investment research agent. You can enter any publicly traded company, and the agent will automatically fetch real-time market data, aggregate the latest financial news, and use Large Language Models (LLMs) to synthesize the information. The AI then outputs a calculated "Invest" or "Pass" recommendation with detailed reasoning.

## How to Run It

### Prerequisites
- Node.js installed on your machine
- API Keys for one of the following: OpenRouter, OpenAI, or Google Gemini.

### 1. Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` folder and add your API keys. The app supports multiple providers:
   ```env
   PORT=3001
   
   # Option 1: OpenRouter (Default in code if provided)
   OPENROUTER_API_KEY=your_openrouter_api_key
   OPENROUTER_MODEL=meta-llama/llama-3.1-8b-instruct
   
   # Option 2: OpenAI
   OPENAI_API_KEY=your_openai_api_key
   
   # Option 3: Google Gemini
   GOOGLE_API_KEY=your_google_api_key
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```

## How It Works (Approach & Architecture)
The application follows a decoupled **Client-Server architecture**.

- **Frontend (React + Vite):** A responsive, glassmorphic UI utilizing `recharts` for dynamic financial data visualization. It sends search requests to the backend and renders the returned JSON data. It also persists search history in local storage.
- **Backend (Node.js + Express):** The RESTful API that coordinates the AI agent's logic.
- **Agent Logic:** The core `agent.js` script manages the research workflow. 
  1. It first makes REST calls to Yahoo Finance to resolve the company ticker, fetch historical pricing data, and scrape the most recent relevant news headlines. 
  2. It then uses **LangChain** to format a system prompt incorporating the news context.
  3. The prompt is passed to the LLM (via OpenRouter/OpenAI/Gemini) enforcing a strict JSON output format (`StringOutputParser` is used and validated). 
  4. The structured output (Decision + Reasoning) is bundled with market data and returned to the client.

## Key Decisions & Trade-offs
- **Yahoo Finance vs. Premium APIs:** I chose Yahoo Finance for retrieving real-time stock quotes and news context. **Trade-off:** While it's free and doesn't require API keys for the end-user to set up, it relies on undocumented endpoints which could break or rate-limit. For a production-ready enterprise app, a paid data provider (like Alpaca or Polygon.io) would be more reliable.
- **LangChain Integration:** I decided to use LangChain. **Trade-off:** LangChain introduces some overhead, but it creates a flexible foundation. It allowed me to easily implement a dynamic LLM factory (`getLLM()`) so the application can gracefully switch between OpenRouter, OpenAI, or Gemini depending on which API key the user provides.
- **No Database:** I intentionally left out a database for storing user history to keep the app lightweight and easy to run locally. **Trade-off:** Search history is only saved in the browser's local storage. This is excellent for a demo/take-home assignment, but means users lose their history if they switch devices.

## Example Runs

### 1. NVIDIA (NVDA)
- **Decision:** Invest
- **Reasoning:** Nvidia continues to dominate the AI chip market. Recent news indicates massive revenue growth in their data center segment, far exceeding analyst expectations. Despite the high valuation multiples, the forward-looking demand for their next-generation Blackwell architecture solidifies their market position and offers strong upside potential.

### 2. GameStop (GME)
- **Decision:** Pass
- **Reasoning:** The recent news emphasizes high volatility driven by retail trading sentiment rather than fundamental financial improvements. The company's core retail business continues to struggle with declining revenue. Without clear, sustainable profitability, the risk-to-reward ratio is too speculative for a conservative investment strategy.

## What I Would Improve With More Time
1. **Multi-Agent Architecture:** I would implement a LangGraph workflow with multiple agents (e.g., a "Fundamental Analyst" agent, a "Technical Analyst" agent, and a "Risk Manager" agent) that debate before reaching a final consensus.
2. **Database Integration:** Add PostgreSQL/Supabase to store user accounts, portfolios, and globally cache research reports to save on LLM API costs.
3. **Automated Testing:** Implement Jest for backend API testing and Cypress for frontend end-to-end testing to ensure the app is robust before deployments.
4. **More Data Sources:** Incorporate SEC filings, earning call transcripts, and sentiment analysis on social media platforms (like Reddit/X) for a more comprehensive analysis.

## BONUS: LLM Chat Logs
As requested for the bonus points, I've included the complete LLM chat session transcripts from the building and configuration phases of this project. You can find them in the `llm_logs` directory in this repository. They offer a deep dive into the reasoning and step-by-step development process of this application!
