import { NextResponse } from "next/server";
import { requireAuth } from "@/middlewares/auth.middleware";
import { connectDB } from "@/config/db";
import HealthPrediction from "@/models/healthPrediction.model";
import { success, failure } from "@/utils/apiResponse";

export async function GET(req: Request) {
  try {
    await connectDB();
    const authResult = requireAuth(req);

    if (authResult.error) {
      return authResult.error;
    }

    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const sort = url.searchParams.get("sort") || "desc"; // desc or asc

    // Fetch user's health predictions
    const predictions = await HealthPrediction.find({ userId: authResult.user.id })
      .sort({ createdAt: sort === "desc" ? -1 : 1 })
      .limit(limit)
      .select("-__v")
      .lean();

    return NextResponse.json(
      success(
        {
          predictions: predictions,
          count: predictions.length,
        },
        200
      )
    );
  } catch (err: any) {
    console.error("Get predictions error:", err);
    return NextResponse.json(
      failure(err.message || "Failed to fetch predictions"),
      { status: 500 }
    );
  }
}

