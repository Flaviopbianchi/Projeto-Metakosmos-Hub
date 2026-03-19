import { NextResponse } from "next/server";
import {
  getMyIssues,
  getWorkflowStates,
  updateIssueStatus,
  getIssueDetails,
  getCompletedThisWeek,
  getCompletedThisMonth,
} from "@/lib/linear";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const issueId = searchParams.get("issueId");

  if (issueId) {
    try {
      const detail = await getIssueDetails(issueId);
      return NextResponse.json(detail);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  try {
    const [issues, states, completedThisWeek, completedThisMonth] = await Promise.all([
      getMyIssues(),
      getWorkflowStates(),
      getCompletedThisWeek(),
      getCompletedThisMonth(),
    ]);
    return NextResponse.json({ issues, states, completedThisWeek, completedThisMonth });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { issueId, stateId } = await req.json();
    if (!issueId || !stateId) {
      return NextResponse.json({ error: "issueId e stateId são obrigatórios" }, { status: 400 });
    }
    await updateIssueStatus(issueId, stateId);
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
