import { generateWithGemini } from "@/utils/gemini";
import resultsRepo from "@/repositories/gameResults.repository";

async function generateWordSet() {
  const prompt = `
Generate exactly 8 simple English nouns.

Return ONLY this JSON:
{
  "words": ["word1","word2","word3","word4","word5","word6","word7","word8"]
}
`;
  const result = await generateWithGemini(prompt);
  return result.words;
}

export async function generateWordList() {
  const now = Date.now();

  const recallDelays = [60, 120, 180]; // seconds for delayed recall

  const sets = await Promise.all([
    generateWordSet(),
    generateWordSet(),
    generateWordSet(),
  ]);

  const questions = sets.map((words, idx) => ({
    id: idx + 1,
    question: `Remember these words. You will be asked to recall them after ${recallDelays[idx]} seconds.`,
    data: { words },
    meta: {
      delaySeconds: recallDelays[idx],
      scheduledAt: new Date(now + recallDelays[idx] * 1000).toISOString(),
    },
  }));

  return { questions };
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
