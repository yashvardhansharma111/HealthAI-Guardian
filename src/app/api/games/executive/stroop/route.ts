import {
  generateStroopStimulus,
  saveStroopResult,
} from "@/src/services/games/executive.service";
import { connectDB } from "@/src/config/db";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();
  return NextResponse.json(generateStroopStimulus());
}

export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();
  const result = await saveStroopResult(body.userId, body);
  return NextResponse.json({ result });
}
