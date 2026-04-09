import { GoogleGenerativeAI } from "@google/generative-ai";
const dotenv = require("dotenv");
import path from "path";

// Load from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function checkAccess() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("No API key found in .env.local");
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    console.log("Fetching available models...");
    // Direct fetch since SDK might not have a clean listModels exposed in all versions
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    
    if (data.error) {
       console.error("API Error:", data.error);
       return;
    }

    console.log("Supported Models for your API Key:");
    data.models.forEach((m: any) => {
      console.log(`- ${m.name} (${m.supportedGenerationMethods.join(", ")})`);
    });
  } catch (err) {
    console.error("Connection failed:", err);
  }
}

checkAccess();
