import { ChatOpenAI } from "@langchain/openai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { search } from "duck-duck-scrape";

// Factory function to get the available LLM based on environment variables
const getLLM = () => {
  if (process.env.OPENROUTER_API_KEY) {
    console.log("Using OpenRouter as the LLM provider:", process.env.OPENROUTER_MODEL);
    return new ChatOpenAI({
      modelName: process.env.OPENROUTER_MODEL || "meta-llama/llama-3-8b-instruct",
      temperature: 0.2,
      apiKey: process.env.OPENROUTER_API_KEY,
      configuration: {
        baseURL: "https://openrouter.ai/api/v1",
      },
    });
  } else if (process.env.OPENAI_API_KEY) {
    console.log("Using OpenAI as the LLM provider.");
    return new ChatOpenAI({
      modelName: "gpt-4o",
      temperature: 0.2,
      modelKwargs: {
        response_format: { type: "json_object" },
      },
    });
  } else if (process.env.GOOGLE_API_KEY) {
    console.log("Using Google Gemini as the LLM provider.");
    return new ChatGoogleGenerativeAI({
      modelName: "gemini-1.5-pro-latest",
      temperature: 0.2,
    });
  } else {
    throw new Error(
      "No LLM API key found. Please set OPENROUTER_API_KEY, OPENAI_API_KEY, or GOOGLE_API_KEY in the backend/.env file."
    );
  }
};

const gatherResearch = async (companyName) => {
  try {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json'
    };
    const response = await fetch(`https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(companyName)}`, { headers });
    const data = await response.json();
    
    // Validate if the company exists by checking if Yahoo Finance returned any quotes
    if (!data.quotes || data.quotes.length === 0) {
      throw new Error(`Company "${companyName}" not found. Please enter a valid public company or stock ticker.`);
    }
    
    const primaryQuote = data.quotes.find(q => q.quoteType === 'EQUITY') || data.quotes[0];
    const ticker = primaryQuote.symbol;
    
    // Filter out generic trending news by ensuring the news is actually linked to the company's ticker
    const relevantNews = (data.news || []).filter(article => 
      article.relatedTickers && article.relatedTickers.includes(ticker)
    );

    if (relevantNews.length === 0) {
      throw new Error(`No recent financial news found specifically for "${companyName}" (${ticker}).`);
    }

    // Take the top 5 news results for context
    const topNews = relevantNews.slice(0, 5);
    
    const context = topNews
      .map((res, index) => `[Source ${index + 1}: ${res.title}]\nURL: ${res.link}\nSummary: ${res.publisher}`)
      .join("\n\n");
      
    const sources = topNews.map(res => ({ title: res.title, url: res.link }));
    
    // Fetch market data
    let marketData = null;
    try {
      const chartResponse = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?range=1mo&interval=1d`, { headers });
      const chartData = await chartResponse.json();
      
      if (chartData.chart && chartData.chart.result && chartData.chart.result.length > 0) {
        const result = chartData.chart.result[0];
        const timestamps = result.timestamp || [];
        const closes = result.indicators.quote[0].close || [];
        
        // Format the chart data
        const history = timestamps.map((ts, i) => {
          const date = new Date(ts * 1000);
          return {
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            price: closes[i] ? Number(closes[i].toFixed(2)) : null
          };
        }).filter(item => item.price !== null);
        
        const currentPrice = result.meta.regularMarketPrice;
        
        // Handle change metrics safely
        const previousClose = result.meta.chartPreviousClose || currentPrice;
        const change = currentPrice - previousClose;
        const changePercent = previousClose ? (change / previousClose) * 100 : 0;
        
        marketData = {
          ticker: ticker,
          currentPrice: Number(currentPrice.toFixed(2)),
          change: Number(change.toFixed(2)),
          changePercent: Number(changePercent.toFixed(2)),
          history: history
        };
      }
    } catch (err) {
      console.error("Failed to fetch chart data:", err);
    }
    
    return { context, sources, marketData };
  } catch (error) {
    console.error("Error during web search:", error);
    throw new Error(error.message || "Failed to gather research data for the company.");
  }
};

/**
 * Main function to run the research agent
 * @param {string} companyName
 * @returns {Promise<any>}
 */
export const runResearchAgent = async (companyName) => {
  const { context, sources, marketData } = await gatherResearch(companyName);

  const prompt = PromptTemplate.fromTemplate(`
You are an expert AI Investment Research Agent. Your task is to analyze the following recent information about a company and make a calculated investment decision.

Company Name: {companyName}

Research Context (Recent Web Search Results):
{context}

Based on the research above, decide whether to "Invest" or "Pass" on this company.
Provide a detailed reasoning for your decision in Markdown format. Be analytical, considering market trends, recent news, and financial indicators mentioned in the context. If the context doesn't have enough solid financial data, be conservative.

You must respond ONLY with a valid JSON object in the following format. 
IMPORTANT: Your JSON must be strictly valid. Do NOT include literal newline characters inside the "reasoning" string. Use the literal characters "\\n" if you need a line break.
{{
  "decision": "Invest" | "Pass",
  "reasoning": "Your detailed reasoning here (use \\n for line breaks)."
}}
`);

  const model = getLLM();
  const parser = new StringOutputParser();

  const chain = RunnableSequence.from([
    prompt,
    model,
    parser
  ]);

  const resultString = await chain.invoke({
    companyName: companyName,
    context: context,
  });

  try {
    console.log("Raw LLM Output:\n", resultString);
    
    // Extract JSON object using regex to handle extra conversational text
    const match = resultString.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON object found in the response.");
    
    let jsonString = match[0];
    
    // Sanitize literal newlines and control characters that break JSON.parse
    jsonString = jsonString.replace(/[\n\r\t]/g, " ");
    
    console.log("Extracted JSON String:\n", jsonString);
    
    const parsedResult = JSON.parse(jsonString);
    
    return {
      decision: parsedResult.decision,
      reasoning: parsedResult.reasoning,
      sources: sources,
      marketData: marketData
    };
  } catch (error) {
    console.error("Failed to parse LLM output:", error);
    throw new Error("The AI agent failed to return a valid structured response.");
  }
};
