import { requireAuth } from "../../../../../middlewares/auth.middleware";
import { requireRateLimit } from "../../../../../middlewares/rateLimit.middleware";
import {
  generateWordList,
  saveWordRecallResult,
} from "@/services/games/memory.service";
import { connectDB } from "@/config/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { error: rateErr } = requireRateLimit(req);
  if (rateErr) return rateErr;

  const { user, error } = requireAuth(req);
  if (error) return error;

  await connectDB();

  try {
    const result = await generateWordList();
    
    // Validate the result structure
    if (!result || !result.questions || !Array.isArray(result.questions)) {
      console.error("Invalid word list result:", result);
      return NextResponse.json(
        { message: "Invalid game data generated" },
        { status: 500 }
      );
    }

    // Validate each question has words
    const validQuestions = result.questions.filter((q: any) => 
      q && q.data && Array.isArray(q.data.words) && q.data.words.length > 0
    );

    if (validQuestions.length === 0) {
      console.error("No valid questions with words found");
      return NextResponse.json(
        { message: "No valid questions generated" },
        { status: 500 }
      );
    }

    return NextResponse.json({ questions: validQuestions });
  } catch (error: any) {
    console.error("Word list generation error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to generate memory task" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const { error: rateErr } = requireRateLimit(req);
  if (rateErr) return rateErr;

  const { user, error } = requireAuth(req);
  if (error) return error;

  await connectDB();

  try {
    const body = await req.json();

    if (!body.shownWords || !body.recalledWords)
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );

    const result = await saveWordRecallResult(user.id, body);
    return NextResponse.json({ result });
  } catch {
    return NextResponse.json(
      { message: "Failed to save memory result" },
      { status: 500 }
    );
  }
}
