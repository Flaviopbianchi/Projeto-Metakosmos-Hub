import { NextResponse } from "next/server";
import { uploadFile } from "@/lib/slack";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const channelId = form.get("channelId") as string | null;
    const file = form.get("file") as File | null;

    if (!channelId || !file) {
      return NextResponse.json({ error: "channelId e file são obrigatórios" }, { status: 400 });
    }

    const buffer = new Uint8Array(await file.arrayBuffer());
    const result = await uploadFile(channelId, file.name, buffer, file.type || "application/octet-stream");
    return NextResponse.json({ ok: true, result });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
