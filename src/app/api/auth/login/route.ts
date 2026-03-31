import { NextRequest, NextResponse } from "next/server";
import {
  verifyAdminCredentials,
  createSession,
  setSessionCookie,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  if (!username || !password) {
    return NextResponse.json(
      { error: "Username and password required" },
      { status: 400 }
    );
  }

  const valid = await verifyAdminCredentials(username, password);
  if (!valid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = await createSession();
  await setSessionCookie(token);
  return NextResponse.json({ success: true });
}
