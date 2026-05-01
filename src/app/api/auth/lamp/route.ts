import { NextRequest, NextResponse } from "next/server";
import { verifyLampPassword } from "@/lib/auth";
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
  const limited = rateLimit(`lamp:${ip}`, { windowMs: 15 * 60 * 1000, max: 30 });
  if (!limited.ok) return rateLimitResponse(limited.retryAfter);

  const { password } = await req.json();
  if (!password || typeof password !== "string") {
    return NextResponse.json({ valid: false }, { status: 400 });
  }

  const result = await verifyLampPassword(password);
  return NextResponse.json(result);
}
