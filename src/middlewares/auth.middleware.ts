import { NextResponse } from "next/server";
import { verifyAccessToken } from "../utils/auth";

export function requireAuth(req: Request) {
  const cookieHeader = req.headers.get("cookie");

  if (!cookieHeader) {
    return {
      error: NextResponse.json(
        { message: "Authentication cookie missing" },
        { status: 401 }
      ),
    };
  }

  const token = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("token="))
    ?.split("=")[1];

  if (!token) {
    return {
      error: NextResponse.json(
        { message: "Token missing in cookies" },
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
