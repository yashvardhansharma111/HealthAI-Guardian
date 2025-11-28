import { NextResponse } from "next/server";
import { verifyAccessToken } from "../utils/auth";

export function requireAuth(req: Request) {
  const auth = req.headers.get("authorization");

  if (!auth) {
    return NextResponse.json({ message: "No token provided" }, { status: 401 });
  }

  const token = auth.split(" ")[1];

  try {
    const decoded = verifyAccessToken(token);
    return decoded;
  } catch (err) {
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }
}
