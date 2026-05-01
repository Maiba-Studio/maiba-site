import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { clearSession } from "@/lib/auth";
import { hasValidOrigin, invalidOriginResponse } from "@/lib/request-security";

export async function POST(req: NextRequest) {
  if (!hasValidOrigin(req)) return invalidOriginResponse();

  await clearSession();
  return NextResponse.json({ success: true });
}
