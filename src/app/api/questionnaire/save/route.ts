import { NextResponse } from "next/server";
import { requireAuth } from "@/middlewares/auth.middleware";
import { connectDB } from "@/config/db";
import QuestionnaireResult from "@/models/questionnaireResult.model";
import { success, failure } from "@/utils/apiResponse";
import { generateQuestionnaireEmbedding } from "@/services/embeddings.service";

export async function POST(req: Request) {
  try {
    await connectDB();
    const authResult = requireAuth(req);

    if (authResult.error) {
      return authResult.error;
    }

    const body = await req.json();
    const {
      sessionId,
      questionId,
      questionText,
      answer,
      videoAnalysis,
      keystrokeAnalysis,
    } = body;

    if (!sessionId || !questionId || !questionText || !answer) {
      return NextResponse.json(
        failure("Missing required fields: sessionId, questionId, questionText, answer"),
        { status: 400 }
      );
    }

    // Generate embedding
    const questionnaireData = {
      questionId,
      questionText,
      answer,
      videoAnalysis,
      keystrokeAnalysis,
      timestamp: new Date(),
    };

    const embedding = await generateQuestionnaireEmbedding(questionnaireData);

    // Save to database
    const result = await QuestionnaireResult.create({
      userId: authResult.user.id,
      sessionId,
      ...questionnaireData,
      embedding,
      diseaseType: ["stress", "depression"],
    });

    return NextResponse.json(
      success({ result }, 200)
    );
  } catch (error: any) {
    console.error("Save questionnaire error:", error);
    return NextResponse.json(
      failure(error.message || "Failed to save questionnaire result"),
      { status: 500 }
    );
  }
}

