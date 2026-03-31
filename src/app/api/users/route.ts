import { NextRequest, NextResponse } from "next/server";
import { getSession, hashPassword } from "@/lib/auth";
import { getUsers, createUser } from "@/lib/data";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await getUsers();
  const safe = users.map(({ passwordHash: _, ...u }) => u);
  return NextResponse.json(safe);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { username, password, role } = await req.json();
  if (!username || !password) {
    return NextResponse.json(
      { error: "Username and password required" },
      { status: 400 }
    );
  }

  if (role !== "moderator" && role !== "admin") {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const existing = await getUsers();
  if (
    existing.some((u) => u.username === username) ||
    username === process.env.ADMIN_USERNAME
  ) {
    return NextResponse.json(
      { error: "Username already taken" },
      { status: 409 }
    );
  }

  const hash = await hashPassword(password);
  const user = await createUser({ username, passwordHash: hash, role });
  const { passwordHash: _, ...safe } = user;
  return NextResponse.json(safe, { status: 201 });
}
