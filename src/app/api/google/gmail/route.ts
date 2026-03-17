import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getGmailMessages,
  getGmailByCategory,
  getGmailDetail,
  markGmailAsRead,
  sendGmailReply,
} from "@/lib/google";

// GET /api/google/gmail
// GET /api/google/gmail?id=xxx          → full detail
// GET /api/google/gmail?category=updates → by category
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const id = searchParams.get("id");
  const category = searchParams.get("category") as "primary" | "updates" | null;

  try {
    if (id) {
      const message = await getGmailDetail(session.accessToken, id);
      return NextResponse.json({ message });
    }

    if (category === "primary" || category === "updates") {
      const messages = await getGmailByCategory(session.accessToken, category);
      return NextResponse.json({ messages });
    }

    const messages = await getGmailMessages(session.accessToken);
    return NextResponse.json({ messages });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH /api/google/gmail  { id: string }  → mark as read
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 });
    await markGmailAsRead(session.accessToken, id);
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/google/gmail  { to, subject, body, threadId, inReplyTo }  → send reply
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const opts = await req.json();
    if (!opts.to || !opts.subject || !opts.body || !opts.threadId || !opts.inReplyTo) {
      return NextResponse.json({ error: "Campos obrigatórios: to, subject, body, threadId, inReplyTo" }, { status: 400 });
    }
    await sendGmailReply(session.accessToken, opts);
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
