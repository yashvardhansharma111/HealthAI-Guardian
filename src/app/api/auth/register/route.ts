import { connectDB } from "@/src/config/db";
import authController from "@/src/controllers/auth.controller";

export async function POST(req: Request) {
  await connectDB();

  const body = await req.json();
  return authController.register(body);
}
