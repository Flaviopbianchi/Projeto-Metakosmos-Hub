import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCalendarEvents, patchCalendarRsvp } from "@/lib/google";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  try {
    const events = await getCalendarEvents(session.accessToken);
    return NextResponse.json({ events });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  try {
    const { eventId, status } = await req.json();
    if (!eventId || !["accepted", "declined", "tentative"].includes(status)) {
      return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
    }
    await patchCalendarRsvp(session.accessToken, eventId, status);
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
