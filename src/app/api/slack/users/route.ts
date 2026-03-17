import { NextResponse } from "next/server";
import { getUsers } from "@/lib/slack";

export async function GET() {
  try {
    const users = await getUsers();
    return NextResponse.json({ users });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
