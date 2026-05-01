import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getLampWords, createLampWord } from "@/lib/data";
import { hasValidOrigin, invalidOriginResponse } from "@/lib/request-security";
import { parseLampWordInput } from "@/lib/validation";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const words = await getLampWords();
  return NextResponse.json(words);
}

export async function POST(req: NextRequest) {
  if (!hasValidOrigin(req)) return invalidOriginResponse();

  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = parseLampWordInput(await req.json());
  if (!payload) {
    return NextResponse.json(
      { error: "Valid word and link required" },
      { status: 400 }
    );
  }

  const entry = await createLampWord(payload.word, payload.link);
  return NextResponse.json(entry, { status: 201 });
}
