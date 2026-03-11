import { google } from "googleapis";

function getOAuth2Client(accessToken: string) {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  auth.setCredentials({ access_token: accessToken });
  return auth;
}

export async function getCalendarEvents(accessToken: string) {
  const auth = getOAuth2Client(accessToken);
  const calendar = google.calendar({ version: "v3", auth });

  const now = new Date();
  const endOfWeek = new Date();
  endOfWeek.setDate(now.getDate() + 7);

  const res = await calendar.events.list({
    calendarId: "primary",
    timeMin: now.toISOString(),
    timeMax: endOfWeek.toISOString(),
    singleEvents: true,
    orderBy: "startTime",
    maxResults: 20,
  });

  return (res.data.items ?? []).map((e) => ({
    id: e.id,
    title: e.summary ?? "(sem título)",
    start: e.start?.dateTime ?? e.start?.date ?? null,
    end: e.end?.dateTime ?? e.end?.date ?? null,
    location: e.location ?? null,
    htmlLink: e.htmlLink ?? null,
    allDay: !e.start?.dateTime,
  }));
}

export async function getGmailMessages(accessToken: string) {
  const auth = getOAuth2Client(accessToken);
  const gmail = google.gmail({ version: "v1", auth });

  const list = await gmail.users.messages.list({
    userId: "me",
    maxResults: 20,
    q: "is:unread",
  });

  const messages = list.data.messages ?? [];

  const details = await Promise.all(
    messages.slice(0, 15).map(async (m) => {
      const msg = await gmail.users.messages.get({
        userId: "me",
        id: m.id!,
        format: "metadata",
        metadataHeaders: ["Subject", "From", "Date"],
      });
      const headers = msg.data.payload?.headers ?? [];
      const get = (name: string) =>
        headers.find((h) => h.name === name)?.value ?? "";
      return {
        id: m.id,
        subject: get("Subject") || "(sem assunto)",
        from: get("From"),
        date: get("Date"),
        snippet: msg.data.snippet ?? "",
      };
    })
  );

  return details;
}
