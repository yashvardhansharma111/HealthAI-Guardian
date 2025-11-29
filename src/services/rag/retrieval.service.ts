/**
 * RAG Retrieval Service
 * Retrieves relevant documents from MongoDB based on embeddings and filters
 */

import { connectDB } from "@/config/db";
import GameResult from "@/models/gameResult.model";
import VisuospatialResult from "@/models/visuospatialResult.model";
import QuestionnaireResult from "@/models/questionnaireResult.model";
import HealthPrediction from "@/models/healthPrediction.model";
import { generateEmbedding } from "../embeddings.service";

interface RetrievalOptions {
  userId: string;
  query?: string;
  diseaseType?: "alzheimers" | "dementia" | "stress" | "depression" | "diabetes" | "heart";
  timeRange?: {
    start: Date;
    end: Date;
  };
  limit?: number;
  gameTypes?: string[];
}

/**
 * Cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;
  
  return dotProduct / denominator;
}

/**
 * Compute average embedding from multiple embeddings
 */
function computeAverageEmbedding(embeddings: number[][]): number[] {
  if (embeddings.length === 0) return new Array(384).fill(0);
  
  const dimension = embeddings[0].length;
  const avg = new Array(dimension).fill(0);
  
  for (const embedding of embeddings) {
    for (let i = 0; i < dimension; i++) {
      avg[i] += embedding[i] || 0;
    }
  }
  
  const count = embeddings.length;
  for (let i = 0; i < dimension; i++) {
    avg[i] /= count;
  }
  
  // Normalize
  const magnitude = Math.sqrt(avg.reduce((sum, val) => sum + val * val, 0));
  if (magnitude > 0) {
    return avg.map((val) => val / magnitude);
  }
  
  return avg;
}

/**
 * Retrieve relevant documents for RAG
 */
export async function retrieveDocuments(options: RetrievalOptions): Promise<any[]> {
  await connectDB();

  const {
    userId,
    query,
    diseaseType,
    timeRange,
    limit = 10,
    gameTypes,
  } = options;

  // Generate query embedding if query is provided
  let queryEmbedding: number[] | null = null;
  if (query) {
    queryEmbedding = await generateEmbedding(query);
  }

  const results: any[] = [];

  // Build time filter
  const timeFilter: any = {};
  if (timeRange) {
    timeFilter.timestamp = {
      $gte: timeRange.start,
      $lte: timeRange.end,
    };
  }

  // Retrieve game results
  if (!diseaseType || diseaseType === "alzheimers" || diseaseType === "dementia") {
    const gameFilter: any = {
      userId,
      ...timeFilter,
    };

    if (diseaseType === "alzheimers") {
      gameFilter.gameType = { $in: ["attention_digitspan", "memory_wordlist"] };
      gameFilter.diseaseType = { $in: ["alzheimers", null] };
    } else if (diseaseType === "dementia") {
      gameFilter.gameType = { $in: ["executive_stroop", "visuospatial_mentalrotation"] };
      gameFilter.diseaseType = { $in: ["dementia", "alzheimers", null] };
    }

    if (gameTypes) {
      gameFilter.gameType = { $in: gameTypes };
    }

    const gameResults = await GameResult.find(gameFilter)
      .sort({ timestamp: -1 })
      .limit(limit * 2)
      .lean();

    // If query embedding exists, rank by similarity using embeddings from MongoDB
    if (queryEmbedding) {
      const ranked = gameResults
        .filter((r) => r.embedding && Array.isArray(r.embedding) && r.embedding.length > 0)
        .map((r) => ({
          ...r,
          similarity: cosineSimilarity(queryEmbedding!, r.embedding as number[]),
        }))
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);

      results.push(...ranked);
    } else {
      // If no query, use embeddings from MongoDB for similarity-based retrieval
      // Get embeddings from all results and find similar ones
      const resultsWithEmbeddings = gameResults.filter(
        (r) => r.embedding && Array.isArray(r.embedding) && r.embedding.length > 0
      );
      
      if (resultsWithEmbeddings.length > 0) {
        // Use average embedding of recent results as query
        const avgEmbedding = computeAverageEmbedding(
          resultsWithEmbeddings.map((r) => r.embedding as number[])
        );
        
        const ranked = resultsWithEmbeddings
          .map((r) => ({
            ...r,
            similarity: cosineSimilarity(avgEmbedding, r.embedding as number[]),
          }))
          .sort((a, b) => b.similarity - a.similarity)
          .slice(0, limit);
        
        results.push(...ranked);
      } else {
        results.push(...gameResults.slice(0, limit));
      }
    }

    // Get visuospatial results
    const visuospatialFilter: any = {
      userId,
      ...timeFilter,
    };

    if (diseaseType === "dementia") {
      visuospatialFilter.diseaseType = { $in: ["dementia", "alzheimers", null] };
    }

    const visuospatialResults = await VisuospatialResult.find(visuospatialFilter)
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();

    if (queryEmbedding) {
      const ranked = visuospatialResults
        .filter((r) => r.embedding && Array.isArray(r.embedding) && r.embedding.length > 0)
        .map((r) => ({
          ...r,
          similarity: cosineSimilarity(queryEmbedding!, r.embedding as number[]),
        }))
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, Math.floor(limit / 2));

      results.push(...ranked);
    } else {
      const resultsWithEmbeddings = visuospatialResults.filter(
        (r) => r.embedding && Array.isArray(r.embedding) && r.embedding.length > 0
      );
      results.push(...resultsWithEmbeddings.slice(0, Math.floor(limit / 2)));
    }
  }

  // Retrieve questionnaire results
  if (!diseaseType || diseaseType === "stress" || diseaseType === "depression") {
    const questionnaireFilter: any = {
      userId,
      ...timeFilter,
    };

    if (diseaseType === "stress" || diseaseType === "depression") {
      questionnaireFilter.diseaseType = { $in: [diseaseType, "stress", "depression"] };
    }

    const questionnaireResults = await QuestionnaireResult.find(questionnaireFilter)
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();

    if (queryEmbedding) {
      const ranked = questionnaireResults
        .filter((r) => r.embedding && Array.isArray(r.embedding) && r.embedding.length > 0)
        .map((r) => ({
          ...r,
          similarity: cosineSimilarity(queryEmbedding!, r.embedding as number[]),
        }))
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);

      results.push(...ranked);
    } else {
      const resultsWithEmbeddings = questionnaireResults.filter(
        (r) => r.embedding && Array.isArray(r.embedding) && r.embedding.length > 0
      );
      results.push(...resultsWithEmbeddings.slice(0, limit));
    }
  }

  // Retrieve health predictions
  if (!diseaseType || diseaseType === "diabetes" || diseaseType === "heart") {
    const healthFilter: any = {
      userId,
      ...timeFilter,
    };

    if (diseaseType === "diabetes" || diseaseType === "heart") {
      healthFilter.diseaseType = { $in: [diseaseType, "diabetes", "heart"] };
    }

    const healthResults = await HealthPrediction.find(healthFilter)
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();

    if (queryEmbedding) {
      const ranked = healthResults
        .filter((r) => r.embedding && Array.isArray(r.embedding) && r.embedding.length > 0)
        .map((r) => ({
          ...r,
          similarity: cosineSimilarity(queryEmbedding!, r.embedding as number[]),
        }))
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);

      results.push(...ranked);
    } else {
      const resultsWithEmbeddings = healthResults.filter(
        (r) => r.embedding && Array.isArray(r.embedding) && r.embedding.length > 0
      );
      results.push(...resultsWithEmbeddings.slice(0, limit));
    }
  }

  // Sort by timestamp if no query embedding
  if (!queryEmbedding) {
    results.sort((a, b) => {
      const timeA = new Date(a.timestamp || 0).getTime();
      const timeB = new Date(b.timestamp || 0).getTime();
      return timeB - timeA;
    });
  }

  return results.slice(0, limit);
}

/**
 * Get risk profile for a user
 */
export async function getUserRiskProfile(userId: string): Promise<{
  alzheimers: number;
  dementia: number;
  stress: number;
  depression: number;
  diabetes: number;
  heart: number;
}> {
  await connectDB();

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Get recent game results for Alzheimer's (attention & memory)
  const alzheimersGames = await GameResult.find({
    userId,
    gameType: { $in: ["attention_digitspan", "memory_wordlist"] },
    timestamp: { $gte: thirtyDaysAgo },
  })
    .sort({ timestamp: -1 })
    .limit(20)
    .lean();

  const alzheimersRisk =
    alzheimersGames.length > 0
      ? 1 - alzheimersGames.reduce((sum, g) => sum + (g.accuracy || 0), 0) / alzheimersGames.length
      : 0;

  // Get recent game results for Dementia (executive & visuospatial)
  const dementiaGames = await GameResult.find({
    userId,
    gameType: { $in: ["executive_stroop", "visuospatial_mentalrotation"] },
    timestamp: { $gte: thirtyDaysAgo },
  })
    .sort({ timestamp: -1 })
    .limit(20)
    .lean();

  const dementiaRisk =
    dementiaGames.length > 0
      ? 1 - dementiaGames.reduce((sum, g) => sum + (g.accuracy || 0), 0) / dementiaGames.length
      : 0;

  // Get recent questionnaire results for stress/depression
  const questionnaires = await QuestionnaireResult.find({
    userId,
    timestamp: { $gte: thirtyDaysAgo },
  })
    .sort({ timestamp: -1 })
    .limit(20)
    .lean();

  const avgStressScore =
    questionnaires.length > 0
      ? questionnaires.reduce(
          (sum, q) => sum + (q.keystrokeAnalysis?.stress_score || 0),
          0
        ) / questionnaires.length
      : 0;

  const stressRisk = Math.min(avgStressScore, 1);
  const depressionRisk = stressRisk * 0.8; // Correlation assumption

  // Get recent health predictions
  const healthPredictions = await HealthPrediction.find({
    userId,
    timestamp: { $gte: thirtyDaysAgo },
  })
    .sort({ timestamp: -1 })
    .limit(10)
    .lean();

  const avgDiabetesRisk =
    healthPredictions.length > 0
      ? healthPredictions.reduce(
          (sum, h) => sum + (h.ml_output?.diabetes_risk || 0),
          0
        ) / healthPredictions.length
      : 0;

  const avgHeartRisk =
    healthPredictions.length > 0
      ? healthPredictions.reduce(
          (sum, h) => sum + (h.ml_output?.heart_disease_risk || 0),
          0
        ) / healthPredictions.length
      : 0;

  return {
    alzheimers: Math.min(alzheimersRisk, 1),
    dementia: Math.min(dementiaRisk, 1),
    stress: Math.min(stressRisk, 1),
    depression: Math.min(depressionRisk, 1),
    diabetes: Math.min(avgDiabetesRisk, 1),
    heart: Math.min(avgHeartRisk, 1),
  };
}

