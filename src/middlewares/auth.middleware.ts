import { NextResponse } from "next/server";
import { verifyAccessToken } from "../utils/auth";

export function requireAuth(req: Request) {
  // Check Authorization header first (for localStorage token)
  const authHeader = req.headers.get("authorization");
  let token: string | undefined;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  } else {
    // Fallback to cookie if no Authorization header
    const cookieHeader = req.headers.get("cookie");
    if (cookieHeader) {
      token = cookieHeader
        .split(";")
        .map((c) => c.trim())
        .find((c) => c.startsWith("token="))
        ?.split("=")[1];
    }
  }

  if (!token) {
    return {
      error: NextResponse.json(
        { message: "Authentication token missing" },
        { status: 401 }
      ),
    };
  }

  try {
    const decoded = verifyAccessToken(token);
    return { user: decoded };
  } catch {
    return {
      error: NextResponse.json(
        { message: "Invalid or expired token" },
        { status: 401 }
      ),
    };
  }
}
