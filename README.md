# AI Investment Agent 📈

A modern, full-stack AI-powered investment research agent. Enter any publicly traded company, and the agent will fetch real-time market data, analyze the latest financial news using Large Language Models (LLMs), and provide a calculated "Invest" or "Pass" recommendation.

## Features

- **Real-Time Data**: Automatically fetches live stock prices, 1-day change, and historical 1-month market data from Yahoo Finance.
- **AI Financial Analysis**: Integrates with LangChain and Llama 3.1 (via OpenRouter) to read and analyze up-to-date news articles to make an informed investment decision.
- **Glassmorphic UI**: A stunning, premium frontend built with React, featuring ambient dynamic background orbs and sleek glass panels.
- **Interactive Dashboards**: Data visualizations powered by `recharts`, rendering dynamic area charts that glow green for positive trends and red for negative ones.
- **Persistent History**: Your past searches are saved locally. You can instantly access previous research reports from the side panel.
- **Production Ready**: Configured for 1-click deployments on Vercel (Frontend) and Render (Backend).

## Tech Stack

- **Frontend**: React (Vite), Lucide-React (Icons), Recharts, Vanilla CSS
- **Backend**: Node.js, Express, LangChain
- **APIs**: Yahoo Finance (Market Data & News), OpenRouter (LLM)

---

## Local Setup

### 1. Backend Configuration
1. Navigate to the `backend` directory.
2. Run `npm install` to install dependencies.
3. Create a `.env` file and add your API keys:
   ```env
   PORT=3001
   OPENROUTER_API_KEY=your_openrouter_api_key
   OPENROUTER_MODEL=meta-llama/llama-3.1-8b-instruct
   ```
   *(Alternatively, you can provide `OPENAI_API_KEY` or `GOOGLE_API_KEY`)*
4. Run the backend server using `npm run dev` (starts on port 3001).

### 2. Frontend Configuration
1. Navigate to the `frontend` directory.
2. Run `npm install` to install dependencies.
3. Run the development server using `npm run dev`.

---

## Deployment

This repository is configured for seamless deployment:

- **Frontend (Vercel)**: Connect this repository to Vercel. Ensure you set the Root Directory to `frontend` or allow Vercel to read the provided `vercel.json`. Add the `VITE_API_URL` environment variable pointing to your deployed backend URL.
- **Backend (Render)**: Connect this repository to Render via the Blueprints tab. Render will read the `render.yaml` file and automatically configure your Node web service. Don't forget to add your LLM API keys in the Render dashboard!
