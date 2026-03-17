import { google, gmail_v1 } from "googleapis";

function getOAuth2Client(accessToken: string) {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  auth.setCredentials({ access_token: accessToken });
  return auth;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function decodeBase64(str: string): string {
  try {
    return Buffer.from(str.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8");
  } catch {
    return "";
  }
}

function extractEmailBody(
  payload: gmail_v1.Schema$MessagePart | null | undefined
): { text: string; html: string | null } {
  if (!payload) return { text: "", html: null };

  if (payload.body?.data) {
    const content = decodeBase64(payload.body.data);
    if (payload.mimeType === "text/html") return { text: "", html: content };
    return { text: content, html: null };
  }

  if (payload.parts) {
    let text = "";
    let html: string | null = null;
    for (const part of payload.parts) {
      const r = extractEmailBody(part);
      if (!text && r.text) text = r.text;
      if (!html && r.html) html = r.html;
    }
    return { text, html };
  }

  return { text: "", html: null };
}

// ─── Calendar ────────────────────────────────────────────────────────────────

export async function getCalendarEvents(accessToken: string) {
  const auth = getOAuth2Client(accessToken);
  const calendar = google.calendar({ version: "v3", auth });

  const now = new Date();
  // Start from Monday of the current week to include past events
  const startOfWeek = new Date(now);
  const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon, ...
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  startOfWeek.setDate(now.getDate() + diffToMonday);
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(now);
  endOfWeek.setDate(now.getDate() + 7);

  const res = await calendar.events.list({
    calendarId: "primary",
    timeMin: startOfWeek.toISOString(),
    timeMax: endOfWeek.toISOString(),
    singleEvents: true,
    orderBy: "startTime",
    maxResults: 50,
  });

  const MEETING_URL_RE = /https?:\/\/(meet\.google\.com|zoom\.us|teams\.microsoft\.com|us\d+web\.zoom\.us|webex\.com|whereby\.com|meet\.jit\.si)\S*/i;

  return (res.data.items ?? []).map((e) => {
    const videoEntry = e.conferenceData?.entryPoints?.find(
      (ep) => ep.entryPointType === "video"
    );
    const locationUrl = e.location ? MEETING_URL_RE.exec(e.location)?.[0] ?? null : null;
    const descUrl = e.description ? MEETING_URL_RE.exec(e.description)?.[0] ?? null : null;
    const meetLink = videoEntry?.uri ?? locationUrl ?? descUrl ?? null;

    const selfAttendee = (e.attendees ?? []).find((a) => a.self);
    const selfStatus = (selfAttendee?.responseStatus ?? null) as
      | "accepted" | "declined" | "tentative" | "needsAction" | null;

    return {
      id: e.id,
      title: e.summary ?? "(sem título)",
      start: e.start?.dateTime ?? e.start?.date ?? null,
      end: e.end?.dateTime ?? e.end?.date ?? null,
      location: e.location ?? null,
      description: e.description ?? null,
      htmlLink: e.htmlLink ?? null,
      meetLink,
      allDay: !e.start?.dateTime,
      attendeeCount: e.attendees?.length ?? 0,
      selfStatus,
    };
  });
}

export async function patchCalendarRsvp(
  accessToken: string,
  eventId: string,
  status: "accepted" | "declined" | "tentative"
) {
  const auth = getOAuth2Client(accessToken);
  const calendar = google.calendar({ version: "v3", auth });
  const event = await calendar.events.get({ calendarId: "primary", eventId });
  const attendees = (event.data.attendees ?? []).map((a) => ({
    ...a,
    responseStatus: a.self ? status : a.responseStatus,
  }));
  await calendar.events.patch({
    calendarId: "primary",
    eventId,
    requestBody: { attendees },
    sendUpdates: "none",
  });
}

// ─── Gmail — list ─────────────────────────────────────────────────────────────

async function _listMessages(accessToken: string, q: string, max = 15) {
  const auth = getOAuth2Client(accessToken);
  const gmail = google.gmail({ version: "v1", auth });

  const list = await gmail.users.messages.list({ userId: "me", maxResults: max, q });
  const messages = list.data.messages ?? [];

  const details = await Promise.all(
    messages.slice(0, max).map(async (m) => {
      const msg = await gmail.users.messages.get({
        userId: "me",
        id: m.id!,
        format: "metadata",
        metadataHeaders: ["Subject", "From", "To", "Date"],
      });
      const headers = msg.data.payload?.headers ?? [];
      const get = (name: string) =>
        headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value ?? "";
      return {
        id: m.id ?? "",
        threadId: msg.data.threadId ?? "",
        subject: get("Subject") || "(sem assunto)",
        from: get("From"),
        to: get("To"),
        date: get("Date"),
        snippet: msg.data.snippet ?? "",
        isUnread: (msg.data.labelIds ?? []).includes("UNREAD"),
      };
    })
  );

  return details;
}

export async function getGmailMessages(accessToken: string) {
  return _listMessages(accessToken, "in:inbox", 20);
}

export async function getGmailByCategory(
  accessToken: string,
  category: "primary" | "updates"
) {
  return _listMessages(accessToken, `in:inbox category:${category}`, 20);
}

// ─── Gmail — full detail ──────────────────────────────────────────────────────

export async function getGmailDetail(accessToken: string, id: string) {
  const auth = getOAuth2Client(accessToken);
  const gmail = google.gmail({ version: "v1", auth });

  const msg = await gmail.users.messages.get({ userId: "me", id, format: "full" });

  const headers = msg.data.payload?.headers ?? [];
  const get = (name: string) =>
    headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value ?? "";

  const { text, html } = extractEmailBody(msg.data.payload);

  return {
    id,
    threadId: msg.data.threadId ?? "",
    subject: get("Subject") || "(sem assunto)",
    from: get("From"),
    to: get("To"),
    date: get("Date"),
    messageId: get("Message-ID"),
    body: text,
    bodyHtml: html,
    isUnread: (msg.data.labelIds ?? []).includes("UNREAD"),
  };
}

// ─── Gmail — mark as read ─────────────────────────────────────────────────────

export async function markGmailAsRead(accessToken: string, id: string) {
  const auth = getOAuth2Client(accessToken);
  const gmail = google.gmail({ version: "v1", auth });
  await gmail.users.messages.modify({
    userId: "me",
    id,
    requestBody: { removeLabelIds: ["UNREAD"] },
  });
}

// ─── Gmail — reply ────────────────────────────────────────────────────────────

export async function sendGmailReply(
  accessToken: string,
  opts: { to: string; subject: string; body: string; threadId: string; inReplyTo: string }
) {
  const auth = getOAuth2Client(accessToken);
  const gmail = google.gmail({ version: "v1", auth });

  const profile = await gmail.users.getProfile({ userId: "me" });
  const from = profile.data.emailAddress ?? "";

  const subject = opts.subject.startsWith("Re:") ? opts.subject : `Re: ${opts.subject}`;

  const raw = [
    `From: ${from}`,
    `To: ${opts.to}`,
    `Subject: ${subject}`,
    `In-Reply-To: ${opts.inReplyTo}`,
    `References: ${opts.inReplyTo}`,
    "Content-Type: text/plain; charset=utf-8",
    "MIME-Version: 1.0",
    "",
    opts.body,
  ].join("\r\n");

  const encoded = Buffer.from(raw).toString("base64url");

  await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw: encoded, threadId: opts.threadId },
  });
}
