// GET /api/notifier?secret=... — endpoint local para o scripts/notifier.js
// Retorna emails não lidos do Ian e da Gabs para o notifier disparar toasts.
// Protegido por NOTIFIER_SECRET (só funciona localmente).

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { google } from "googleapis";

const WATCHED_SENDERS = [
  "ian@metakosmos.com.br",
  "gabriela.scanferla@metakosmos.com.br",
];

export async function GET(req: NextRequest) {
  // Valida o secret local
  const secret = req.nextUrl.searchParams.get("secret");
  if (!secret || secret !== process.env.NOTIFIER_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Precisa de sessão ativa (usuário logado no mKHub)
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ emails: [], reason: "not_authenticated" });
  }

  try {
    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    auth.setCredentials({ access_token: session.accessToken });

    const gmail = google.gmail({ version: "v1", auth });
    const query = WATCHED_SENDERS.map((e) => `from:${e}`).join(" OR ");

    const listRes = await gmail.users.messages.list({
      userId: "me",
      q: `(${query}) is:unread newer_than:1d`,
      maxResults: 10,
    });

    const messages = listRes.data.messages || [];
    const emails: { id: string; from: string; subject: string }[] = [];

    for (const msg of messages.slice(0, 5)) {
      if (!msg.id) continue;
      const detail = await gmail.users.messages.get({
        userId: "me",
        id: msg.id,
        format: "metadata",
        metadataHeaders: ["From", "Subject"],
      });

      const headers = detail.data.payload?.headers || [];
      const fromHeader = headers.find((h) => h.name === "From")?.value || "";
      const subject =
        headers.find((h) => h.name === "Subject")?.value || "(sem assunto)";

      // Extrai o email de "Nome <email@dominio.com>"
      const emailMatch = fromHeader.match(/<(.+?)>/) || [null, fromHeader];
      const senderEmail = emailMatch[1]?.toLowerCase().trim() || "";

      if (WATCHED_SENDERS.includes(senderEmail)) {
        const fromName = fromHeader.split("<")[0].trim() || senderEmail;
        emails.push({ id: msg.id, from: fromName, subject });
      }
    }

    return NextResponse.json({ emails });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Erro desconhecido";
    return NextResponse.json({ emails: [], error: message });
  }
}
