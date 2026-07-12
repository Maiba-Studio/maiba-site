import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getProjectsPageContent, saveProjectsPageContent } from "@/lib/data";
import { hasValidOrigin, invalidOriginResponse } from "@/lib/request-security";
import { parseProjectsPageContent } from "@/lib/validation";

export async function GET() {
  const page = await getProjectsPageContent();
  return NextResponse.json(page, {
    headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
  });
}

export async function PUT(req: NextRequest) {
  try {
    if (!hasValidOrigin(req)) return invalidOriginResponse();

    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const page = parseProjectsPageContent(await req.json());
    if (!page) {
      return NextResponse.json({ error: "Invalid page content" }, { status: 400 });
    }

    await saveProjectsPageContent(page);
    return NextResponse.json(page);
  } catch (err) {
    console.error("PUT /api/projects/page error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
