import { NextResponse } from "next/server";
import { getChannelMessages } from "@/lib/slack";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const channelId = searchParams.get("channel");
  if (!channelId) return NextResponse.json({ error: "channel obrigatório" }, { status: 400 });
  try {
    const messages = await getChannelMessages(channelId);
    return NextResponse.json({ messages });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
