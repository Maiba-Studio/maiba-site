import { NextRequest, NextResponse } from "next/server";
import { verifyCredentials, createSession, setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
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
