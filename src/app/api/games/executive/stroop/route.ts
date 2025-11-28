import {
  generateStroopStimulus,
  saveStroopResult,
} from "@/services/games/executive.service";
import { connectDB } from "@/config/db";

import { NextResponse } from "next/server";
import { requireAuth } from "@/middlewares/auth.middleware";

export async function GET(req: Request) {
  const { error } = requireAuth(req);
  if (error) return error;

  await connectDB();

  try {
    return NextResponse.json(generateStroopStimulus());
  } catch {
    return NextResponse.json(
      { message: "Failed to generate Stroop task" },
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

    if (!body.word || !body.inkColor || !body.userAnswer) {
      return NextResponse.json(
        { message: "Missing required Stroop fields" },
        { status: 400 }
      );
    }

    const result = await saveStroopResult(user.id, body);
    return NextResponse.json({ result });
  } catch {
    return NextResponse.json(
      { message: "Failed to save Stroop result" },
      { status: 500 }
    );
  }
}
