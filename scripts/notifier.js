// scripts/notifier.js — mKHub Windows Notifier
// Roda em background e envia toast notifications do Windows para
// menções no Slack, Linear e emails do Ian/Gabs.
//
// Uso: npm run notify

require("dotenv").config({ path: require("path").resolve(__dirname, "../.env.local") });

const notifier = require("node-notifier");
const path = require("path");

const SLACK_TOKEN = process.env.SLACK_TOKEN;
const LINEAR_API_KEY = process.env.LINEAR_API_KEY;
const NOTIFIER_SECRET = process.env.NOTIFIER_SECRET;
const SLACK_MY_EMAIL = process.env.SLACK_MY_EMAIL; // email usado no Slack para descobrir o member ID

const POLL_MS = 60 * 1000; // 60 segundos
const ICON = path.resolve(__dirname, "../public/favicon.ico");

// Guarda IDs já notificados pra não repetir
const seen = new Set();
let slackMyId = null;

// ─── Helpers ────────────────────────────────────────────────────────────────

function toast(title, message) {
  console.log(`[${new Date().toLocaleTimeString()}] 🔔 ${title} — ${message}`);
  notifier.notify({
    title,
    message: message.substring(0, 150),
    icon: ICON,
    sound: true,
    appID: "mKHub Notifier",
  });
}

async function slackFetch(endpoint, params = {}) {
  const url = new URL(`https://slack.com/api/${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${SLACK_TOKEN}` },
  });
  return res.json();
}

// ─── Slack Member ID (descobre uma vez no startup via auth.test) ────────────

async function resolveSlackId() {
  if (slackMyId) return slackMyId;
  if (!SLACK_TOKEN) return null;
  try {
    const data = await slackFetch("auth.test");
    if (data.ok) {
      slackMyId = data.user_id;
      console.log(`[Slack] Meu ID: ${slackMyId} (${data.user})`);
    } else {
      console.error("[Slack] auth.test falhou:", data.error);
    }
  } catch (e) {
    console.error("[Slack] Erro ao resolver ID:", e.message);
  }
  return slackMyId;
}

// ─── Slack — detecta menções ─────────────────────────────────────────────────

async function checkSlack() {
  if (!SLACK_TOKEN) return;

  const myId = await resolveSlackId();
  if (!myId) {
    console.warn("[Slack] SLACK_MY_EMAIL não configurado no .env.local");
    return;
  }

  try {
    const since = String(Math.floor((Date.now() - POLL_MS * 2) / 1000));
    const channelsData = await slackFetch("conversations.list", {
      limit: "30",
      types: "public_channel,private_channel",
    });

    const channels = (channelsData.channels || []).filter((c) => c.is_member);

    for (const channel of channels.slice(0, 15)) {
      const hist = await slackFetch("conversations.history", {
        channel: channel.id,
        oldest: since,
        limit: "20",
      });

      for (const msg of hist.messages || []) {
        const key = `slack-${msg.ts}`;
        if (!msg.text?.includes(`<@${myId}>`)) continue;
        if (seen.has(key)) continue;
        seen.add(key);

        // Pega nome do remetente
        let senderName = "Alguém";
        if (msg.user) {
          const userData = await slackFetch("users.info", { user: msg.user });
          senderName = userData.user?.real_name || userData.user?.name || "Alguém";
        }

        const text = msg.text.replace(/<[^>]+>/g, "").trim();
        toast(`💬 Menção no Slack — #${channel.name}`, `${senderName}: ${text}`);
      }
    }
  } catch (e) {
    console.error("[Slack]", e.message);
  }
}

// ─── Linear — detecta notificações não lidas ────────────────────────────────

async function checkLinear() {
  if (!LINEAR_API_KEY) return;

  try {
    const res = await fetch("https://api.linear.app/graphql", {
      method: "POST",
      headers: {
        Authorization: LINEAR_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `{
          notifications(filter: { readAt: { null: true } }, first: 15, orderBy: createdAt) {
            nodes {
              id
              type
              createdAt
              ... on IssueNotification {
                issue { title identifier }
                actor { name }
              }
              ... on ProjectNotification {
                project { name }
                actor { name }
              }
              ... on OauthClientApprovalNotification {
                actor { name }
              }
            }
          }
        }`,
      }),
    });

    const data = await res.json();
    const notifications = data.data?.notifications?.nodes || [];

    for (const n of notifications) {
      const key = `linear-${n.id}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const actor = n.actor?.name || "Alguém";
      const ref = n.issue
        ? `${n.issue.identifier}: ${n.issue.title}`
        : n.project?.name || "";

      const typeLabel = {
        issueAssigned: "te atribuiu uma issue",
        issueCreated: "criou uma issue",
        issueMention: "te mencionou",
        issueComment: "comentou",
        issueCommentMention: "te mencionou num comentário",
        issueStatusChanged: "mudou status",
      }[n.type] || n.type;

      toast(`📋 Linear — ${actor} ${typeLabel}`, ref);
    }
  } catch (e) {
    console.error("[Linear]", e.message);
  }
}

// ─── Gmail — chama a API local do mKHub ─────────────────────────────────────

async function checkGmail() {
  if (!NOTIFIER_SECRET) return;

  try {
    const res = await fetch(
      `http://localhost:3000/api/notifier?secret=${NOTIFIER_SECRET}`
    );
    if (!res.ok) return;

    const data = await res.json();
    for (const email of data.emails || []) {
      const key = `gmail-${email.id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      toast(`📧 Email de ${email.from}`, email.subject);
    }
  } catch {
    // Silencioso — servidor pode estar offline ou usuário não logado
  }
}

// ─── Loop principal ──────────────────────────────────────────────────────────

async function poll() {
  process.stdout.write(`[${new Date().toLocaleTimeString()}] Verificando... `);
  await Promise.allSettled([checkSlack(), checkLinear(), checkGmail()]);
  console.log("✓");
}

console.log("🔔 mKHub Notifier iniciado");
console.log(`   Slack:  ${SLACK_TOKEN ? "✓" : "✗ SLACK_TOKEN não configurado"}`);
console.log(`   Linear: ${LINEAR_API_KEY ? "✓" : "✗ LINEAR_API_KEY não configurado"}`);
console.log(`   Gmail:  ${NOTIFIER_SECRET ? "✓ (requer login no mKHub)" : "✗ NOTIFIER_SECRET não configurado"}`);
console.log(`   Polling a cada ${POLL_MS / 1000}s\n`);

poll();
setInterval(poll, POLL_MS);
