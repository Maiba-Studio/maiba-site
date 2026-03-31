import { NextRequest, NextResponse } from "next/server";
import { getSession, hashPassword } from "@/lib/auth";
import { getUserById, updateUser, deleteUser } from "@/lib/data";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
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

  const { passwordHash: _, ...safe } = user;
  return NextResponse.json(safe);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
