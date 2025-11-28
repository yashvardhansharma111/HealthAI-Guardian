import { generateWithGemini } from "@/utils/gemini";
import resultsRepo from "@/repositories/gameResults.repository";

async function generateWordSet() {
  // Fallback words if Gemini fails
  const fallbackWords = [
    ["apple", "book", "chair", "door", "elephant", "flower", "guitar", "house"],
    ["island", "jungle", "kite", "lamp", "mountain", "notebook", "ocean", "pencil"],
    ["queen", "river", "sunset", "table", "umbrella", "violin", "window", "xylophone"],
  ];

  try {
    const prompt = `
Generate exactly 8 simple English nouns.

Return ONLY this JSON:
{
  "words": ["word1","word2","word3","word4","word5","word6","word7","word8"]
}
`;
    const result = await generateWithGemini(prompt);
    
    // Handle different response formats
    let parsedResult;
    if (typeof result === "string") {
      try {
        parsedResult = JSON.parse(result);
      } catch {
        // If parsing fails, use fallback
        const randomIndex = Math.floor(Math.random() * fallbackWords.length);
        return fallbackWords[randomIndex];
      }
    } else {
      parsedResult = result;
    }

    // Check if words array exists and is valid
    if (parsedResult && Array.isArray(parsedResult.words) && parsedResult.words.length >= 8) {
      return parsedResult.words.slice(0, 8);
    }

    // Fallback if structure is wrong
    const randomIndex = Math.floor(Math.random() * fallbackWords.length);
    return fallbackWords[randomIndex];
  } catch (error) {
    console.error("Error generating word set:", error);
    // Use fallback on error
    const randomIndex = Math.floor(Math.random() * fallbackWords.length);
    return fallbackWords[randomIndex];
  }
}

export async function generateWordList() {
  const now = Date.now();

  const recallDelays = [60, 120, 180]; // seconds for delayed recall

  try {
    const sets = await Promise.all([
      generateWordSet(),
      generateWordSet(),
      generateWordSet(),
    ]);

    // Validate that all sets are arrays with words
    const validSets = sets.filter(set => Array.isArray(set) && set.length > 0);
    
    if (validSets.length === 0) {
      throw new Error("Failed to generate any word sets");
    }

    const questions = validSets.map((words, idx) => ({
      id: idx + 1,
      question: `Remember these words. You will be asked to recall them after ${recallDelays[idx]} seconds.`,
      data: { words: Array.isArray(words) ? words : [] },
      meta: {
        delaySeconds: recallDelays[idx],
        scheduledAt: new Date(now + recallDelays[idx] * 1000).toISOString(),
      },
    }));

    return { questions };
  } catch (error) {
    console.error("Error generating word list:", error);
    // Return fallback questions
    const fallbackWords = [
      ["apple", "book", "chair", "door", "elephant", "flower", "guitar", "house"],
      ["island", "jungle", "kite", "lamp", "mountain", "notebook", "ocean", "pencil"],
      ["queen", "river", "sunset", "table", "umbrella", "violin", "window", "xylophone"],
    ];

    return {
      questions: fallbackWords.map((words, idx) => ({
        id: idx + 1,
        question: `Remember these words. You will be asked to recall them after ${recallDelays[idx]} seconds.`,
        data: { words },
        meta: {
          delaySeconds: recallDelays[idx],
          scheduledAt: new Date(now + recallDelays[idx] * 1000).toISOString(),
        },
      })),
    };
  }
}

export async function saveWordRecallResult(userId: string, data: any) {
  const { questionId, shownWords, recalledWords, reactionTime } = data;

  const correct = recalledWords.filter((w: string) =>
    shownWords.includes(w)
  ).length;

  const accuracy = correct / shownWords.length;

  const mistakes = shownWords.filter((w: string) => !recalledWords.includes(w));

  return resultsRepo.saveResult({
    userId,
    gameType: "memory_wordlist",
    inputData: { questionId, shownWords },
    userResponse: { recalledWords },
    accuracy,
    reactionTime,
    mistakes,
  });
}
