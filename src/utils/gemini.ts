import axios from "axios";
import https from "https";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const agent = new https.Agent({ rejectUnauthorized: false });

export async function generateWithGemini(prompt: string) {
  if (!GEMINI_API_KEY) throw new Error("Missing Gemini API Key");

  const model = "models/gemini-2.5-flash";

  const url = `https://generativelanguage.googleapis.com/v1/${model}:generateContent?key=${GEMINI_API_KEY}`;

  const fullPrompt = `
You must return ONLY valid JSON. 
Do not wrap output in markdown or code blocks.
Do not add explanations.
Do not include extra keys.

${prompt}
`;

  const payload = {
    contents: [
      {
        parts: [{ text: fullPrompt }],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      topP: 0.9,
      topK: 40,
    },
  };

  try {
    const res = await axios.post(url, payload, {
      httpsAgent: agent,
      headers: { "Content-Type": "application/json" },
    });

    const raw =
      res.data.candidates?.[0]?.content?.parts?.[0]?.text ??
      res.data.candidates?.[0]?.text ??
      res.data.text ??
      res.data.output ??
      res.data;

    // Try parsing. If Gemini outputs weird JSON, fix common issues.
    try {
      return typeof raw === "string" ? raw : JSON.stringify(raw);
    } catch {
      // Fallback auto-fix: remove trailing commas etc.
      const cleaned = raw
        .replace(/\,(?!\s*?[{\[\"'\w])/g, "") // trailing commas
        .replace(/\n/g, "")
        .trim();

      return JSON.parse(cleaned);
    }
  } catch (err) {
    console.error("Gemini API Error:", err.response?.data || err.message);
    throw new Error("Gemini request failed");
  }
}
