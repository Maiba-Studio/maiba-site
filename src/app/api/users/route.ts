import { NextRequest, NextResponse } from "next/server";
import { getSession, hashPassword } from "@/lib/auth";
import { getUsers, createUser } from "@/lib/data";
import { hasValidOrigin, invalidOriginResponse } from "@/lib/request-security";
import { parseUserCreate } from "@/lib/validation";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await getUsers();
  const safe = users.map(({ passwordHash, ...u }) => {
    void passwordHash;
    return u;
  });
  return NextResponse.json(safe);
}

export async function POST(req: NextRequest) {
  if (!hasValidOrigin(req)) return invalidOriginResponse();

  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = parseUserCreate(await req.json());
  if (!payload) {
    return NextResponse.json(
      { error: "Username, role, and a 10+ character password are required" },
      { status: 400 }
    );
  }
  const { username, password, role } = payload;

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
  const { passwordHash, ...safe } = user;
  void passwordHash;
  return NextResponse.json(safe, { status: 201 });
}
