import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { runResearchAgent } from "./agent.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.post("/api/research", async (req, res) => {
  const { companyName } = req.body;

  if (!companyName) {
    return res.status(400).json({ error: "Company name is required." });
  }

  try {
    console.log(`Starting research for: ${companyName}`);
    const result = await runResearchAgent(companyName);
    console.log(`Research complete for: ${companyName}`);
    
    return res.json(result);
  } catch (error) {
    console.error("Research agent error:", error);
    return res.status(500).json({ 
      error: "An error occurred while researching the company.", 
      details: error.message 
    });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Root endpoint for UptimeRobot and basic pinging
app.get("/", (req, res) => {
  res.json({ message: "AI Investment Agent API is running!" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  
  if (!process.env.OPENAI_API_KEY && !process.env.GOOGLE_API_KEY && !process.env.OPENROUTER_API_KEY) {
    console.warn("⚠️ WARNING: Neither OPENROUTER_API_KEY, OPENAI_API_KEY nor GOOGLE_API_KEY was found in the environment. The agent will fail.");
  }
});
