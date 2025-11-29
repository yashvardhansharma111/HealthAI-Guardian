import { VISUOSPATIAL_IMAGES } from "@/data/visuospatialBaseImages";
import { generateWithGemini } from "@/utils/gemini";
import VisuospatialResult from "@/models/visuospatialResult.model";
import { generateGameEmbedding } from "@/services/embeddings.service";

export async function generateVisuospatialSession() {
  // Pick random images for the session (3 different images)
  const selectedImages = [];
  const availableImages = [...VISUOSPATIAL_IMAGES];
  
  // Select 3 random images (or as many as available)
  const numQuestions = Math.min(3, availableImages.length);
  for (let i = 0; i < numQuestions; i++) {
    const randomIndex = Math.floor(Math.random() * availableImages.length);
    selectedImages.push(availableImages[randomIndex]);
    availableImages.splice(randomIndex, 1); // Remove to avoid duplicates
  }

  // Fallback instruction if Gemini fails
  const fallbackInstruction = "Look at this image carefully and describe in detail what you see. Be specific about objects, people, colors, and any other details you notice.";

  let clinicianInstruction = fallbackInstruction;

  try {
    const prompt = `
      You are a clinical neuropsychologist conducting a visual perception test.
      Write a clear, one-sentence instruction (max 30 words) asking a patient to describe what they see in an image.
      The instruction should encourage detailed observation and help detect visual hallucinations.
      Return ONLY the instruction text, no JSON, no markdown, just the instruction.
    `;

    const result = await generateWithGemini(prompt);

    // Handle different response formats
    if (typeof result === "string") {
      // Remove markdown code blocks if present
      let cleaned = result
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .replace(/"/g, "")
        .trim();

      if (cleaned.length > 0) {
        clinicianInstruction = cleaned;
      }
    } else if (result && typeof result === "object") {
      // If it's an object, try to extract text from common fields
      const text = result.text || result.instruction || result.content || result.message || JSON.stringify(result);
      if (typeof text === "string" && text.length > 0) {
        clinicianInstruction = text.trim();
      }
    }
  } catch (error) {
    console.error("Error generating clinician instruction:", error);
    // Use fallback instruction
  }

  // Ensure we have a valid string
  if (typeof clinicianInstruction !== "string" || clinicianInstruction.length === 0) {
    clinicianInstruction = fallbackInstruction;
  }

  // Generate questions with single images
  const questions = selectedImages.map((imageUrl, idx) => ({
    id: idx + 1,
    question: clinicianInstruction.trim(),
    data: {
      imageUrl: imageUrl,
    },
  }));

  return { questions };
}

export async function saveVisuospatialResult(userId: string, body: any) {
  const { questionId, userDescription, imageUrl, reactionTime } = body;

  // Generate embedding for the result
  const resultData = {
    gameType: "visuospatial_mentalrotation",
    accuracy: 1, // Descriptive answers don't have binary accuracy
    reactionTime,
    errors: [],
    inputData: { questionId, imageUrl },
    userResponse: { userDescription },
    timestamp: new Date(),
  };

  const embedding = await generateGameEmbedding(resultData);

  // Store the user's description - can be analyzed later for hallucinations
  return await VisuospatialResult.create({
    userId,
    questionId,
    baseImageUrl: imageUrl,
    userAnswer: userDescription, // Store the description as userAnswer
    userDescription: userDescription, // Also store in a dedicated field if model supports it
    reactionTime,
    embedding,
    diseaseType: "dementia",
    timestamp: new Date(),
  });
}
