import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getEntries, getHomeEntries, createEntry } from "@/lib/data";
import { hasValidOrigin, invalidOriginResponse } from "@/lib/request-security";
import { parseFieldNoteInput } from "@/lib/validation";

export async function GET(req: NextRequest) {
  const isAdmin = await getSession();
  const showAll = req.nextUrl.searchParams.get("all") === "true";

  const entries =
    isAdmin && showAll ? await getEntries() : await getHomeEntries();
  return NextResponse.json(entries, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    if (!hasValidOrigin(req)) return invalidOriginResponse();

    const isAdmin = await getSession();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = parseFieldNoteInput(await req.json());
    if (!data) {
      return NextResponse.json({ error: "Invalid field note payload" }, { status: 400 });
    }

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
