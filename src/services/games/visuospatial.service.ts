import { VISUOSPATIAL_IMAGES } from "@/src/data/visuospatialBaseImages";
import { generateWithGemini } from "@/src/utils/gemini";
import VisuospatialResult from "@/src/models/visuospatialResult.model";

export async function generateVisuospatialSession() {
  // backend picks random Cloudinary URL
  const baseImageUrl =
    VISUOSPATIAL_IMAGES[Math.floor(Math.random() * VISUOSPATIAL_IMAGES.length)];

  const clinicianInstruction = await generateWithGemini(`
      You are a clinical neuropsychologist.
      Write a one-sentence instruction (max 25 words) to compare two similar images.
  `);

  const variants = [
    {
      id: 1,
      transform: { rotate: 90, mirror: false },
      isSame: true,
    },
    {
      id: 2,
      transform: { rotate: 0, mirror: true },
      isSame: false,
    },
    {
      id: 3,
      transform: {
        rotate: 0,
        mirror: false,
        highlightRemovedArea: { x: 0.6, y: 0.22, width: 0.12, height: 0.12 },
      },
      isSame: false,
    },
  ];

  const questions = variants.map((v) => ({
    id: v.id,
    question: clinicianInstruction.trim(),
    data: {
      imageA: baseImageUrl,
      imageB: baseImageUrl,
      transform: v.transform,
      isSame: v.isSame,
    },
  }));

  return { baseImageUrl, questions };
}

export async function saveVisuospatialResult(userId: string, body: any) {
  const { questionId, userAnswer, isSame, reactionTime, baseImageUrl } = body;

  const correct =
    (userAnswer === "same" && isSame) ||
    (userAnswer === "different" && !isSame);

  return await VisuospatialResult.create({
    userId,
    questionId,
    baseImageUrl,
    userAnswer,
    isCorrect: correct,
    reactionTime,
    mistakes: correct ? [] : ["visual mismatch"],
  });
}
