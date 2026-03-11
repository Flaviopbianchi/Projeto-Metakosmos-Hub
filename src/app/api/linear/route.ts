import { NextResponse } from "next/server";
import { getMyIssues, getProjects, getInitiatives, getMilestones } from "@/lib/linear";

export async function GET() {
  try {
    const [issues, projects, initiatives, milestones] = await Promise.all([
      getMyIssues(),
      getProjects(),
      getInitiatives(),
      getMilestones(),
    ]);
    return NextResponse.json({ issues, projects, initiatives, milestones });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
