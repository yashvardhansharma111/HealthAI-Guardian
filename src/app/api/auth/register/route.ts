import { connectDB } from "@/config/db";
import authController from "@/controllers/auth.controller";

export async function POST(req: Request) {
  await connectDB();

  const body = await req.json();
  return authController.register(body);
}
