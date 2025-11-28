import { NextResponse } from "next/server";
import { requireAuth } from "@/middlewares/auth.middleware";
import { success, failure } from "@/utils/apiResponse";

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || process.env.FASTAPI_URL || "http://localhost:8000";

export async function GET(
  req: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const authResult = requireAuth(req);

    if (authResult.error) {
      return authResult.error;
    }

    const sessionId = params.sessionId;

    // Get session from FastAPI
    const response = await fetch(`${FASTAPI_URL}/get-session/${sessionId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
      return NextResponse.json(
        failure(errorData.error || "Failed to get session"),
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(
      success(data, 200)
    );
  } catch (error: any) {
    console.error("Get session error:", error);
    return NextResponse.json(
      failure(error.message || "Failed to get session"),
      { status: 500 }
    );
  }
}

