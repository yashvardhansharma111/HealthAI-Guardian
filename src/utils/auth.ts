import jwt, { JwtPayload } from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";

const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET!;
const REFRESH_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || "7d";

// ==========================
// PASSWORD HELPERS
// ==========================

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

// ==========================
// ACCESS TOKEN
// ==========================

// normalized function name (createAccessToken)
export function createAccessToken(userId: string) {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyAccessToken(token: string): JwtPayload & { id: string } {
  const decoded = jwt.verify(token, JWT_SECRET);

  if (typeof decoded === "string" || !("id" in decoded)) {
    throw new Error("Invalid token payload");
  }

  return decoded as JwtPayload & { id: string };
}

// ==========================
// REFRESH TOKEN (optional use)
// ==========================

export function createRefreshToken(userId: string) {
  return jwt.sign({ id: userId }, REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRES_IN,
  });
}

export function verifyRefreshToken(token: string): JwtPayload & { id: string } {
  const decoded = jwt.verify(token, REFRESH_SECRET);

  if (typeof decoded === "string" || !("id" in decoded)) {
    throw new Error("Invalid refresh token payload");
  }

  return decoded as JwtPayload & { id: string };
}
