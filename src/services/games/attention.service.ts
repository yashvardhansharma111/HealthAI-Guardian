import resultsRepo from "@/src/repositories/gameResults.repository";

function generateDigits(length = 6) {
  return Array.from({ length }, () => Math.floor(Math.random() * 10));
}

export function generateDigitSpan() {
  const questions = [1, 2, 3].map((n) => ({
    id: n,
    question: "Memorize the digits shown and repeat them in the same order.",
    data: { digits: generateDigits(6) },
    meta: {
      difficulty: "forward",
      expectedResponse: "repeat in same order",
    },
  }));

  return { questions };
}

export async function saveDigitSpanResult(userId: string, data: any) {
  const { questionId, shownDigits, userDigits, reactionTime } = data;

  const correct = JSON.stringify(shownDigits) === JSON.stringify(userDigits);

  return resultsRepo.saveResult({
    userId,
    gameType: "attention_digitspan",
    inputData: { questionId, shownDigits },
    userResponse: { userDigits },
    accuracy: correct ? 1 : 0,
    reactionTime,
    mistakes: correct ? [] : ["wrong_order"],
  });
}
