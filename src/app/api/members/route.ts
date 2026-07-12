import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createMember, getMembers, getPublishedMembers } from "@/lib/data";
import { hasValidOrigin, invalidOriginResponse } from "@/lib/request-security";
import { parseStudioMemberInput } from "@/lib/validation";

export async function GET(req: NextRequest) {
  const session = await getSession();
  const showAll = req.nextUrl.searchParams.get("all") === "true";

  const members =
    session && showAll ? await getMembers() : await getPublishedMembers();

  return NextResponse.json(members, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    if (!hasValidOrigin(req)) return invalidOriginResponse();

    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = parseStudioMemberInput(await req.json());
    if (!data) {
      return NextResponse.json({ error: "Invalid member payload" }, { status: 400 });
    }

    const member = await createMember(data);
    return NextResponse.json(member, { status: 201 });
  } catch (err) {
    console.error("POST /api/members error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
