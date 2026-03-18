import { NextResponse } from "next/server";

const CLARITY_API_BASE = "https://www.clarity.ms/export/api/v1";

export async function GET(request: Request) {
  const projectId = process.env.CLARITY_PROJECT_ID;
  const token = process.env.CLARITY_API_TOKEN;

  if (!projectId || projectId === "PREENCHER_NO_DASHBOARD") {
    return NextResponse.json(
      { error: "CLARITY_PROJECT_ID não configurado no .env.local" },
      { status: 503 }
    );
  }

  if (!token) {
    return NextResponse.json(
      { error: "CLARITY_API_TOKEN não configurado no .env.local" },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("startDate") ?? getDateDaysAgo(7);
  const endDate = searchParams.get("endDate") ?? getDateDaysAgo(0);

  try {
    const res = await fetch(
      `${CLARITY_API_BASE}/${projectId}/query/metrics?startDate=${startDate}&endDate=${endDate}&numOfDays=7`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        next: { revalidate: 3600 }, // cache 1h
      }
    );

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: `Clarity API error ${res.status}`, detail: text },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: "Falha ao conectar na Clarity API", detail: String(err) },
      { status: 500 }
    );
  }
}

function getDateDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split("T")[0]; // YYYY-MM-DD
}
