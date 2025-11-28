import { NextResponse } from "next/server";
import { requireAuth } from "@/src/middlewares/auth.middleware";
import { requireRateLimit } from "@/src/middlewares/rateLimit.middleware";
import { generateVisuospatialSession } from "@/src/services/games/visuospatial.service";
import { connectDB } from "@/src/config/db";

export async function GET(req: Request) {
  const { error: rateErr } = requireRateLimit(req);
  if (rateErr) return rateErr;

  const { user, error } = requireAuth(req);
  if (error) return error;

  await connectDB();

  const url = new URL(req.url);
  const itemId = url.searchParams.get("itemId");

  if (!itemId)
    return NextResponse.json({ message: "itemId required" }, { status: 400 });

  const payload = await generateVisuospatialSession();

  return NextResponse.json(payload);
}
