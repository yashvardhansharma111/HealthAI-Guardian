import { requireAuth } from "../../../../../middlewares/auth.middleware";
import { requireRateLimit } from "../../../../../middlewares/rateLimit.middleware";
import {
  generateWordList,
  saveWordRecallResult,
} from "@/src/services/games/memory.service";
import { connectDB } from "@/src/config/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { error: rateErr } = requireRateLimit(req);
  if (rateErr) return rateErr;

  const { user, error } = requireAuth(req);
  if (error) return error;

  await connectDB();

  try {
    const result = await generateWordList();
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { message: "Failed to generate memory task" },
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
