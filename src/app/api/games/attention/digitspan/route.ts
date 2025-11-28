import {
  generateDigitSpan,
  saveDigitSpanResult,
} from "@/src/services/games/attention.service";
import { connectDB } from "@/src/config/db";
import { requireAuth } from "../../../../../middlewares/auth.middleware";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { error } = requireAuth(req);
  if (error) return error;

  await connectDB();

  try {
    return NextResponse.json(generateDigitSpan());
  } catch {
    return NextResponse.json(
      { message: "Failed to generate digit span task" },
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

    if (!body.shownDigits || !body.userDigits) {
      return NextResponse.json(
        { message: "Missing digits for evaluation" },
        { status: 400 }
      );
    }

    const result = await saveDigitSpanResult(user.id, body);
    return NextResponse.json({ result });
  } catch {
    return NextResponse.json(
      { message: "Failed to save digit span result" },
      { status: 500 }
    );
  }
}
