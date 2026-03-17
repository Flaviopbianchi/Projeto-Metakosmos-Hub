import { NextResponse } from "next/server";
import { searchMessages } from "@/lib/slack";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");
  if (!query?.trim()) {
    return NextResponse.json({ error: "q é obrigatório" }, { status: 400 });
  }
  try {
    const results = await searchMessages(query.trim());
    return NextResponse.json({ results });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
