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
  if (!data.ok) throw new Error(`${data.error ?? "Slack API error"}${data.needed ? ` (precisa do escopo: ${data.needed})` : ""}`);
  return data;
}

type RawChannel = {
  id: string;
  name?: string;
  user?: string;
  is_private: boolean;
  is_channel: boolean;
  is_group: boolean;
  is_im: boolean;
  is_mpim: boolean;
  is_member?: boolean;
  num_members?: number;
  latest?: { ts?: string };
};

export type Channel = {
  id: string;
  name: string;
  isPrivate: boolean;
  isIm: boolean;
  isMpim: boolean;
  isGroup: boolean;
  members: number;
  latestTs?: string;
};

export async function getChannels(): Promise<Channel[]> {
  const allChannels: Channel[] = [];
  let cursor: string | undefined;

  do {
    const params: Record<string, string> = {
      types: "public_channel,private_channel,mpim,im",
      exclude_archived: "true",
      limit: "200",
    };
    if (cursor) params.cursor = cursor;

    const data = await slackFetch("conversations.list", params);

    for (const c of data.channels as RawChannel[]) {
      // For public/private channels only include ones the user is a member of.
      // IMs and MPIMs are always accessible.
      if (!c.is_im && !c.is_mpim && c.is_member === false) continue;

      allChannels.push({
        id: c.id,
        name: c.name ?? (c.user ? `DM: ${c.user}` : c.id),
        isPrivate: c.is_private,
        isIm: c.is_im,
        isMpim: c.is_mpim,
        isGroup: c.is_group && !c.is_mpim,
        members: c.num_members ?? (c.is_im ? 1 : 0),
        latestTs: c.latest?.ts,
      });
    }

    cursor = data.response_metadata?.next_cursor || undefined;
  } while (cursor);

  // Sort alphabetically by name
  allChannels.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

  return allChannels;
}

export type SlackUser = {
  id: string;
  name: string;
  realName: string;
  displayName: string;
  avatarUrl: string | null;
  isBot: boolean;
};

export async function getUsers(limitPages = 3): Promise<SlackUser[]> {
  const allUsers: SlackUser[] = [];
  let cursor: string | undefined;
  let page = 0;

  do {
    const params: Record<string, string> = { limit: "200" };
    if (cursor) params.cursor = cursor;

    const data = await slackFetch("users.list", params);

    for (const u of data.members as Array<{
      id: string;
      name: string;
      real_name?: string;
      deleted?: boolean;
      is_bot?: boolean;
      profile?: { display_name?: string; real_name?: string; image_72?: string };
    }>) {
      if (u.deleted) continue;
      allUsers.push({
        id: u.id,
        name: u.name,
        realName: u.real_name ?? u.profile?.real_name ?? u.name,
        displayName: u.profile?.display_name || u.name,
        avatarUrl: u.profile?.image_72 ?? null,
        isBot: u.is_bot ?? false,
      });
    }

    cursor = data.response_metadata?.next_cursor || undefined;
    page++;
  } while (cursor && page < limitPages);

  return allUsers;
}

export async function getChannelMessages(channelId: string, limit = 20) {
  const data = await slackFetch("conversations.history", {
    channel: channelId,
    limit: String(limit),
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

export async function sendMessage(channelId: string, text: string) {
  if (!SLACK_TOKEN) throw new Error("SLACK_TOKEN not set");
  const res = await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SLACK_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ channel: channelId, text }),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(`${data.error ?? "Slack API error"}${data.needed ? ` (precisa do escopo: ${data.needed})` : ""}`);
  return data.message;
}

export async function uploadFile(
  channelId: string,
  filename: string,
  content: Uint8Array,
  mimeType: string
) {
  if (!SLACK_TOKEN) throw new Error("SLACK_TOKEN not set");

  // Step 1: get upload URL
  const urlRes = await fetch("https://slack.com/api/files.getUploadURLExternal", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SLACK_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ filename, length: content.byteLength }),
  });
  const urlData = await urlRes.json();
  if (!urlData.ok) throw new Error(`${urlData.error}${urlData.needed ? ` (precisa do escopo: ${urlData.needed})` : ""}`);

  const { upload_url, file_id } = urlData as { upload_url: string; file_id: string };

  // Step 2: upload content
  await fetch(upload_url, {
    method: "POST",
    headers: { "Content-Type": mimeType },
    body: content as unknown as BodyInit,
  });

  // Step 3: complete upload
  const completeRes = await fetch("https://slack.com/api/files.completeUploadExternal", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SLACK_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      files: [{ id: file_id, title: filename }],
      channel_id: channelId,
    }),
  });
  const completeData = await completeRes.json();
  if (!completeData.ok) throw new Error(`${completeData.error}${completeData.needed ? ` (precisa do escopo: ${completeData.needed})` : ""}`);
  return completeData;
}

export type SearchResult = {
  ts: string;
  text: string;
  user: string | null;
  channelId: string;
  channelName: string;
  date: string;
  permalink: string;
};

export async function getMySlackUserId(): Promise<string | null> {
  try {
    const data = await slackFetch("auth.test");
    return (data.user_id as string) ?? null;
  } catch {
    return null;
  }
}

export async function searchMessages(query: string, count = 20): Promise<SearchResult[]> {
  const data = await slackFetch("search.messages", {
    query,
    count: String(count),
    sort: "timestamp",
    sort_dir: "desc",
  });
  const matches = data.messages?.matches ?? [];
  return (matches as Array<{
    ts: string;
    text: string;
    user?: string;
    channel: { id: string; name: string };
    permalink: string;
  }>).map((m) => ({
    ts: m.ts,
    text: m.text,
    user: m.user ?? null,
    channelId: m.channel.id,
    channelName: m.channel.name,
    date: new Date(parseFloat(m.ts) * 1000).toISOString(),
    permalink: m.permalink,
  }));
}
