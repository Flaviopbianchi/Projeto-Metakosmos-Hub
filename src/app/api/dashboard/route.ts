import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCalendarEvents, getGmailMessages } from "@/lib/google";
import { getMyIssues } from "@/lib/linear";
import {
  getChannelMessages,
  searchMessages,
  getUsers,
  getMySlackUserId,
} from "@/lib/slack";

// Slack channel IDs (hardcoded — stable, no name-search dependency)
const WOOW_CHANNEL_ID = "C088URAHZ55";
const GOLDEN_PIZZA_CHANNEL_ID = "C09DQC7AJ91";

export async function GET() {
  const session = await getServerSession(authOptions);
  const errors: Record<string, string> = {};

  function catchErr(key: string) {
    return (e: unknown) => {
      errors[key] = e instanceof Error ? e.message : String(e);
      console.error(`[dashboard] ${key}:`, errors[key]);
      return [] as never[];
    };
  }

  // Fetch Slack users for name resolution + current user ID (parallel)
  const [users, slackUserId] = await Promise.all([
    getUsers().catch(catchErr("slack_users")),
    getMySlackUserId().catch((e: unknown) => {
      errors["slack_user_id"] = e instanceof Error ? e.message : String(e);
      return null;
    }),
  ]);

  const userMap = new Map(
    users.map((u) => [u.id, u.displayName || u.realName || u.name])
  );

  function resolveText(text: string): string {
    return text.replace(/<@([A-Z0-9]+)>/g, (_, id) => `@${userMap.get(id) ?? id}`);
  }

  function extractNominees(text: string): string[] {
    return [...text.matchAll(/<@([A-Z0-9]+)>/g)].map(
      (m) => userMap.get(m[1]) ?? m[1]
    );
  }

  const [
    calendarEvents,
    gmailMessages,
    linearIssues,
    goldenPizzaRaw,
    woowRaw,
    mentionsRaw,
  ] = await Promise.all([
    session?.accessToken
      ? getCalendarEvents(session.accessToken).catch(catchErr("google_calendar"))
      : Promise.resolve([]),
    session?.accessToken
      ? getGmailMessages(session.accessToken).catch(catchErr("google_gmail"))
      : Promise.resolve([]),
    getMyIssues().catch(catchErr("linear")),
    // Use hardcoded channel ID — fetches last 10 messages (Golden Pizza)
    getChannelMessages(GOLDEN_PIZZA_CHANNEL_ID, 10).catch(catchErr("slack_golden_pizza")),
    // Use hardcoded channel ID — fetches last 60 messages to find recent nominations (WooW)
    getChannelMessages(WOOW_CHANNEL_ID, 60).catch(catchErr("slack_woow")),
    slackUserId
      ? searchMessages(`<@${slackUserId}>`, 10).catch(catchErr("slack_mentions"))
      : Promise.resolve([]),
  ]);

  const goldenPizzaMessages = goldenPizzaRaw.map((m) => ({
    ...m,
    userName: m.user ? (userMap.get(m.user) ?? m.user) : "Bot",
    text: resolveText(m.text),
  }));

  // WooW: any person, latest nominations (no month restriction)
  const woowMessages = woowRaw
    .map((m) => ({
      ...m,
      userName: m.user ? (userMap.get(m.user) ?? m.user) : "Bot",
      text: resolveText(m.text),
      nominees: extractNominees(m.text),
    }))
    .filter((m) => m.nominees.length > 0)
    .slice(0, 15); // latest 15 nominations

  const mentions = mentionsRaw.map((m) => ({
    ...m,
    text: resolveText(m.text),
  }));

  return NextResponse.json({
    calendarEvents,
    gmailMessages,
    linearIssues,
    goldenPizzaMessages,
    woowMessages,
    mentions,
    authenticated: !!session?.accessToken,
    meta: {
      goldenPizzaChannelId: GOLDEN_PIZZA_CHANNEL_ID,
      woowChannelId: WOOW_CHANNEL_ID,
      slackUserId: slackUserId ?? null,
    },
    errors: Object.keys(errors).length > 0 ? errors : undefined,
  });
}
