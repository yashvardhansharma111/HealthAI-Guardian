import { NextResponse } from "next/server";
import { rateLimit } from "../utils/rateLimiter";

export function requireRateLimit(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const result = rateLimit(ip);

  if (!result.success) {
    return {
      error: NextResponse.json(
        {
          message: "Too many requests. Try again later.",
          retryAfter: result.retryAfter,
        },
        { status: 429 }
      ),
    };
  }

  return { success: true };
}
