import { NextRequest, NextResponse } from "next/server";
import { verifyLampPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  if (!password || typeof password !== "string") {
    return NextResponse.json({ valid: false }, { status: 400 });
  }

  const result = await verifyLampPassword(password);
  return NextResponse.json(result);
}
