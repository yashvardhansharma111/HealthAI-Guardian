import resultsRepo from "@/src/repositories/gameResults.repository";

export function generateDigitSpan(length = 6) {
  const digits = Array.from({ length }, () => Math.floor(Math.random() * 10));

  return {
    question:
      "Memorize the digits shown in order. You must repeat them in the same order.",
    data: { digits },
  };
}

export async function saveDigitSpanResult(userId: string, data: any) {
  const { shownDigits, userDigits, direction, reactionTime } = data;

  const correct =
    direction === "forward"
      ? JSON.stringify(shownDigits) === JSON.stringify(userDigits)
      : JSON.stringify([...shownDigits].reverse()) ===
        JSON.stringify(userDigits);

  return resultsRepo.saveResult({
    userId,
    gameType: "attention_digitspan",
    inputData: { shownDigits, direction },
    userResponse: { userDigits },
    accuracy: correct ? 1 : 0,
    reactionTime,
    mistakes: correct ? [] : ["wrong_order"],
  });
}
