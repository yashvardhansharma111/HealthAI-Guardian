import authController from "@/src/controllers/auth.controller";
import { connectDB } from "@/src/config/db";

export async function POST(req: Request) {
  await connectDB();

  const body = await req.json();
  return authController.login(body);
}
