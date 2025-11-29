/**
 * Groq RAG Service
 * Retrieval-Augmented Generation using Groq API
 */

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.1-70b-versatile";

interface RAGContext {
  userId: string;
  diseaseType?: "alzheimers" | "dementia" | "stress" | "depression" | "diabetes" | "heart";
  timeRange?: {
    start: Date;
    end: Date;
  };
  limit?: number;
}

interface RAGQuery {
  query: string;
  context: RAGContext;
}

/**
 * Generate RAG-based response using Groq
 */
export async function generateRAGResponse(
  query: string,
  context: RAGContext,
  retrievedDocs: any[]
): Promise<string> {
  if (!GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not set");
  }

  // Format retrieved documents for context
  const contextText = formatRetrievedDocs(retrievedDocs, context.diseaseType);

  const systemPrompt = getSystemPrompt(context.diseaseType);
  const userPrompt = `${query}\n\nContext from previous sessions:\n${contextText}`;

  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(`Groq API error: ${error.error?.message || JSON.stringify(error)}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "No response generated";
  } catch (error: any) {
    console.error("Groq RAG error:", error);
    throw error;
  }
}

/**
 * Generate personalized health report
 */
export async function generateHealthReport(
  userId: string,
  retrievedDocs: any[],
  diseaseType?: RAGContext["diseaseType"]
): Promise<string> {
  const query = `Generate a comprehensive health report analyzing the user's cognitive performance, stress levels, and health metrics. Compare current performance with historical data and provide actionable recommendations.`;
  
  return generateRAGResponse(query, { userId, diseaseType }, retrievedDocs);
}

/**
 * Generate personalized game/module suggestions
 */
export async function generateGameSuggestions(
  userId: string,
  retrievedDocs: any[],
  riskProfile: {
    alzheimers?: number;
    dementia?: number;
    stress?: number;
    depression?: number;
    diabetes?: number;
    heart?: number;
  }
): Promise<{
  suggestedGames: string[];
  reasoning: string;
  priority: "high" | "medium" | "low";
}> {
  const riskText = Object.entries(riskProfile)
    .map(([key, value]) => `${key}: ${(value * 100).toFixed(1)}%`)
    .join(", ");

  const query = `Based on the user's risk profile (${riskText}) and historical performance data, suggest which cognitive games and modules would be most beneficial. Consider:
- Attention & Memory games for Alzheimer's risk
- Executive Function & Visuospatial games for Dementia risk
- Questionnaires for Stress & Depression assessment
- Health monitoring for Diabetes and Heart disease

Provide specific game recommendations with reasoning.`;

  const response = await generateRAGResponse(
    query,
    { userId },
    retrievedDocs
  );

  // Parse response to extract suggestions
  const suggestedGames: string[] = [];
  const reasoning = response;

  // Extract game names from response
  const gameKeywords = [
    "digit span",
    "attention",
    "memory",
    "word list",
    "stroop",
    "executive",
    "visuospatial",
    "mental rotation",
    "questionnaire",
  ];

  gameKeywords.forEach((keyword) => {
    if (response.toLowerCase().includes(keyword)) {
      if (keyword === "digit span") suggestedGames.push("attention_digitspan");
      else if (keyword === "word list" || keyword === "memory")
        suggestedGames.push("memory_wordlist");
      else if (keyword === "stroop" || keyword === "executive")
        suggestedGames.push("executive_stroop");
      else if (keyword === "visuospatial" || keyword === "mental rotation")
        suggestedGames.push("visuospatial_mentalrotation");
      else if (keyword === "questionnaire") suggestedGames.push("questionnaire");
    }
  });

  // Determine priority based on risk profile
  const maxRisk = Math.max(...Object.values(riskProfile).filter((v) => v !== undefined));
  const priority: "high" | "medium" | "low" =
    maxRisk >= 0.7 ? "high" : maxRisk >= 0.4 ? "medium" : "low";

  return {
    suggestedGames: suggestedGames.length > 0 ? suggestedGames : ["attention_digitspan"],
    reasoning,
    priority,
  };
}

/**
 * Generate dynamic questions based on RAG data
 */
export async function generateDynamicQuestions(
  userId: string,
  retrievedDocs: any[],
  count: number = 3
): Promise<string[]> {
  const query = `Based on the user's previous responses and performance patterns, generate ${count} personalized questions that would help assess their current mental health, stress levels, and cognitive function. Make questions specific to their patterns and concerns.`;

  const response = await generateRAGResponse(query, { userId }, retrievedDocs);

  // Extract questions from response
  const questions: string[] = [];
  const lines = response.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    if (
      trimmed &&
      (trimmed.startsWith("-") ||
        trimmed.startsWith("•") ||
        trimmed.match(/^\d+[\.\)]/) ||
        trimmed.endsWith("?"))
    ) {
      const question = trimmed.replace(/^[-•\d\.\)]\s*/, "").trim();
      if (question && question.endsWith("?")) {
        questions.push(question);
      }
    }
  }

  // Fallback questions if parsing fails
  if (questions.length === 0) {
    return [
      "How has your sleep quality been in the past week?",
      "What activities have you found most challenging recently?",
      "How would you describe your current energy levels?",
    ];
  }

  return questions.slice(0, count);
}

function formatRetrievedDocs(docs: any[], diseaseType?: string): string {
  if (docs.length === 0) {
    return "No previous data available.";
  }

  const formatted = docs.map((doc, idx) => {
    const date = doc.timestamp ? new Date(doc.timestamp).toLocaleDateString() : "Unknown date";
    
    if (doc.gameType) {
      return `[${idx + 1}] Game: ${doc.gameType}, Accuracy: ${doc.accuracy || "N/A"}, Date: ${date}`;
    } else if (doc.questionText) {
      return `[${idx + 1}] Question: ${doc.questionText}, Answer: ${doc.answer?.substring(0, 100) || "N/A"}, Date: ${date}`;
    } else if (doc.ml_output) {
      return `[${idx + 1}] Health: Heart Risk ${doc.ml_output.heart_disease_risk}, Diabetes Risk ${doc.ml_output.diabetes_risk}, Date: ${date}`;
    }
    return `[${idx + 1}] Data from ${date}`;
  });

  return formatted.join("\n");
}

function getSystemPrompt(diseaseType?: string): string {
  const basePrompt = `You are HealthAI Guardian, an AI health assistant specializing in cognitive health, mental wellness, and chronic disease management. You analyze user data from cognitive games, questionnaires, and health metrics to provide personalized insights and recommendations.`;

  const diseasePrompts: Record<string, string> = {
    alzheimers:
      "Focus on attention and memory patterns. Alzheimer's disease affects memory, attention, and cognitive function. Look for declining patterns in digit span and word list recall games.",
    dementia:
      "Focus on executive function and visuospatial abilities. Dementia affects planning, problem-solving, and spatial awareness. Analyze Stroop test and mental rotation game performance.",
    stress:
      "Focus on stress indicators from questionnaires, keystroke dynamics, and facial emotion analysis. Look for patterns of elevated stress scores and emotional responses.",
    depression:
      "Focus on mood indicators, questionnaire responses, and emotional patterns. Analyze sentiment in answers and emotional detection from video analysis.",
    diabetes:
      "Focus on diabetes risk factors, glucose levels, lifestyle factors, and daily habits. Provide recommendations for diet, exercise, and monitoring.",
    heart:
      "Focus on heart disease risk factors, blood pressure, cholesterol, and cardiovascular health metrics. Provide lifestyle recommendations for heart health.",
  };

  const diseasePrompt = diseaseType ? diseasePrompts[diseaseType] || "" : "";

  return `${basePrompt}\n\n${diseasePrompt}\n\nAlways provide evidence-based recommendations and encourage users to consult healthcare professionals for serious concerns.`;
}

