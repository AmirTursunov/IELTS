import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

// JWT token yaratish
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

// JWT token verify qilish
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

// Verification token yaratish
export function generateVerificationToken(): string {
  return jwt.sign({ random: Math.random() }, JWT_SECRET, { expiresIn: "24h" });
}
