const SLACK_TOKEN = process.env.SLACK_TOKEN;

async function slackFetch(endpoint: string, params?: Record<string, string>) {
  if (!SLACK_TOKEN) throw new Error("SLACK_TOKEN not set");
  const url = new URL(`https://slack.com/api/${endpoint}`);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${SLACK_TOKEN}` },
    next: { revalidate: 60 },
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.error ?? "Slack API error");
  return data;
}

export async function getChannels() {
  const data = await slackFetch("conversations.list", {
    types: "public_channel,private_channel",
    exclude_archived: "true",
    limit: "50",
  });
  return (data.channels as Array<{ id: string; name: string; is_private: boolean; num_members: number }>).map((c) => ({
    id: c.id,
    name: c.name,
    isPrivate: c.is_private,
    members: c.num_members,
  }));
}

export async function getChannelMessages(channelId: string) {
  const data = await slackFetch("conversations.history", {
    channel: channelId,
    limit: "20",
  });
  return (data.messages as Array<{ ts: string; text: string; user?: string; bot_id?: string; subtype?: string }>)
    .filter((m) => !m.subtype)
    .map((m) => ({
      ts: m.ts,
      text: m.text,
      user: m.user ?? null,
      isBot: !!m.bot_id,
      date: new Date(parseFloat(m.ts) * 1000).toISOString(),
    }));
}

export async function getUserName(userId: string) {
  try {
    const data = await slackFetch("users.info", { user: userId });
    return data.user?.real_name ?? data.user?.name ?? userId;
  } catch {
    return userId;
  }
}
