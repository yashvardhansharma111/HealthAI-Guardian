import {
  generateWordList,
  saveWordRecallResult,
} from "../../../../../services/games/memory.service";
import { connectDB } from "@/src/config/db";
import { NextResponse } from "next/server";
import { requireAuth } from "../../../../../middlewares/auth.middleware";

export async function GET(req: Request) {
  const { error } = requireAuth(req);
  if (error) return error;

  await connectDB();

  try {
    const result = await generateWordList();
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { message: "Failed to generate memory task" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const { user, error } = requireAuth(req);
  if (error) return error;

  await connectDB();

  try {
    const body = await req.json();

    if (!body.shownWords || !body.recalledWords) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await saveWordRecallResult(user.id, body);
    return NextResponse.json({ result });
  } catch (e) {
    return NextResponse.json(
      { message: "Failed to save memory recall result" },
      { status: 500 }
    );
  }
}
