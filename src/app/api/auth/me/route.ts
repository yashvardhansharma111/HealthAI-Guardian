import { connectDB } from "@/config/db";
import { requireAuth } from "@/middlewares/auth.middleware";
import { success, failure } from "@/utils/apiResponse";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    await connectDB();
    const authResult = requireAuth(req);

    if (authResult.error) {
      return authResult.error;
    }

    return NextResponse.json(success({ user: authResult.user }, 200));
  } catch (err) {
    return NextResponse.json(failure(err), { status: 401 });
  }
}

