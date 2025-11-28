import resultsRepo from "@/repositories/gameResults.repository";
import { connectDB } from "@/config/db";
import { requireAuth } from "@/middlewares/auth.middleware";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { user, error } = requireAuth(req);
  if (error) return error;

  await connectDB();

  try {
    const { date } = await req.json();

    if (!date) {
      return NextResponse.json(
        { message: "Date is required" },
        { status: 400 }
      );
    }

    const targetDate = new Date(date);
    if (isNaN(targetDate.getTime())) {
      return NextResponse.json(
        { message: "Invalid date format" },
        { status: 400 }
      );
    }

    const today = await resultsRepo.getUserResultsByDay(user.id, targetDate);

    const yesterday = new Date(targetDate);
    yesterday.setDate(yesterday.getDate() - 1);

    const yday = await resultsRepo.getUserResultsByDay(user.id, yesterday);

    return NextResponse.json({ today, yesterday: yday });
  } catch {
    return NextResponse.json(
      { message: "Failed to fetch results" },
      { status: 500 }
    );
  }
}
