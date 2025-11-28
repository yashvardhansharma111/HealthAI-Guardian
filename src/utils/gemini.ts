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
    if (typeof raw === "string") {
      try {
        // Remove markdown code blocks if present
        let cleaned = raw
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "")
          .replace(/\,(?!\s*?[{\[\"'\w])/g, "") // trailing commas
          .replace(/\n/g, " ")
          .trim();

        // Try to parse as JSON
        return JSON.parse(cleaned);
      } catch (parseError: any) {
        // If parsing fails, return the raw string and let the caller handle it
        console.error("Failed to parse Gemini response:", parseError?.message || parseError);
        return raw;
      }
    } else if (typeof raw === "object") {
      // Already an object, return as is
      return raw;
    } else {
      // Convert to string and try parsing
      try {
        return JSON.parse(String(raw));
      } catch {
        return raw;
      }
    }
  } catch (err: any) {
    console.error("Gemini API Error:", err?.response?.data || err?.message || err);
    throw new Error("Gemini request failed");
  }
}
