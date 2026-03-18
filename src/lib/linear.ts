import { LinearClient } from "@linear/sdk";

// ─── In-memory cache (server-side, 1-hour TTL) ──────────────────────────────
const TTL_MS = 60 * 60 * 1000;
const cache = new Map<string, { data: unknown; expiresAt: number }>();

async function cached<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const hit = cache.get(key);
  if (hit && hit.expiresAt > Date.now()) return hit.data as T;
  const data = await fn();
  cache.set(key, { data, expiresAt: Date.now() + TTL_MS });
  return data;
}
// ─────────────────────────────────────────────────────────────────────────────

export function getLinearClient() {
  const apiKey = process.env.LINEAR_API_KEY;
  if (!apiKey) throw new Error("LINEAR_API_KEY not set");
  return new LinearClient({ apiKey });
}

async function _getMyIssues() {
  const client = getLinearClient();
  const me = await client.viewer;
  const issues = await me.assignedIssues({
    filter: { completedAt: { null: true } },
    orderBy: "updatedAt" as never,
  });
  const resolved = await Promise.all(
    issues.nodes.map(async (i) => {
      const [state, project, team] = await Promise.all([i.state, i.project, i.team]);
      return {
        id: i.id,
        title: i.title,
        priority: i.priority,
        stateId: state?.id ?? "",
        stateName: state?.name ?? "Unknown",
        stateColor: state?.color ?? "#6b7280",
        stateType: (state?.type ?? "started") as string,
        url: i.url,
        identifier: i.identifier,
        projectName: project?.name ?? null,
        teamId: team?.id ?? undefined,
      };
    })
  );
  return resolved.filter((i) => i.stateType === "started" || i.stateType === "unstarted");
}

export function getMyIssues() {
  return cached("myIssues", _getMyIssues);
}

async function _getWorkflowStates() {
  const client = getLinearClient();
  const states = await client.workflowStates({ first: 100 });
  return Promise.all(
    states.nodes.map(async (s) => {
      const team = await s.team;
      return {
        id: s.id,
        name: s.name,
        color: s.color,
        type: s.type as string,
        teamId: team?.id ?? undefined,
      };
    })
  );
}

export function getWorkflowStates() {
  return cached("workflowStates", _getWorkflowStates);
}

export async function updateIssueStatus(issueId: string, stateId: string) {
  const client = getLinearClient();
  const issue = await client.issue(issueId);
  await issue.update({ stateId });
  cache.delete("myIssues");
}

export async function getIssueDetails(issueId: string) {
  const client = getLinearClient();
  const issue = await client.issue(issueId);
  const [state, project, assignee, labels] = await Promise.all([
    issue.state,
    issue.project,
    issue.assignee,
    issue.labels({ first: 20 }),
  ]);
  return {
    id: issue.id,
    title: issue.title,
    description: issue.description ?? null,
    priority: issue.priority,
    identifier: issue.identifier,
    url: issue.url,
    stateId: state?.id ?? "",
    stateName: state?.name ?? "Unknown",
    stateColor: state?.color ?? "#6b7280",
    stateType: (state?.type ?? "started") as string,
    projectName: project?.name ?? null,
    assigneeName: assignee?.name ?? null,
    assigneeAvatarUrl: assignee?.avatarUrl ?? null,
    createdAt: issue.createdAt?.toISOString() ?? null,
    updatedAt: issue.updatedAt?.toISOString() ?? null,
    dueDate: issue.dueDate ?? null,
    labels: labels.nodes.map((l: { id: string; name: string; color: string }) => ({
      id: l.id,
      name: l.name,
      color: l.color,
    })),
  };
}

async function _getProjects() {
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

export function getProjects() {
  return cached("projects", _getProjects);
}

async function _getInitiatives() {
  const client = getLinearClient();
  const orgs = await client.organization;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const initiatives = await (orgs as any).initiatives?.({ first: 50 });
  return (
    initiatives?.nodes.map((i: { id: string; name: string; description?: string | null }) => ({
      id: i.id,
      name: i.name,
      description: i.description ?? null,
    })) ?? []
  );
}

export function getInitiatives() {
  return cached("initiatives", _getInitiatives);
}

async function _getMilestones() {
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

export function getMilestones() {
  return cached("milestones", _getMilestones);
}
