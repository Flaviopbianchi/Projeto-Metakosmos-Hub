import { LinearClient } from "@linear/sdk";

export function getLinearClient() {
  const apiKey = process.env.LINEAR_API_KEY;
  if (!apiKey) throw new Error("LINEAR_API_KEY not set");
  return new LinearClient({ apiKey });
}

export async function getMyIssues() {
  const client = getLinearClient();
  const me = await client.viewer;
  const issues = await me.assignedIssues({
    filter: { completedAt: { null: true } },
    orderBy: "updatedAt" as never,
  });
  return issues.nodes.map((i) => ({
    id: i.id,
    title: i.title,
    priority: i.priority,
    state: i.state,
    url: i.url,
    identifier: i.identifier,
  }));
}

export async function getProjects() {
  const client = getLinearClient();
  const projects = await client.projects({ first: 50 });
  return projects.nodes.map((p) => ({
    id: p.id,
    name: p.name,
    state: p.state,
    url: p.url,
    progress: p.progress,
  }));
}

export async function getInitiatives() {
  const client = getLinearClient();
  const orgs = await client.organization;
  const initiatives = await orgs.initiatives?.({ first: 50 });
  return (
    initiatives?.nodes.map((i) => ({
      id: i.id,
      name: i.name,
      description: i.description ?? null,
    })) ?? []
  );
}

export async function getMilestones() {
  const client = getLinearClient();
  const projects = await client.projects({ first: 50 });
  const milestones: { id: string; name: string; targetDate: string | null; projectName: string }[] = [];
  for (const project of projects.nodes) {
    const ms = await project.projectMilestones({ first: 20 });
    for (const m of ms.nodes) {
      milestones.push({
        id: m.id,
        name: m.name,
        targetDate: m.targetDate ?? null,
        projectName: project.name,
      });
    }
  }
  return milestones;
}
