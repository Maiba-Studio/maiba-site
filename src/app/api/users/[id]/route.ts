import { NextRequest, NextResponse } from "next/server";
import { getSession, hashPassword } from "@/lib/auth";
import { getUserById, updateUser, deleteUser } from "@/lib/data";
import { hasValidOrigin, invalidOriginResponse } from "@/lib/request-security";
import { parseUserPatch } from "@/lib/validation";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!hasValidOrigin(req)) return invalidOriginResponse();

  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = parseUserPatch(await req.json());
  if (!body) {
    return NextResponse.json({ error: "Invalid user payload" }, { status: 400 });
  }

  const patch: Record<string, string> = {};

  if (body.username) patch.username = body.username;
  if (body.role) patch.role = body.role;
  if (body.password) {
    patch.passwordHash = await hashPassword(body.password);
  }

  const user = await updateUser(id, patch);
  if (!user) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { passwordHash, ...safe } = user;
  void passwordHash;
  return NextResponse.json(safe);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!hasValidOrigin(req)) return invalidOriginResponse();

  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const user = await getUserById(id);
  if (!user) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (user.role === "admin" && user.id === session.userId) {
    return NextResponse.json(
      { error: "Cannot delete your own account" },
      { status: 400 }
    );
  }

  await deleteUser(id);
  return NextResponse.json({ success: true });
}
