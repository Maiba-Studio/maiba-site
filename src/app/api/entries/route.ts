import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getEntries, getPublishedEntries, createEntry } from "@/lib/data";

export async function GET(req: NextRequest) {
  const isAdmin = await getSession();
  const showAll = req.nextUrl.searchParams.get("all") === "true";

  const entries =
    isAdmin && showAll ? await getEntries() : await getPublishedEntries();
  return NextResponse.json(entries);
}

export async function POST(req: NextRequest) {
  try {
    const isAdmin = await getSession();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const entry = await createEntry(data);
    return NextResponse.json(entry, { status: 201 });
  } catch (err) {
    console.error("POST /api/entries error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
