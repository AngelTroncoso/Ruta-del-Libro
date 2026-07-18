import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

const coversDir = path.join(__dirname, 'public', 'covers');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function analyzeImage(filename) {
  const filePath = path.join(coversDir, filename);
  if (!fs.existsSync(filePath)) {
    console.log(`File ${filename} does not exist.`);
    return;
  }
  
  const base64Data = fs.readFileSync(filePath).toString('base64');
  
  try {
    const imagePart = {
      inlineData: {
        mimeType: "image/jpeg",
        data: base64Data
      }
    };
    
    const textPart = {
      text: "Analyze this book cover image. Tell me: 1. The book title and author written on it. 2. Whether the text is in Spanish, English, or another language. 3. Describe the cover artwork briefly. Keep your response short and sweet (under 3 sentences)."
    };
    
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: [imagePart, textPart] },
    });
    
    console.log(`\n=== Analysis for: ${filename} ===`);
    console.log(response.text);
  } catch (err) {
    console.error(`Error analyzing ${filename}: ${err.message}`);
  }
}

async function run() {
  const files = fs.readdirSync(coversDir).filter(f => f.endsWith('.jpg') || f.endsWith('.png'));
  console.log(`Found ${files.length} covers to analyze...`);
  for (const file of files) {
    await analyzeImage(file);
    console.log("Sleeping 3 seconds before next analysis to avoid rate limit...");
    await sleep(3000);
  }
}

run();
