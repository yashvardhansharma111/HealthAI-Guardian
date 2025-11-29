import { NextResponse } from "next/server";
import { requireAuth } from "@/middlewares/auth.middleware";
import { connectDB } from "@/config/db";
import { retrieveDocuments, getUserRiskProfile } from "@/services/rag/retrieval.service";
import { generateHealthReport, generateGameSuggestions } from "@/services/rag/groq.service";
import { success, failure } from "@/utils/apiResponse";

export async function GET(req: Request) {
  try {
    await connectDB();
    const authResult = requireAuth(req);

    if (authResult.error) {
      return authResult.error;
    }

    const url = new URL(req.url);
    const diseaseType = url.searchParams.get("diseaseType") as
      | "alzheimers"
      | "dementia"
      | "stress"
      | "depression"
      | "diabetes"
      | "heart"
      | null;
    const days = parseInt(url.searchParams.get("days") || "30");

    const userId = authResult.user.id;

    // Get time range
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    // Retrieve relevant documents
    const retrievedDocs = await retrieveDocuments({
      userId,
      diseaseType: diseaseType || undefined,
      timeRange: {
        start: startDate,
        end: endDate,
      },
      limit: 20,
    });

    // Get risk profile
    const riskProfile = await getUserRiskProfile(userId);

    // Generate health report
    const report = await generateHealthReport(userId, retrievedDocs, diseaseType || undefined);

    // Generate game suggestions
    const suggestions = await generateGameSuggestions(userId, retrievedDocs, riskProfile);

    return NextResponse.json(
      success(
        {
          report,
          riskProfile,
          suggestions,
          retrievedDocsCount: retrievedDocs.length,
        },
        200
      )
    );
  } catch (error: any) {
    console.error("RAG report error:", error);
    return NextResponse.json(
      failure(error.message || "Failed to generate report"),
      { status: 500 }
    );
  }
}

