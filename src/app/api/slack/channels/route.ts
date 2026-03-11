import { NextResponse } from "next/server";
import { getChannels } from "@/lib/slack";

export async function GET() {
  try {
    const channels = await getChannels();
    return NextResponse.json({ channels });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
