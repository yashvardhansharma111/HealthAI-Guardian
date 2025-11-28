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

    const formData = await req.formData();

    // Forward to FastAPI
    const response = await fetch(`${FASTAPI_URL}/submit-question`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
      return NextResponse.json(
        failure(errorData.error || "Failed to submit question"),
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(
      success(data, 200)
    );
  } catch (error: any) {
    console.error("Submit question error:", error);
    return NextResponse.json(
      failure(error.message || "Failed to submit question"),
      { status: 500 }
    );
  }
}

