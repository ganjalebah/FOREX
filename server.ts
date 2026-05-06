import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { generateSignalConsensus } from "./src/services/orchestrator.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Startup diagnostics
  const geminiAvailable = !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);
  const anthropicAvailable = !!process.env.ANTHROPIC_API_KEY;
  console.log(`[AI DIANOSTICS] Gemini: ${geminiAvailable ? 'PRE-CONFIGURED' : 'MISSING'}, Anthropic: ${anthropicAvailable ? 'PRE-CONFIGURED' : 'MISSING'}`);

  // API Routes
  app.post("/api/generate-signal", async (req, res) => {
    try {
      const { 
        pair, currentPrice, recentTrend, language, twelveDataKey, puterOpinion,
        customGeminiKey, customAnthropicKey
      } = req.body;
      
      const signal = await generateSignalConsensus(
        pair,
        currentPrice,
        recentTrend,
        language,
        twelveDataKey,
        puterOpinion,
        customGeminiKey,
        customAnthropicKey
      );
      
      res.json(signal);
    } catch (error: any) {
      console.warn("API Error - generate-signal:", error.message);
      res.status(500).json({ 
        error: "Failed to generate signal",
        message: error.message 
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production static files
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
