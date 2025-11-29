/**
 * Embedding Service
 * Generates embeddings for game results, questionnaires, and health predictions
 * Uses local logic - no external APIs
 */

const EMBEDDING_DIMENSION = 384; // Standard embedding dimension

/**
 * Generate embedding for a given text using local logic
 * Uses feature extraction, hashing, and normalization
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  return generateLocalEmbedding(text);
}

/**
 * Generate embeddings for game result
 */
export async function generateGameEmbedding(gameData: {
  gameType: string;
  accuracy?: number;
  reactionTime?: number;
  errors?: string[];
  inputData?: any;
  userResponse?: any;
  timestamp?: Date;
}): Promise<number[]> {
  const text = JSON.stringify({
    gameType: gameData.gameType,
    accuracy: gameData.accuracy,
    reactionTime: gameData.reactionTime,
    errors: gameData.errors,
    performance: gameData.accuracy
      ? gameData.accuracy >= 0.8
        ? "good"
        : gameData.accuracy >= 0.5
        ? "moderate"
        : "poor"
      : "unknown",
    timestamp: gameData.timestamp?.toISOString(),
  });

  return generateEmbedding(text);
}

/**
 * Generate embeddings for questionnaire result
 */
export async function generateQuestionnaireEmbedding(questionnaireData: {
  questionId: number;
  questionText: string;
  answer: string;
  videoAnalysis?: any;
  keystrokeAnalysis?: any;
  timestamp?: Date;
}): Promise<number[]> {
  const text = JSON.stringify({
    question: questionnaireData.questionText,
    answer: questionnaireData.answer,
    stressScore: questionnaireData.keystrokeAnalysis?.stress_score || 0,
    stressLabel: questionnaireData.keystrokeAnalysis?.stress_label || "unknown",
    emotion: questionnaireData.videoAnalysis?.overall?.top_emotions?.[0]?.label || "unknown",
    emotionScore: questionnaireData.videoAnalysis?.overall?.stress_score || 0,
    timestamp: questionnaireData.timestamp?.toISOString(),
  });

  return generateEmbedding(text);
}

/**
 * Generate embeddings for health prediction
 */
export async function generateHealthEmbedding(healthData: {
  input: any;
  ml_output: {
    heart_disease_risk: number;
    diabetes_risk: number;
  };
  grok_insights?: string;
  timestamp?: Date;
}): Promise<number[]> {
  const text = JSON.stringify({
    heartRisk: healthData.ml_output.heart_disease_risk,
    diabetesRisk: healthData.ml_output.diabetes_risk,
    riskLevel:
      healthData.ml_output.heart_disease_risk > 0.7 || healthData.ml_output.diabetes_risk > 0.7
        ? "high"
        : healthData.ml_output.heart_disease_risk > 0.4 || healthData.ml_output.diabetes_risk > 0.4
        ? "medium"
        : "low",
    sleepHours: healthData.input.daily_sleep_hours,
    steps: healthData.input.daily_steps,
    exercise: healthData.input.daily_exercise_minutes,
    stress: healthData.input.daily_stress_score,
    insights: healthData.grok_insights?.substring(0, 200) || "",
    timestamp: healthData.timestamp?.toISOString(),
  });

  return generateEmbedding(text);
}

/**
 * Generate local embedding using feature extraction and hashing
 * Creates a consistent 384-dimensional vector from text
 */
function generateLocalEmbedding(text: string): number[] {
  const embedding: number[] = new Array(EMBEDDING_DIMENSION).fill(0);
  
  // Normalize text
  const normalized = text.toLowerCase().trim();
  const words = normalized.split(/\s+/).filter(w => w.length > 0);
  const chars = normalized.split('');
  
  // Feature extraction
  const features: number[] = [];
  
  // 1. Text length features (first 32 dimensions)
  features.push(Math.min(normalized.length / 1000, 1)); // Normalized length
  features.push(Math.min(words.length / 100, 1)); // Word count
  features.push(Math.min(chars.length / 1000, 1)); // Character count
  features.push(words.length > 0 ? chars.length / words.length : 0); // Avg chars per word
  
  // 2. Character frequency features (next 64 dimensions)
  const charFreq = getCharFrequency(normalized);
  for (let i = 0; i < 64 && i < charFreq.length; i++) {
    features.push(charFreq[i]);
  }
  while (features.length < 68) features.push(0);
  
  // 3. Word n-gram features (next 64 dimensions)
  const wordBigrams = getWordNGrams(words, 2);
  const wordTrigrams = getWordNGrams(words, 3);
  for (let i = 0; i < 32 && i < wordBigrams.length; i++) {
    features.push(Math.min(wordBigrams[i] / 10, 1));
  }
  for (let i = 0; i < 32 && i < wordTrigrams.length; i++) {
    features.push(Math.min(wordTrigrams[i] / 10, 1));
  }
  while (features.length < 132) features.push(0);
  
  // 4. Hash-based features (remaining dimensions)
  const hash = simpleHash(text);
  const hash2 = simpleHash(text.split('').reverse().join(''));
  
  for (let i = 0; i < EMBEDDING_DIMENSION - features.length; i++) {
    const combinedHash = hash + hash2 + i;
    features.push(Math.sin(combinedHash * 0.1) * 0.5 + 0.5);
  }
  
  // Normalize to unit vector
  const magnitude = Math.sqrt(features.reduce((sum, val) => sum + val * val, 0));
  if (magnitude > 0) {
    return features.map((val) => val / magnitude);
  }
  
  return features;
}

/**
 * Get character frequency distribution
 */
function getCharFrequency(text: string): number[] {
  const freq: Record<string, number> = {};
  const chars = text.toLowerCase().replace(/\s/g, '');
  
  for (const char of chars) {
    freq[char] = (freq[char] || 0) + 1;
  }
  
  const total = chars.length || 1;
  const sorted = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 64);
  
  const result = new Array(64).fill(0);
  sorted.forEach(([char, count], idx) => {
    result[idx] = count / total;
  });
  
  return result;
}

/**
 * Get word n-gram frequencies
 */
function getWordNGrams(words: string[], n: number): number[] {
  const ngrams: Record<string, number> = {};
  
  for (let i = 0; i <= words.length - n; i++) {
    const ngram = words.slice(i, i + n).join(' ');
    ngrams[ngram] = (ngrams[ngram] || 0) + 1;
  }
  
  const total = Math.max(words.length - n + 1, 1);
  return Object.values(ngrams)
    .sort((a, b) => b - a)
    .slice(0, 32)
    .map(count => count / total);
}

/**
 * Simple hash function
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

