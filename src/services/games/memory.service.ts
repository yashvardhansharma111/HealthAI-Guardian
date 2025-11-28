import { generateWithGemini } from "@/src/utils/gemini";
import resultsRepo from "@/src/repositories/gameResults.repository";

export async function generateWordList() {
  const prompt = `
Generate exactly 8 simple English nouns.

Return ONLY this JSON:
{
  "words": ["word1", "word2", "word3", "word4", "word5", "word6", "word7", "word8"]
}
`;

  const result = await generateWithGemini(prompt);

  return {
    question:
      "Remember the following words. You will be asked to recall them later.",
    data: {
      words: result.words,
    },
  };
}

export async function saveWordRecallResult(userId: string, data: any) {
  const { shownWords, recalledWords, reactionTime } = data;

  const correctCount = recalledWords.filter((w: string) =>
    shownWords.includes(w)
  ).length;

  const accuracy = correctCount / shownWords.length;

  const mistakes = shownWords.filter((w: string) => !recalledWords.includes(w));

  return resultsRepo.saveResult({
    userId,
    gameType: "memory_wordlist",
    inputData: { shownWords },
    userResponse: { recalledWords },
    accuracy,
    reactionTime,
    mistakes,
  });
}
