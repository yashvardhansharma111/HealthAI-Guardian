import resultsRepo from "@/src/repositories/gameResults.repository";
import { connectDB } from "@/src/config/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  await connectDB();
  const { userId, date } = await req.json();

  const today = new Date(date);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const todayResults = await resultsRepo.getUserResultsByDay(userId, today);
  const yesterdayResults = await resultsRepo.getUserResultsByDay(
    userId,
    yesterday
  );

  return NextResponse.json({
    today: todayResults,
    yesterday: yesterdayResults,
  });
}
