import { NextResponse } from "next/server";
import { requireAuth } from "@/middlewares/auth.middleware";
import { success, failure } from "@/utils/apiResponse";

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || process.env.FASTAPI_URL || "http://localhost:8000";

export async function POST(req: Request) {
  try {
    const authResult = requireAuth(req);

    if (authResult.error) {
      return authResult.error;
    }

    const body = await req.json().catch(() => ({}));
    const user_id = authResult.user.id;

    // Start session in FastAPI
    const response = await fetch(`${FASTAPI_URL}/start-session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: user_id,
        ...body,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
      return NextResponse.json(
        failure(errorData.error || "Failed to start session"),
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(
      success(data, 200)
    );
  } catch (error: any) {
    console.error("Start session error:", error);
    return NextResponse.json(
      failure(error.message || "Failed to start session"),
      { status: 500 }
    );
  }
}

