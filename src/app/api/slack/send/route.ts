import { NextResponse } from "next/server";
import { sendMessage } from "@/lib/slack";

export async function POST(req: Request) {
  try {
    const { channelId, text } = await req.json();
    if (!channelId || !text?.trim()) {
      return NextResponse.json({ error: "channelId e text são obrigatórios" }, { status: 400 });
    }
    const message = await sendMessage(channelId, text.trim());
    return NextResponse.json({ message });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
