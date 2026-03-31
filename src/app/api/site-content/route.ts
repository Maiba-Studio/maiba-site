import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getSiteContent, saveSiteContent } from "@/lib/data";

export async function GET() {
  const content = await getSiteContent();
  return NextResponse.json(content);
}

export async function PUT(req: NextRequest) {
  const isAdmin = await getSession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await req.json();
  await saveSiteContent(data);
  return NextResponse.json({ success: true });
}
