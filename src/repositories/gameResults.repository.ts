import GameResult from "../models/gameResult.model";

async function saveResult(data: any) {
  return GameResult.create(data);
}

async function getUserResultsByDay(userId: string, date: Date) {
  const start = new Date(date.setHours(0, 0, 0, 0));
  const end = new Date(date.setHours(23, 59, 59, 999));

  return GameResult.find({
    userId,
    timestamp: { $gte: start, $lte: end },
  });
}

export default { saveResult, getUserResultsByDay };
