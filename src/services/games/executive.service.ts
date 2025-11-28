import resultsRepo from "@/src/repositories/gameResults.repository";

const COLORS = ["red", "blue", "green", "yellow"];

export function generateStroopStimulus() {
  const word = COLORS[Math.floor(Math.random() * COLORS.length)];
  const inkColor = COLORS[Math.floor(Math.random() * COLORS.length)];

  return {
    question: "Select the COLOR of the text, not the word itself.",
    data: { word, inkColor },
  };
}

export async function saveStroopResult(userId: string, data: any) {
  const { word, inkColor, userAnswer, reactionTime } = data;

  const correct = userAnswer === inkColor;

  return resultsRepo.saveResult({
    userId,
    gameType: "executive_stroop",
    inputData: { word, inkColor },
    userResponse: { userAnswer },
    accuracy: correct ? 1 : 0,
    reactionTime,
    mistakes: correct ? [] : ["interference_error"],
  });
}
