import { NextRequest, NextResponse } from "next/server";
import { verifyCredentials, createSession, setSessionCookie } from "@/lib/auth";
import {
  getClientIp,
  hasValidOrigin,
  invalidOriginResponse,
  rateLimit,
  rateLimitResponse,
} from "@/lib/request-security";

export async function POST(req: NextRequest) {
  if (!hasValidOrigin(req)) return invalidOriginResponse();

  const ip = getClientIp(req);
  const limited = rateLimit(`login:${ip}`, { windowMs: 15 * 60 * 1000, max: 20 });
  if (!limited.ok) return rateLimitResponse(limited.retryAfter);

  const { username, password } = await req.json();

  if (!username || !password) {
    return NextResponse.json(
      { error: "Username and password required" },
      { status: 400 }
    );
  }

  const result = await verifyCredentials(username, password);
  if (!result.valid || !result.role || !result.userId) {
    return NextResponse.json(
      { error: "Invalid credentials" },
      { status: 401 }
    );
  }

  const token = await createSession(result.role, result.userId, username);
  await setSessionCookie(token);
  return NextResponse.json({ success: true, role: result.role });
}
