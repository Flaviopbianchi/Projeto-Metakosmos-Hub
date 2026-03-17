"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { Header } from "@/components/layout/Header";
import {
  Hash, Lock, Users, MessageSquare, AlertCircle, Clock,
  User, Bot, MessageCircle, UsersRound, Search, X,
  Send, FileText, ChevronRight, ChevronDown,
  Star, Bell, BellDot, Smile,
  Bold, Italic, Strikethrough, Link2, ListOrdered, List,
  Code, Code2, Type, AtSign, Video, Mic, Plus,
} from "lucide-react";
import { clsx } from "clsx";
import { EmojiPicker } from "@/components/ui/EmojiPicker";
import emojiData from "@emoji-mart/data";

// Build shortcode → native emoji lookup from emoji-mart data
const emojiMap: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  const d = emojiData as { emojis: Record<string, { id: string; skins: { native: string }[] }> };
  for (const emoji of Object.values(d.emojis)) {
    if (emoji.skins?.[0]?.native) map[emoji.id] = emoji.skins[0].native;
  }
  return map;
})();

// ─── Types ────────────────────────────────────────────────────────────────────

type Channel = {
  id: string; name: string; isPrivate: boolean;
  isIm: boolean; isMpim: boolean; isGroup: boolean; members: number;
  latestTs?: string;
};

type SlackUser = {
  id: string; name: string; realName: string;
  displayName: string; avatarUrl: string | null; isBot: boolean;
};

type Message = {
  ts: string; text: string; user: string | null; isBot: boolean; date: string;
};

type SearchResult = {
  ts: string; text: string; user: string | null;
  channelId: string; channelName: string; date: string; permalink: string;
};

type Notif = {
  channelId: string; channelName: string;
  text: string; user: string | null; ts: string; date: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "agora";
  if (diffMin < 60) return `${diffMin}m`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h`;
  return date.toLocaleDateString("pt-BR", { day: "numeric", month: "short" });
}

function renderText(text: string) {
  return text.replace(/<[^>]+>/g, "").trim() || "(mensagem vazia)";
}

// Inline Slack mrkdwn parser
function processInline(str: string, userMap: Map<string, SlackUser>): React.ReactNode[] {
  if (!str) return [];
  const result: React.ReactNode[] = [];
  let remaining = str;
  let keyIdx = 0;

  type Pattern = {
    re: RegExp;
    render: (m: RegExpMatchArray, k: number) => React.ReactNode;
  };

  const patterns: Pattern[] = [
    // inline code
    { re: /`([^`]+)`/, render: (m, k) => <code key={k} className="bg-white/10 text-emerald-300 font-mono text-[0.8em] px-1.5 py-0.5 rounded">{m[1]}</code> },
    // bold
    { re: /\*([^*\n]+)\*/, render: (m, k) => <strong key={k} className="text-white/90 font-semibold">{m[1]}</strong> },
    // italic
    { re: /_([^_\n]+)_/, render: (m, k) => <em key={k} className="italic text-white/75">{m[1]}</em> },
    // strikethrough
    { re: /~([^~\n]+)~/, render: (m, k) => <del key={k} className="text-white/40 line-through">{m[1]}</del> },
    // mention
    {
      re: /<@([A-Z0-9]+)(?:\|([^>]*))?>/,
      render: (m, k) => {
        const user = userMap.get(m[1]);
        const name = user?.realName ?? m[2] ?? m[1];
        return <span key={k} className="inline-flex items-center bg-violet-500/15 text-violet-300 rounded px-1.5 font-medium text-[0.85em]">@{name}</span>;
      },
    },
    // link with label
    { re: /<(https?:\/\/[^|>]+)\|([^>]+)>/, render: (m, k) => <a key={k} href={m[1]} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline hover:text-blue-300 underline-offset-2">{m[2]}</a> },
    // link without label
    { re: /<(https?:\/\/[^>]+)>/, render: (m, k) => <a key={k} href={m[1]} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline hover:text-blue-300 underline-offset-2">{m[1]}</a> },
    // emoji shortcode
    { re: /:([a-z0-9_+-]+):/, render: (m, k) => <span key={k}>{emojiMap[m[1]] ?? m[0]}</span> },
  ];

  while (remaining.length > 0) {
    let earliest: { index: number; match: RegExpMatchArray; render: Pattern["render"] } | null = null;
    for (const p of patterns) {
      const m = remaining.match(p.re);
      if (m && m.index !== undefined) {
        if (!earliest || m.index < earliest.index) {
          earliest = { index: m.index, match: m, render: p.render };
        }
      }
    }
    if (!earliest) {
      result.push(<span key={keyIdx++}>{remaining}</span>);
      break;
    }
    if (earliest.index > 0) {
      result.push(<span key={keyIdx++}>{remaining.slice(0, earliest.index)}</span>);
    }
    result.push(earliest.render(earliest.match, keyIdx++));
    remaining = remaining.slice(earliest.index + earliest.match[0].length);
  }
  return result;
}

// Full Slack mrkdwn renderer (handles block + inline)
function renderMessageText(text: string, userMap: Map<string, SlackUser>): React.ReactNode {
  const decoded = text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");

  const nodes: React.ReactNode[] = [];
  const lines = decoded.split("\n");
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code block
    if (line.trim().startsWith("```")) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++;
      nodes.push(
        <pre key={key++} className="bg-[#0d0d1a] border border-white/10 rounded-lg px-3 py-2 my-1.5 font-mono text-xs text-emerald-300 overflow-x-auto whitespace-pre leading-relaxed">
          {codeLines.join("\n")}
        </pre>
      );
      continue;
    }

    // Blockquote
    if (line.startsWith("> ") || line === ">") {
      const content = line.slice(2);
      nodes.push(
        <blockquote key={key++} className="border-l-2 border-violet-500/50 pl-3 my-0.5 text-white/50 italic">
          {processInline(content, userMap)}
        </blockquote>
      );
      i++;
      continue;
    }

    // Normal line
    const inlineNodes = processInline(line, userMap);
    if (inlineNodes.length > 0) {
      nodes.push(<span key={key++}>{inlineNodes}</span>);
    } else if (i < lines.length - 1) {
      nodes.push(<span key={key++}>&nbsp;</span>);
    }

    if (i < lines.length - 1) {
      nodes.push(<br key={`br-${key++}`} />);
    }
    i++;
  }

  return <>{nodes}</>;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ─── Small components ─────────────────────────────────────────────────────────

function ChannelIcon({ ch, size = 12 }: { ch: Channel; size?: number }) {
  if (ch.isIm) return <MessageCircle size={size} />;
  if (ch.isMpim) return <UsersRound size={size} />;
  if (ch.isPrivate || ch.isGroup) return <Lock size={size} />;
  return <Hash size={size} />;
}

function Avatar({ user, size = 24 }: { user: SlackUser; size?: number }) {
  if (user.avatarUrl) {
    return (
      <Image src={user.avatarUrl} alt={user.realName} width={size} height={size}
        className="rounded-full object-cover shrink-0" />
    );
  }
  return (
    <div className="rounded-full bg-violet-600/30 flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}>
      <span className="text-violet-300 font-bold" style={{ fontSize: size * 0.45 }}>
        {user.isBot ? <Bot size={size * 0.55} /> : (user.realName?.[0]?.toUpperCase() ?? "?")}
      </span>
    </div>
  );
}

function UnreadBadge({ count }: { count: number }) {
  if (!count) return null;
  return (
    <span className="ml-auto shrink-0 min-w-[18px] h-[18px] px-1 bg-violet-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
      {count > 99 ? "99+" : count}
    </span>
  );
}

function SectionBtn({ label, count, collapsed, onToggle }: {
  label: string; count: number; collapsed: boolean; onToggle: () => void;
}) {
  return (
    <button onClick={onToggle} className="flex items-center gap-1.5 w-full px-4 pt-3 pb-1 group">
      <span className="text-white/25 group-hover:text-white/50 transition-colors">
        {collapsed ? <ChevronRight size={10} /> : <ChevronDown size={10} />}
      </span>
      <p className="text-white/30 group-hover:text-white/50 text-xs uppercase tracking-wider transition-colors">
        {label}
      </p>
      <span className="text-white/20 text-xs ml-1">{count}</span>
    </button>
  );
}

function ChannelRow({ ch, selected, isFav, unread, onSelect, onToggleFav }: {
  ch: Channel; selected: Channel | null; isFav: boolean;
  unread: number; onSelect: (c: Channel) => void; onToggleFav: (id: string) => void;
}) {
  const isActive = selected?.id === ch.id;
  const hasUnread = unread > 0 && !isActive;
  return (
    <div className={clsx(
      "group flex items-center gap-1 px-2 py-0.5 mx-1 rounded-lg cursor-pointer transition-colors text-sm",
      isActive ? "bg-violet-600/20" : "hover:bg-white/5"
    )}>
      <button onClick={() => onSelect(ch)}
        className={clsx(
          "flex items-center gap-2 flex-1 min-w-0 py-1",
          isActive ? "text-violet-400" : hasUnread ? "text-white" : "text-white/50 hover:text-white"
        )}>
        {/* Unread dot */}
        <span className="shrink-0 relative">
          <ChannelIcon ch={ch} />
          {hasUnread && (
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-violet-400 rounded-full" />
          )}
        </span>
        <span className={clsx("truncate text-sm", hasUnread && "font-semibold")}>
          {ch.name}
        </span>
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onToggleFav(ch.id); }}
        className={clsx(
          "shrink-0 transition-colors p-0.5",
          isFav ? "text-amber-400 hover:text-amber-300" : "text-transparent group-hover:text-white/25 hover:!text-amber-400"
        )}
        title={isFav ? "Remover dos favoritos" : "Adicionar aos favoritos"}>
        <Star size={10} fill={isFav ? "currentColor" : "none"} />
      </button>
      <UnreadBadge count={hasUnread ? unread : 0} />
    </div>
  );
}

function UserRow({ user }: { user: SlackUser }) {
  return (
    <div className="flex items-center gap-2.5 px-4 py-1.5">
      <Avatar user={user} size={24} />
      <div className="min-w-0">
        <p className="text-white/70 text-xs font-medium truncate">{user.realName}</p>
        {user.displayName && user.displayName !== user.realName && (
          <p className="text-white/30 text-xs truncate">@{user.displayName}</p>
        )}
      </div>
    </div>
  );
}

function MessageRow({ msg, userMap }: { msg: Message; userMap: Map<string, SlackUser> }) {
  const resolvedUser = msg.user ? userMap.get(msg.user) : null;
  const displayName = msg.isBot ? "Bot" : (resolvedUser?.realName ?? msg.user ?? "Usuário");
  return (
    <div className="flex items-start gap-3 px-4 py-2 hover:bg-white/[0.02] rounded-lg group">
      <div className="mt-0.5 shrink-0">
        {resolvedUser ? <Avatar user={resolvedUser} size={28} /> : (
          <div className="w-7 h-7 rounded-full bg-violet-600/30 flex items-center justify-center">
            <span className="text-violet-300 text-xs font-bold">
              {msg.isBot ? "B" : (msg.user?.[0]?.toUpperCase() ?? "?")}
            </span>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-white/80 text-xs font-semibold">{displayName}</span>
          <span className="flex items-center gap-1 text-white/25 text-xs">
            <Clock size={9} />
            {formatTime(msg.date)}
          </span>
        </div>
        <div className="text-white/65 text-sm break-words leading-relaxed">
          {renderMessageText(msg.text, userMap)}
        </div>
      </div>
    </div>
  );
}

// ─── Notification panel ───────────────────────────────────────────────────────

function MentionDropdown({ users, highlight, onSelect }: {
  users: SlackUser[];
  highlight: number;
  onSelect: (user: SlackUser) => void;
}) {
  if (!users.length) return null;
  return (
    <div className="absolute bottom-full mb-1 left-0 right-0 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden max-h-48 overflow-y-auto">
      <p className="text-white/30 text-[10px] uppercase tracking-wider px-3 pt-2 pb-1">Mencionar usuário</p>
      {users.map((u, i) => (
        <button key={u.id} onMouseDown={(e) => { e.preventDefault(); onSelect(u); }}
          className={clsx(
            "flex items-center gap-2.5 w-full px-3 py-1.5 text-left transition-colors",
            i === highlight ? "bg-violet-600/25" : "hover:bg-white/5"
          )}>
          <Avatar user={u} size={22} />
          <div className="min-w-0">
            <p className="text-white/80 text-xs font-medium truncate">{u.realName}</p>
            {u.displayName && u.displayName !== u.realName && (
              <p className="text-white/30 text-[10px] truncate">@{u.displayName}</p>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}

function NotifPanel({ notifs, userMap, onGoTo, onDismiss, onDismissAll, onClose }: {
  notifs: Notif[]; userMap: Map<string, SlackUser>;
  onGoTo: (channelId: string) => void;
  onDismiss: (ts: string) => void;
  onDismissAll: () => void;
  onClose: () => void;
}) {
  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <p className="text-white text-sm font-semibold">Notificações</p>
        <div className="flex items-center gap-3">
          {notifs.length > 0 && (
            <button onClick={onDismissAll}
              className="text-white/30 hover:text-white/70 text-xs transition-colors">
              Limpar tudo
            </button>
          )}
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors">
            <X size={14} />
          </button>
        </div>
      </div>

      {notifs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 gap-2">
          <Bell size={22} className="text-white/20" />
          <p className="text-white/30 text-sm">Nenhuma notificação</p>
        </div>
      ) : (
        <div className="max-h-96 overflow-y-auto divide-y divide-white/5">
          {notifs.map((n) => {
            const user = n.user ? userMap.get(n.user) : null;
            return (
              <div key={n.ts}
                className="flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer"
                onClick={() => { onGoTo(n.channelId); onDismiss(n.ts); }}>
                <div className="shrink-0 mt-0.5">
                  {user ? <Avatar user={user} size={28} /> : (
                    <div className="w-7 h-7 rounded-full bg-violet-600/30 flex items-center justify-center">
                      <span className="text-violet-300 text-xs font-bold">
                        {n.user?.[0]?.toUpperCase() ?? "?"}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="text-white/80 text-xs font-semibold">
                      {user?.realName ?? n.user ?? "Usuário"}
                    </span>
                    <span className="text-white/30 text-xs flex items-center gap-1">
                      <Hash size={9} />{n.channelName}
                    </span>
                    <span className="text-white/20 text-xs ml-auto">{formatTime(n.date)}</span>
                  </div>
                  <p className="text-white/50 text-xs truncate">{renderText(n.text)}</p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); onDismiss(n.ts); }}
                  className="text-white/20 hover:text-white/50 shrink-0 mt-0.5 ml-1">
                  <X size={12} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Toolbar button ───────────────────────────────────────────────────────────

function ToolbarBtn({ icon, title, onClick, active }: {
  icon: React.ReactNode; title: string; onClick: () => void; active?: boolean;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      className={clsx(
        "w-7 h-7 flex items-center justify-center rounded transition-colors text-sm",
        active ? "bg-violet-600/30 text-violet-300" : "text-white/40 hover:text-white hover:bg-white/8"
      )}>
      {icon}
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const LS_FAVS = "slack_favorites";
const LS_SEEN = "slack_last_seen_ts";
const POLL_MS = 30_000;

export default function SlackPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [users, setUsers] = useState<SlackUser[]>([]);
  const [selected, setSelectedRaw] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingChannels, setLoadingChannels] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarTab, setSidebarTab] = useState<"channels" | "users">("channels");

  // Search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 500);

  // Composer
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [formattingBarOpen, setFormattingBarOpen] = useState(false);
  // @mention autocomplete
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionStart, setMentionStart] = useState(0);
  const [mentionIndex, setMentionIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Favorites, collapse & channel filter
  const [favorites, setFavorites] = useState<string[]>([]);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [channelFilter, setChannelFilter] = useState("");

  // Notifications
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [lastSeenTs, setLastSeenTs] = useState<Record<string, string>>({});
  const notifRef = useRef<HTMLDivElement>(null);

  // Stable refs for polling closure
  const lastSeenRef = useRef(lastSeenTs);
  const favoritesRef = useRef(favorites);
  const selectedRef = useRef(selected);
  const channelMapRef = useRef<Map<string, Channel>>(new Map());

  useEffect(() => { lastSeenRef.current = lastSeenTs; }, [lastSeenTs]);
  useEffect(() => { favoritesRef.current = favorites; }, [favorites]);
  useEffect(() => { selectedRef.current = selected; }, [selected]);

  // ── Load localStorage on mount
  useEffect(() => {
    try {
      const f = localStorage.getItem(LS_FAVS);
      const s = localStorage.getItem(LS_SEEN);
      if (f) setFavorites(JSON.parse(f));
      if (s) setLastSeenTs(JSON.parse(s));
    } catch {}
  }, []);

  // ── Close notif panel on outside click
  useEffect(() => {
    if (!notifOpen) return;
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node))
        setNotifOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [notifOpen]);

  // ── Derived maps
  const userMap = useMemo(() => {
    const map = new Map<string, SlackUser>();
    for (const u of users) map.set(u.id, u);
    return map;
  }, [users]);

  const channelMap = useMemo(() => {
    const map = new Map<string, Channel>();
    for (const c of channels) map.set(c.id, c);
    channelMapRef.current = map;
    return map;
  }, [channels]);

  // ── Load channels + users
  useEffect(() => {
    fetch("/api/slack/channels")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { setError(d.error); return; }
        setChannels(d.channels);
        const first = d.channels.find((c: Channel) => !c.isIm && !c.isMpim);
        if (first) setSelectedRaw(first);
      })
      .catch(() => setError("Falha ao conectar com o Slack"))
      .finally(() => setLoadingChannels(false));

    fetch("/api/slack/users")
      .then((r) => r.json())
      .then((d) => { if (!d.error) setUsers(d.users); })
      .catch(() => {})
      .finally(() => setLoadingUsers(false));
  }, []);

  // ── Mark channel as read
  const markRead = useCallback((channelId: string, latestTs: string) => {
    setLastSeenTs((prev) => {
      const next = { ...prev, [channelId]: latestTs };
      try { localStorage.setItem(LS_SEEN, JSON.stringify(next)); } catch {}
      return next;
    });
    setNotifs((prev) => prev.filter((n) => n.channelId !== channelId));
  }, []);

  // ── Select channel
  const setSelected = useCallback((ch: Channel | null) => {
    setSelectedRaw(ch);
    setSearchOpen(false);
    setSearchQuery("");
    // Immediately mark as read using latestTs from channel metadata
    if (ch?.latestTs) markRead(ch.id, ch.latestTs);
  }, [markRead]);

  // ── Load messages on channel change
  useEffect(() => {
    if (!selected || selected.isIm || selected.isMpim) return;
    setLoadingMessages(true);
    setMessages([]);
    fetch(`/api/slack/messages?channel=${selected.id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else {
          setMessages(d.messages);
          if (d.messages?.length) markRead(selected.id, d.messages[0].ts);
        }
      })
      .catch(() => setError("Falha ao carregar mensagens"))
      .finally(() => setLoadingMessages(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id]);

  // ── Poll favorites every 30s
  useEffect(() => {
    const poll = async () => {
      const favs = favoritesRef.current;
      if (!favs.length) return;
      for (const channelId of favs) {
        if (channelId === selectedRef.current?.id) continue;
        try {
          const res = await fetch(`/api/slack/messages?channel=${channelId}&limit=5`);
          const data = await res.json();
          if (data.error || !data.messages?.length) continue;

          const latestTs = data.messages[0].ts;
          const storedTs = lastSeenRef.current[channelId] ?? "0";
          if (latestTs <= storedTs) continue;

          const newMessages = (data.messages as Message[]).filter((m) => m.ts > storedTs);
          if (!newMessages.length) continue;

          const ch = channelMapRef.current.get(channelId);
          const channelName = ch?.name ?? channelId;

          setNotifs((prev) => {
            const existingTs = new Set(prev.map((n) => n.ts));
            const toAdd: Notif[] = newMessages
              .filter((m) => !existingTs.has(m.ts))
              .map((m) => ({ channelId, channelName, text: m.text, user: m.user, ts: m.ts, date: m.date }));
            return [...toAdd, ...prev].slice(0, 50);
          });

          if (typeof Notification !== "undefined" && Notification.permission === "granted") {
            const latest = newMessages[0];
            new Notification(`#${channelName}`, { body: renderText(latest.text), tag: channelId });
          }
        } catch {}
      }
    };
    const id = setInterval(poll, POLL_MS);
    return () => clearInterval(id);
  }, []);

  // ── Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Search
  useEffect(() => {
    if (!debouncedSearch.trim()) { setSearchResults([]); return; }
    setSearchLoading(true);
    fetch(`/api/slack/search?q=${encodeURIComponent(debouncedSearch)}`)
      .then((r) => r.json())
      .then((d) => { if (!d.error) setSearchResults(d.results ?? []); })
      .catch(() => {})
      .finally(() => setSearchLoading(false));
  }, [debouncedSearch]);

  // ── Favorites
  const toggleFavorite = useCallback((channelId: string) => {
    setFavorites((prev) => {
      const next = prev.includes(channelId) ? prev.filter(id => id !== channelId) : [...prev, channelId];
      try { localStorage.setItem(LS_FAVS, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const toggleCollapse = (key: string) =>
    setCollapsed((prev) => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });

  // ── Composer helpers
  const wrapSelection = useCallback((open: string, close: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = text.slice(start, end);
    const next = text.slice(0, start) + open + selected + close + text.slice(end);
    setText(next);
    requestAnimationFrame(() => {
      ta.focus();
      if (start === end) {
        ta.selectionStart = ta.selectionEnd = start + open.length;
      } else {
        ta.selectionStart = start + open.length;
        ta.selectionEnd = end + open.length;
      }
    });
  }, [text]);

  const prefixLines = useCallback((prefix: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const lines = text.split("\n");
    let charCount = 0;
    const result: string[] = [];
    for (const line of lines) {
      const lineEnd = charCount + line.length;
      if (lineEnd >= start && charCount <= end) {
        result.push(prefix + line);
      } else {
        result.push(line);
      }
      charCount += line.length + 1;
    }
    setText(result.join("\n"));
    requestAnimationFrame(() => ta.focus());
  }, [text]);

  const insertAtCursor = useCallback((str: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const pos = ta.selectionStart ?? text.length;
    const next = text.slice(0, pos) + str + text.slice(pos);
    setText(next);
    requestAnimationFrame(() => {
      ta.focus();
      ta.selectionStart = ta.selectionEnd = pos + str.length;
    });
  }, [text]);

  // Detect @mention at cursor
  const detectMention = (value: string, cursor: number) => {
    const before = value.slice(0, cursor);
    const m = before.match(/@(\w*)$/);
    if (m) return { query: m[1].toLowerCase(), atIndex: cursor - m[0].length };
    return null;
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setText(val);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";

    const cursor = e.target.selectionStart ?? val.length;
    const mention = detectMention(val, cursor);
    if (mention) {
      setMentionQuery(mention.query);
      setMentionStart(mention.atIndex);
      setMentionIndex(0);
    } else {
      setMentionQuery(null);
    }
  };

  const handleSend = useCallback(async () => {
    if (!selected || (!text.trim() && !file)) return;
    setSending(true); setSendError(null);
    try {
      if (file) {
        const form = new FormData();
        form.append("channelId", selected.id);
        form.append("file", file);
        if (text.trim()) {
          await fetch("/api/slack/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ channelId: selected.id, text: text.trim() }),
          });
        }
        const r = await fetch("/api/slack/upload", { method: "POST", body: form });
        const d = await r.json();
        if (d.error) throw new Error(d.error);
        setFile(null);
      } else {
        const r = await fetch("/api/slack/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ channelId: selected.id, text: text.trim() }),
        });
        const d = await r.json();
        if (d.error) throw new Error(d.error);
      }
      setText("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";
      const r = await fetch(`/api/slack/messages?channel=${selected.id}`);
      const d = await r.json();
      if (!d.error) { setMessages(d.messages); if (d.messages?.length) markRead(selected.id, d.messages[0].ts); }
    } catch (e: unknown) {
      setSendError(e instanceof Error ? e.message : "Erro ao enviar");
    } finally { setSending(false); }
  }, [selected, text, file, markRead]);

  // @mention results
  const mentionResults = useMemo(() => {
    if (mentionQuery === null) return [];
    const q = mentionQuery.toLowerCase();
    return users.filter(
      (u) =>
        !u.isBot &&
        (u.realName.toLowerCase().includes(q) || u.displayName.toLowerCase().includes(q) || u.name.toLowerCase().includes(q))
    ).slice(0, 8);
  }, [mentionQuery, users]);

  const selectMention = useCallback((user: SlackUser) => {
    const before = text.slice(0, mentionStart);
    const after = text.slice(mentionStart + (mentionQuery?.length ?? 0) + 1); // +1 for @
    const tag = `<@${user.id}> `;
    const next = before + tag + after;
    setText(next);
    setMentionQuery(null);
    requestAnimationFrame(() => {
      const ta = textareaRef.current;
      if (ta) {
        ta.style.height = "auto";
        ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
        const pos = before.length + tag.length;
        ta.focus();
        ta.selectionStart = ta.selectionEnd = pos;
      }
    });
  }, [text, mentionStart, mentionQuery]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (mentionQuery !== null && mentionResults.length > 0) {
      if (e.key === "ArrowDown") { e.preventDefault(); setMentionIndex(i => Math.min(i + 1, mentionResults.length - 1)); return; }
      if (e.key === "ArrowUp")   { e.preventDefault(); setMentionIndex(i => Math.max(i - 1, 0)); return; }
      if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); selectMention(mentionResults[mentionIndex]); return; }
      if (e.key === "Escape") { e.preventDefault(); setMentionQuery(null); return; }
    }
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // ── Grouped channels (with optional text filter)
  const filteredChannels = useMemo(() => {
    const q = channelFilter.trim().toLowerCase();
    return q ? channels.filter((c) => c.name.toLowerCase().includes(q)) : channels;
  }, [channels, channelFilter]);

  const publicChannels  = filteredChannels.filter((c) => !c.isPrivate && !c.isIm && !c.isMpim && !c.isGroup);
  const privateChannels = filteredChannels.filter((c) => (c.isPrivate || c.isGroup) && !c.isIm && !c.isMpim);
  const dms             = filteredChannels.filter((c) => c.isIm);
  const groups          = filteredChannels.filter((c) => c.isMpim);
  const humanUsers      = users.filter((u) => !u.isBot);
  const bots            = users.filter((u) => u.isBot);
  const favoriteChannels = useMemo(
    () => channels.filter((c) => favorites.includes(c.id)),
    [channels, favorites]
  );

  // Unread counts: from notifs (polling) + from latestTs vs lastSeenTs (on load)
  const unread = useMemo(() => {
    const counts: Record<string, number> = {};
    // From polling
    for (const n of notifs) counts[n.channelId] = (counts[n.channelId] ?? 0) + 1;
    // From channels latestTs (at least 1 unread marker)
    for (const ch of channels) {
      if (!ch.latestTs || counts[ch.id]) continue;
      const seen = lastSeenTs[ch.id] ?? "0";
      if (ch.latestTs > seen) counts[ch.id] = 1;
    }
    return counts;
  }, [notifs, channels, lastSeenTs]);

  const totalUnread = Object.values(unread).reduce((a, b) => a + b, 0);
  const isImOrMpim = selected?.isIm || selected?.isMpim;

  const renderChannelSection = (key: string, label: string, list: Channel[]) => {
    if (!list.length) return null;
    const isCollapsed = channelFilter ? false : collapsed.has(key);
    return (
      <div key={key}>
        <SectionBtn label={label} count={list.length} collapsed={isCollapsed} onToggle={() => toggleCollapse(key)} />
        {!isCollapsed && list.map((ch) => (
          <ChannelRow key={ch.id} ch={ch} selected={selected}
            isFav={favorites.includes(ch.id)} unread={unread[ch.id] ?? 0}
            onSelect={setSelected} onToggleFav={toggleFavorite} />
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="shrink-0">
        <Header title="Slack" subtitle="Canais e membros da equipe" />
      </div>

      {/* Stats */}
      {!loadingChannels && !loadingUsers && (
        <div className="shrink-0 px-6 py-3 grid grid-cols-4 gap-3">
          {[
            { label: "Públicos",  value: publicChannels.length,  icon: <Hash size={13} /> },
            { label: "Privados",  value: privateChannels.length, icon: <Lock size={13} /> },
            { label: "Usuários",  value: humanUsers.length,      icon: <User size={13} /> },
            { label: "Bots",      value: bots.length,            icon: <Bot  size={13} /> },
          ].map(({ label, value, icon }) => (
            <div key={label} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 flex items-center gap-2.5">
              <span className="text-violet-400">{icon}</span>
              <div>
                <p className="text-white font-semibold text-base leading-none">{value}</p>
                <p className="text-white/40 text-xs mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="shrink-0 mx-6 mb-2 flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          <AlertCircle size={15} className="text-red-400 shrink-0" />
          <p className="text-red-300 text-sm">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto text-red-400/60 hover:text-red-400"><X size={14} /></button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">

        {/* ── Sidebar ── */}
        <div className="w-56 border-r border-white/10 flex flex-col overflow-hidden shrink-0">
          <div className="flex border-b border-white/10 shrink-0">
            {(["channels", "users"] as const).map((tab) => (
              <button key={tab} onClick={() => setSidebarTab(tab)}
                className={clsx(
                  "flex-1 py-2 text-xs font-medium transition-colors",
                  sidebarTab === tab ? "text-violet-400 border-b-2 border-violet-500" : "text-white/40 hover:text-white/70"
                )}>
                {tab === "channels" ? "Canais" : "Usuários"}
              </button>
            ))}
          </div>

          {/* Channel filter input */}
          {sidebarTab === "channels" && (
            <div className="shrink-0 px-3 py-2 border-b border-white/5">
              <div className="flex items-center gap-2 bg-white/5 rounded-lg px-2.5 py-1.5 focus-within:ring-1 focus-within:ring-violet-500/40">
                <Search size={11} className="text-white/25 shrink-0" />
                <input
                  type="text"
                  value={channelFilter}
                  onChange={(e) => setChannelFilter(e.target.value)}
                  placeholder="Filtrar canais..."
                  className="flex-1 bg-transparent text-xs text-white placeholder-white/25 outline-none"
                />
                {channelFilter && (
                  <button onClick={() => setChannelFilter("")} className="text-white/25 hover:text-white/60">
                    <X size={11} />
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto pb-2">
            {sidebarTab === "channels" && (
              <>
                {loadingChannels && (
                  <div className="space-y-1 px-3 py-2">
                    {[1,2,3,4,5].map(i => <div key={i} className="h-7 bg-white/5 rounded-lg animate-pulse" />)}
                  </div>
                )}

                {/* Favoritos */}
                {!loadingChannels && !channelFilter && favoriteChannels.length > 0 && (
                  <div>
                    <SectionBtn label="Favoritos" count={favoriteChannels.length}
                      collapsed={collapsed.has("favs")} onToggle={() => toggleCollapse("favs")} />
                    {!collapsed.has("favs") && favoriteChannels.map((ch) => (
                      <ChannelRow key={ch.id} ch={ch} selected={selected}
                        isFav unread={unread[ch.id] ?? 0}
                        onSelect={setSelected} onToggleFav={toggleFavorite} />
                    ))}
                  </div>
                )}

                {!loadingChannels && (
                  <>
                    {renderChannelSection("public",  "Canais",             publicChannels)}
                    {renderChannelSection("private", "Privados",           privateChannels)}
                    {renderChannelSection("groups",  "Grupos",             groups)}
                    {renderChannelSection("dms",     "Mensagens Diretas",  dms)}
                  </>
                )}
              </>
            )}

            {sidebarTab === "users" && (
              <>
                {loadingUsers && (
                  <div className="space-y-1 px-3 py-2">
                    {[1,2,3,4].map(i => <div key={i} className="h-7 bg-white/5 rounded-lg animate-pulse" />)}
                  </div>
                )}
                {!loadingUsers && humanUsers.length > 0 && (
                  <>
                    <div className="flex items-center justify-between px-4 pt-3 pb-1">
                      <p className="text-white/30 text-xs uppercase tracking-wider">Pessoas</p>
                      <span className="text-white/20 text-xs">{humanUsers.length}</span>
                    </div>
                    {humanUsers.map(u => <UserRow key={u.id} user={u} />)}
                  </>
                )}
                {!loadingUsers && bots.length > 0 && (
                  <>
                    <div className="flex items-center justify-between px-4 pt-3 pb-1">
                      <p className="text-white/30 text-xs uppercase tracking-wider">Bots</p>
                      <span className="text-white/20 text-xs">{bots.length}</span>
                    </div>
                    {bots.map(u => <UserRow key={u.id} user={u} />)}
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* ── Right pane ── */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {selected && (
            <div className="shrink-0 px-4 py-2.5 border-b border-white/10 flex items-center gap-2">
              <span className="text-white/40 shrink-0"><ChannelIcon ch={selected} size={14} /></span>
              <span className="text-white font-medium text-sm">{selected.name}</span>
              {selected.members > 0 && (
                <span className="flex items-center gap-1 text-white/30 text-xs">
                  <Users size={10} />{selected.members}
                </span>
              )}
              <div className="ml-auto flex items-center gap-1">
                {/* Bell */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => {
                      setNotifOpen(v => !v);
                      if (typeof Notification !== "undefined" && Notification.permission === "default")
                        Notification.requestPermission();
                    }}
                    className={clsx(
                      "p-1.5 rounded-lg transition-colors relative",
                      notifOpen ? "bg-violet-600/30 text-violet-400" : "text-white/40 hover:text-white hover:bg-white/5"
                    )}
                    title="Notificações">
                    {totalUnread > 0 ? <BellDot size={14} className="text-violet-400" /> : <Bell size={14} />}
                    {totalUnread > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-violet-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center leading-none">
                        {totalUnread > 9 ? "9+" : totalUnread}
                      </span>
                    )}
                  </button>
                  {notifOpen && (
                    <NotifPanel
                      notifs={notifs}
                      userMap={userMap}
                      onGoTo={(channelId) => {
                        const ch = channelMap.get(channelId);
                        if (ch) { setSelected(ch); setNotifOpen(false); }
                      }}
                      onDismiss={(ts) => setNotifs(prev => prev.filter(n => n.ts !== ts))}
                      onDismissAll={() => setNotifs([])}
                      onClose={() => setNotifOpen(false)}
                    />
                  )}
                </div>

                {/* Search */}
                <button
                  onClick={() => { setSearchOpen(v => !v); setSearchQuery(""); setSearchResults([]); }}
                  className={clsx(
                    "p-1.5 rounded-lg transition-colors",
                    searchOpen ? "bg-violet-600/30 text-violet-400" : "text-white/40 hover:text-white hover:bg-white/5"
                  )}
                  title="Pesquisar">
                  <Search size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Search bar */}
          {searchOpen && (
            <div className="shrink-0 px-4 py-2 border-b border-white/10 flex items-center gap-2 bg-white/[0.02]">
              <Search size={13} className="text-white/30 shrink-0" />
              <input autoFocus type="text" value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquisar mensagens no workspace..."
                className="flex-1 bg-transparent text-sm text-white placeholder-white/30 outline-none" />
              {searchQuery && (
                <button onClick={() => { setSearchQuery(""); setSearchResults([]); }} className="text-white/30 hover:text-white">
                  <X size={13} />
                </button>
              )}
            </div>
          )}

          {/* Content */}
          {isImOrMpim ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2">
              <MessageCircle size={28} className="text-white/20" />
              <p className="text-white/30 text-sm">Histórico de DMs não disponível via API.</p>
            </div>
          ) : searchOpen ? (
            <div className="flex-1 overflow-y-auto">
              {searchLoading && (
                <div className="space-y-1 p-4">
                  {[1,2,3].map(i => <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />)}
                </div>
              )}
              {!searchLoading && !searchQuery && (
                <div className="flex flex-col items-center justify-center h-32 gap-2">
                  <Search size={22} className="text-white/20" />
                  <p className="text-white/30 text-sm">Digite para pesquisar em todos os canais</p>
                </div>
              )}
              {!searchLoading && searchQuery && searchResults.length === 0 && (
                <div className="flex flex-col items-center justify-center h-32 gap-2">
                  <Search size={22} className="text-white/20" />
                  <p className="text-white/30 text-sm">Nenhum resultado para &ldquo;{searchQuery}&rdquo;</p>
                </div>
              )}
              {searchResults.map((r) => {
                const user = r.user ? userMap.get(r.user) : null;
                return (
                  <a key={r.ts} href={r.permalink} target="_blank" rel="noopener noreferrer"
                    className="flex items-start gap-3 px-4 py-2.5 hover:bg-white/[0.03] transition-colors group">
                    <div className="shrink-0 mt-0.5">
                      {user ? <Avatar user={user} size={28} /> : (
                        <div className="w-7 h-7 rounded-full bg-violet-600/30 flex items-center justify-center">
                          <span className="text-violet-300 text-xs font-bold">{r.user?.[0]?.toUpperCase() ?? "?"}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-white/60 text-xs font-semibold">{user?.realName ?? r.user ?? "Usuário"}</span>
                        <span className="text-white/25 text-xs flex items-center gap-1"><Hash size={9} />{r.channelName}</span>
                        <span className="text-white/20 text-xs flex items-center gap-1"><Clock size={9} />{formatTime(r.date)}</span>
                      </div>
                      <p className="text-white/55 text-sm break-words leading-relaxed">{renderText(r.text)}</p>
                    </div>
                    <ChevronRight size={12} className="text-white/20 group-hover:text-white/40 shrink-0 mt-1 transition-colors" />
                  </a>
                );
              })}
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto py-2">
              {loadingMessages && (
                <div className="space-y-1 p-4">
                  {[1,2,3].map(i => <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />)}
                </div>
              )}
              {!loadingMessages && messages.length === 0 && selected && (
                <div className="flex flex-col items-center justify-center h-32 gap-2">
                  <MessageSquare size={24} className="text-white/20" />
                  <p className="text-white/30 text-sm">Nenhuma mensagem recente.</p>
                </div>
              )}
              {!loadingMessages && [...messages].reverse().map(msg => <MessageRow key={msg.ts} msg={msg} userMap={userMap} />)}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* ── Composer ── */}
          {selected && !isImOrMpim && (
            <div className="shrink-0 border-t border-white/10 px-4 py-3">
              {file && (
                <div className="mb-2 flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2">
                  <FileText size={13} className="text-violet-400 shrink-0" />
                  <span className="text-white/70 text-xs truncate flex-1">{file.name}</span>
                  <span className="text-white/30 text-xs shrink-0">{(file.size / 1024).toFixed(0)} KB</span>
                  <button onClick={() => setFile(null)} className="text-white/30 hover:text-white ml-1"><X size={13} /></button>
                </div>
              )}
              {sendError && (
                <div className="mb-2 flex items-center gap-2 text-red-400 text-xs">
                  <AlertCircle size={12} /><span>{sendError}</span>
                  <button onClick={() => setSendError(null)} className="ml-auto"><X size={11} /></button>
                </div>
              )}

              <div className="bg-white/5 border border-white/10 rounded-xl focus-within:border-violet-500/40 transition-colors overflow-hidden">

                {/* Formatting toolbar */}
                {formattingBarOpen && (
                  <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-white/8">
                    <ToolbarBtn icon={<Bold size={13} />} title="Negrito (*texto*)" onClick={() => wrapSelection("*", "*")} />
                    <ToolbarBtn icon={<Italic size={13} />} title="Itálico (_texto_)" onClick={() => wrapSelection("_", "_")} />
                    <ToolbarBtn icon={<Strikethrough size={13} />} title="Tachado (~texto~)" onClick={() => wrapSelection("~", "~")} />
                    <div className="w-px h-4 bg-white/10 mx-0.5" />
                    <ToolbarBtn icon={<Link2 size={13} />} title="Link" onClick={() => wrapSelection("<", "|texto>")} />
                    <div className="w-px h-4 bg-white/10 mx-0.5" />
                    <ToolbarBtn icon={<ListOrdered size={13} />} title="Lista numerada" onClick={() => prefixLines("1. ")} />
                    <ToolbarBtn icon={<List size={13} />} title="Lista de itens" onClick={() => prefixLines("• ")} />
                    <div className="w-px h-4 bg-white/10 mx-0.5" />
                    <ToolbarBtn icon={<Code size={13} />} title="Código inline" onClick={() => wrapSelection("`", "`")} />
                    <ToolbarBtn icon={<Code2 size={13} />} title="Bloco de código" onClick={() => wrapSelection("```\n", "\n```")} />
                  </div>
                )}

                {/* Textarea + mention dropdown */}
                <div className="relative px-3 pt-2.5 pb-1">
                  {mentionQuery !== null && mentionResults.length > 0 && (
                    <MentionDropdown
                      users={mentionResults}
                      highlight={mentionIndex}
                      onSelect={selectMention}
                    />
                  )}
                  <textarea
                    ref={textareaRef}
                    value={text}
                    onChange={handleTextChange}
                    onKeyDown={handleKeyDown}
                    placeholder={`Mensagem em #${selected.name}`}
                    rows={1}
                    style={{ maxHeight: 120 }}
                    className="w-full bg-transparent text-sm text-white placeholder-white/25 outline-none resize-none leading-relaxed"
                  />
                </div>

                {/* Bottom action bar */}
                <div className="flex items-center gap-0.5 px-2 pb-2 pt-1 border-t border-white/5">
                  {/* Attach */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-7 h-7 flex items-center justify-center rounded text-white/40 hover:text-white hover:bg-white/8 transition-colors"
                    title="Anexar arquivo">
                    <Plus size={16} />
                  </button>
                  <input ref={fileInputRef} type="file" className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)} />

                  {/* Formatting toggle */}
                  <button
                    type="button"
                    onClick={() => setFormattingBarOpen(v => !v)}
                    className={clsx(
                      "w-7 h-7 flex items-center justify-center rounded transition-colors text-xs font-bold",
                      formattingBarOpen ? "bg-violet-600/30 text-violet-300" : "text-white/40 hover:text-white hover:bg-white/8"
                    )}
                    title="Formatação">
                    <Type size={14} />
                  </button>

                  {/* Emoji */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setEmojiOpen(v => !v)}
                      className={clsx(
                        "w-7 h-7 flex items-center justify-center rounded transition-colors",
                        emojiOpen ? "bg-violet-600/30 text-violet-300" : "text-white/40 hover:text-violet-400 hover:bg-white/8"
                      )}
                      title="Emojis">
                      <Smile size={15} />
                    </button>
                    {emojiOpen && (
                      <EmojiPicker
                        onSelect={(emoji) => {
                          const ta = textareaRef.current;
                          if (ta) {
                            const start = ta.selectionStart ?? text.length;
                            const end = ta.selectionEnd ?? text.length;
                            const next = text.slice(0, start) + emoji + text.slice(end);
                            setText(next);
                            requestAnimationFrame(() => {
                              ta.focus();
                              ta.selectionStart = ta.selectionEnd = start + emoji.length;
                            });
                          } else {
                            setText(t => t + emoji);
                          }
                        }}
                        onClose={() => setEmojiOpen(false)}
                      />
                    )}
                  </div>

                  {/* @mention */}
                  <button
                    type="button"
                    onClick={() => insertAtCursor("@")}
                    className="w-7 h-7 flex items-center justify-center rounded text-white/40 hover:text-violet-400 hover:bg-white/8 transition-colors"
                    title="Mencionar alguém">
                    <AtSign size={15} />
                  </button>

                  {/* Video (disabled) */}
                  <button
                    type="button"
                    disabled
                    className="w-7 h-7 flex items-center justify-center rounded text-white/15 cursor-not-allowed"
                    title="Chamada de vídeo (em breve)">
                    <Video size={15} />
                  </button>

                  {/* Mic (disabled) */}
                  <button
                    type="button"
                    disabled
                    className="w-7 h-7 flex items-center justify-center rounded text-white/15 cursor-not-allowed"
                    title="Áudio (em breve)">
                    <Mic size={15} />
                  </button>

                  <div className="flex-1" />

                  {/* Send */}
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={sending || (!text.trim() && !file)}
                    className={clsx(
                      "w-7 h-7 flex items-center justify-center rounded transition-colors",
                      (text.trim() || file) && !sending
                        ? "bg-violet-600 text-white hover:bg-violet-500"
                        : "text-white/20 cursor-not-allowed"
                    )}
                    title="Enviar (Enter)">
                    {sending
                      ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <Send size={13} />}
                  </button>
                </div>
              </div>

              <p className="text-white/15 text-xs mt-1 px-1">Enter para enviar · Shift+Enter para nova linha</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
