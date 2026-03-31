import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getLampWords, createLampWord } from "@/lib/data";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const words = await getLampWords();
  return NextResponse.json(words);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { word, link } = await req.json();
  if (!word || !link) {
    return NextResponse.json(
      { error: "Word and link required" },
      { status: 400 }
    );
  }

  const entry = await createLampWord(word, link);
  return NextResponse.json(entry, { status: 201 });
}
