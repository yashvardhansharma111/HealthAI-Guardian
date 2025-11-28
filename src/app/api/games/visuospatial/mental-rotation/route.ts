import { NextResponse } from "next/server";
import { requireAuth } from "@/middlewares/auth.middleware";
import { requireRateLimit } from "@/middlewares/rateLimit.middleware";
import {
  generateVisuospatialSession,
  saveVisuospatialResult,
} from "@/services/games/visuospatial.service";
import { connectDB } from "@/config/db";

export async function GET(req: Request) {
  const { error: rlErr } = requireRateLimit(req);
  if (rlErr) return rlErr;

  const { user, error } = requireAuth(req);
  if (error) return error;

  await connectDB();

  const session = await generateVisuospatialSession();

  return NextResponse.json(session);
}

export async function POST(req: Request) {
  const { error: rlErr } = requireRateLimit(req);
  if (rlErr) return rlErr;

  const { user, error } = requireAuth(req);
  if (error) return error;

  await connectDB();
  const body = await req.json();

  const result = await saveVisuospatialResult(user.id, body);

  return NextResponse.json({ result });
}
