import {
  generateWordList,
  saveWordRecallResult,
} from "@/src/services/games/memory.service";
import { connectDB } from "@/src/config/db";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();
  const result = await generateWordList();
  return NextResponse.json(result);
}

export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();
  const result = await saveWordRecallResult(body.userId, body);
  return NextResponse.json({ result });
}
