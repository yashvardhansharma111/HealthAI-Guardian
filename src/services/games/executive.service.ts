import resultsRepo from "@/repositories/gameResults.repository";

const COLORS = ["red", "blue", "green", "yellow"];

function generateStroop() {
  const word = COLORS[Math.floor(Math.random() * COLORS.length)];
  const inkColor = COLORS[Math.floor(Math.random() * COLORS.length)];
  return { word, inkColor };
}

export function generateStroopStimulus() {
  const questions = [1, 2, 3].map((n) => ({
    id: n,
    question: "Select the COLOR of the text, not the word itself.",
    data: generateStroop(),
    meta: {
      rule: "choose ink color",
      interference: true,
    },
  }));

  return { questions };
}

export async function saveStroopResult(userId: string, data: any) {
  const { questionId, word, inkColor, userAnswer, reactionTime } = data;

  const correct = userAnswer === inkColor;

  return resultsRepo.saveResult({
    userId,
    gameType: "executive_stroop",
    inputData: { questionId, word, inkColor },
    userResponse: { userAnswer },
    accuracy: correct ? 1 : 0,
    reactionTime,
    mistakes: correct ? [] : ["interference_error"],
  });
}
