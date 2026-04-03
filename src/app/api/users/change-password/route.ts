import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import {
  getSession,
  hashPassword,
  getAdminPasswordHash,
  setAdminPasswordHash,
} from "@/lib/auth";
import { getUserById, updateUser } from "@/lib/data";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current and new password required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    if (session.userId === "env-admin") {
      const adminHash = await getAdminPasswordHash();
      if (!adminHash || !(await bcrypt.compare(currentPassword, adminHash))) {
        return NextResponse.json(
          { error: "Current password is incorrect" },
          { status: 401 }
        );
      }

      const newHash = await hashPassword(newPassword);
      await setAdminPasswordHash(newHash);
      return NextResponse.json({ success: true });
    }

    const user = await getUserById(session.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const match = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!match) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 401 }
      );
    }

    const newHash = await hashPassword(newPassword);
    await updateUser(user.id, { passwordHash: newHash });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST /api/users/change-password error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
