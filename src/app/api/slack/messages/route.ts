import { NextResponse } from "next/server";
import { getChannelMessages } from "@/lib/slack";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const channelId = searchParams.get("channel");
  const limit = parseInt(searchParams.get("limit") ?? "20", 10);
  if (!channelId) return NextResponse.json({ error: "channel obrigatório" }, { status: 400 });
  try {
    const messages = await getChannelMessages(channelId, limit);
    return NextResponse.json({ messages });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
