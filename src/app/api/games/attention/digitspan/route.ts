import {
  generateDigitSpan,
  saveDigitSpanResult,
} from "@/src/services/games/attention.service";
import { connectDB } from "@/src/config/db";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();
  return NextResponse.json(generateDigitSpan());
}

export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();
  const result = await saveDigitSpanResult(body.userId, body);
  return NextResponse.json({ result });
}
