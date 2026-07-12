import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createProject, getProjects, getPublishedProjects } from "@/lib/data";
import { hasValidOrigin, invalidOriginResponse } from "@/lib/request-security";
import { parseProjectInput } from "@/lib/validation";

export async function GET(req: NextRequest) {
  const session = await getSession();
  const showAll = req.nextUrl.searchParams.get("all") === "true";

  const projects =
    session && showAll ? await getProjects() : await getPublishedProjects();

  return NextResponse.json(projects, {
    headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
  });
}

export async function POST(req: NextRequest) {
  try {
    if (!hasValidOrigin(req)) return invalidOriginResponse();

    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = parseProjectInput(await req.json());
    if (!data) {
      return NextResponse.json({ error: "Invalid project payload" }, { status: 400 });
    }

    const project = await createProject(data);
    return NextResponse.json(project, { status: 201 });
  } catch (err) {
    console.error("POST /api/projects error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
