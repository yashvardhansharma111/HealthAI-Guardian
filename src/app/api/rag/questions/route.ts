import { NextResponse } from "next/server";
import { requireAuth } from "@/middlewares/auth.middleware";
import { connectDB } from "@/config/db";
import { retrieveDocuments } from "@/services/rag/retrieval.service";
import { generateDynamicQuestions } from "@/services/rag/groq.service";
import { success, failure } from "@/utils/apiResponse";

export async function GET(req: Request) {
  try {
    await connectDB();
    const authResult = requireAuth(req);

    if (authResult.error) {
      return authResult.error;
    }

    const url = new URL(req.url);
    const count = parseInt(url.searchParams.get("count") || "3");

    const userId = authResult.user.id;

    // Retrieve recent documents for context
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    const retrievedDocs = await retrieveDocuments({
      userId,
      timeRange: {
        start: startDate,
        end: endDate,
      },
      limit: 10,
    });

    // Generate dynamic questions
    const questions = await generateDynamicQuestions(userId, retrievedDocs, count);

    return NextResponse.json(
      success({ questions }, 200)
    );
  } catch (error: any) {
    console.error("Dynamic questions error:", error);
    return NextResponse.json(
      failure(error.message || "Failed to generate questions"),
      { status: 500 }
    );
  }
}

