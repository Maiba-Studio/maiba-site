import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getEntry, updateEntry, deleteEntry } from "@/lib/data";
import { hasValidOrigin, invalidOriginResponse } from "@/lib/request-security";
import { parseFieldNotePatch } from "@/lib/validation";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const entry = await getEntry(id);
  const session = await getSession();
  if (!entry || (!entry.published && !session)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(entry, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!hasValidOrigin(req)) return invalidOriginResponse();

    const isAdmin = await getSession();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const data = parseFieldNotePatch(await req.json());
    if (!data) {
      return NextResponse.json({ error: "Invalid field note payload" }, { status: 400 });
    }

    const entry = await updateEntry(id, data);
    if (!entry) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(entry);
  } catch (err) {
    console.error("PUT /api/entries/[id] error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!hasValidOrigin(_req)) return invalidOriginResponse();

  const isAdmin = await getSession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const deleted = await deleteEntry(id);
  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
