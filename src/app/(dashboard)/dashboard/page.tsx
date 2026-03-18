"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Header } from "@/components/layout/Header";
import {
  CheckSquare, MessageSquare, Calendar, Mail,
  Bell, X, TrendingUp, TrendingDown,
  LayoutGrid, ChevronDown, Reply, CheckCheck,
  Inbox, RefreshCw, Check, Loader2, ExternalLink, GripVertical,
} from "lucide-react";

const font = "'Plus Jakarta Sans', -apple-system, sans-serif";

// ─── Types ───────────────────────────────────────────────────────────────────

type CalendarEvent = {
  id: string; title: string; start: string; end: string;
  location: string | null; description: string | null;
  htmlLink: string | null; meetLink: string | null; allDay: boolean;
  attendeeCount: number;
  selfStatus: "accepted" | "declined" | "tentative" | "needsAction" | null;
};
type EmailMessage = {
  id: string; threadId: string; subject: string;
  from: string; to: string; date: string; snippet: string; isUnread: boolean;
};
type EmailDetail = {
  id: string; threadId: string; subject: string;
  from: string; to: string; date: string; messageId: string;
  body: string; bodyHtml: string | null; isUnread: boolean;
};
type WorkflowState = { id: string; name: string; color: string; type: string; teamId?: string };

type LinearIssue = {
  id: string; title: string; priority: number;
  stateId: string; stateName: string; stateColor: string; stateType: string;
  url: string; identifier: string; projectName: string | null;
  teamId?: string;
};

type IssueDetail = {
  id: string; title: string; description: string | null; priority: number;
  identifier: string; url: string; stateId: string; stateName: string;
  stateColor: string; stateType: string; projectName: string | null;
  assigneeName: string | null; assigneeAvatarUrl: string | null;
  createdAt: string | null; updatedAt: string | null; dueDate: string | null;
  labels: { id: string; name: string; color: string }[];
};
type SlackMessage = { ts: string; text: string; user: string | null; userName: string; isBot: boolean; date: string };
type WoowMessage = SlackMessage & { nominees: string[] };
type MentionMessage = { ts: string; text: string; user: string | null; channelName: string; date: string; permalink: string };

type DashboardData = {
  calendarEvents: CalendarEvent[];
  gmailMessages: EmailMessage[];
  linearIssues: LinearIssue[];
  goldenPizzaMessages: SlackMessage[];
  woowMessages: WoowMessage[];
  mentions: MentionMessage[];
  authenticated: boolean;
  meta: { goldenPizzaChannelId: string; woowChannelId: string; slackUserId: string | null };
  errors?: Record<string, string>;
};

type NotificationItem = {
  id: string; type: "email" | "mention" | "calendar" | "linear";
  title: string; body: string; timestamp: number; read: boolean; href?: string;
};

type PrevCounts = { tasks: number; mentions: number; events: number; emails: number };

type SortKey = "priority" | "status" | "project" | "identifier";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function groupByDay(events: CalendarEvent[]): { label: string; events: CalendarEvent[] }[] {
  const groups: Record<string, CalendarEvent[]> = {};
  const today = new Date(); today.setHours(0, 0, 0, 0);
  events.forEach((e) => {
    const d = new Date(e.start); d.setHours(0, 0, 0, 0);
    const diff = Math.round((d.getTime() - today.getTime()) / 86400000);
    const label =
      diff === 0 ? "Hoje" :
      diff === 1 ? "Amanhã" :
      d.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "short" })
        .replace(/^\w/, (c) => c.toUpperCase());
    if (!groups[label]) groups[label] = [];
    groups[label].push(e);
  });
  return Object.entries(groups).map(([label, events]) => ({ label, events }));
}

function getEventIcon(title: string): string {
  const t = title.toLowerCase();
  if (/retro|retrospectiva/.test(t)) return "refresh-circle-outline";
  if (/pdi|1:1|one.on.one|mentoria|coach/.test(t)) return "person-circle-outline";
  if (/sync|alinhamento|sincronia/.test(t)) return "sync-outline";
  if (/planning|planing|sprint/.test(t)) return "clipboard-outline";
  if (/review|revisão|revisao/.test(t)) return "eye-outline";
  if (/ocupado|bloqueado|blocked|busy/.test(t)) return "ban-outline";
  if (/entrevista|interview/.test(t)) return "mic-outline";
  if (/apresentação|apresentacao|demo|pitch/.test(t)) return "easel-outline";
  if (/almoço|almoco|lunch|coffee|café|cafe/.test(t)) return "cafe-outline";
  if (/treinamento|training|workshop|aula/.test(t)) return "school-outline";
  return "calendar-outline";
}

function parseFrom(from: string): string {
  const m = from.match(/^"?(.+?)"?\s*<.+>$/);
  return m ? m[1].trim().replace(/['"]/g, "") : from.split("@")[0];
}

function slackText(text: string, limit = 160): string {
  return text
    .replace(/<#[A-Z0-9]+\|([^>]+)>/g, "#$1")
    .replace(/<([^|>]+)\|([^>]+)>/g, "$2")
    .replace(/<https?:[^>]+>/g, "[link]")
    .slice(0, limit);
}

function sortIssues(issues: LinearIssue[], key: SortKey): LinearIssue[] {
  return [...issues].sort((a, b) => {
    switch (key) {
      case "priority":
        // priority 0 = no priority (sort last), 1=urgent first
        const pa = a.priority === 0 ? 99 : a.priority;
        const pb = b.priority === 0 ? 99 : b.priority;
        return pa - pb;
      case "status":
        return a.stateName.localeCompare(b.stateName);
      case "project":
        return (a.projectName ?? "").localeCompare(b.projectName ?? "");
      case "identifier":
        return a.identifier.localeCompare(b.identifier);
      default:
        return 0;
    }
  });
}

const priorityColor: Record<number, string> = {
  0: "var(--text-muted)", 1: "#ef4444", 2: "#f97316", 3: "#eab308", 4: "var(--text-muted)",
};
const priorityLabel: Record<number, string> = {
  0: "—", 1: "Urgente", 2: "Alta", 3: "Média", 4: "Baixa",
};

const notifTypeIcon: Record<NotificationItem["type"], string> = {
  email: "mail-outline", mention: "chatbubble-ellipses-outline", calendar: "calendar-outline", linear: "checkmark-circle-outline",
};
const notifTypeColor: Record<NotificationItem["type"], string> = {
  email: "#00E87A", mention: "#1488D8", calendar: "#E5138E", linear: "#7B2FDE",
};

// ─── UI Primitives ────────────────────────────────────────────────────────────

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: "var(--bg-card)", border: "1px solid var(--border-card)",
      borderRadius: 14, padding: 20, ...style,
    }}>
      {children}
    </div>
  );
}

function SectionHeader({
  icon, title, count, color, action,
}: { icon: string; title: string; count?: number; color?: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
      <ion-icon name={icon} style={{ fontSize: 16, color: color ?? "var(--text-muted)" }} aria-hidden="true" />
      <span style={{ fontFamily: font, fontWeight: 600, fontSize: 13, color: "var(--text-primary)" }}>
        {title}
      </span>
      {count !== undefined && (
        <span style={{
          fontFamily: font, fontWeight: 500, fontSize: 11,
          color: "var(--text-muted)",
          borderRadius: 20, padding: "2px 0",
        }}>
          {count}
        </span>
      )}
      {action && <div style={{ marginLeft: "auto" }}>{action}</div>}
    </div>
  );
}

function Skeleton({ height = 16, style }: { height?: number; style?: React.CSSProperties }) {
  return (
    <div style={{
      height, width: "100%", background: "var(--bg-active)", borderRadius: 8,
      animation: "sk-pulse 1.5s ease-in-out infinite", ...style,
    }} />
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <p style={{ fontFamily: font, fontSize: 12, color: "var(--text-muted)", margin: 0 }}>
      {text}
    </p>
  );
}

function DeltaBadge({ delta }: { delta: number }) {
  if (delta === 0) return null;
  const up = delta > 0;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 3,
      fontFamily: font, fontWeight: 700, fontSize: 11,
      color: up ? "#00E87A" : "#ef4444",
      background: up ? "rgba(0,232,122,0.12)" : "rgba(239,68,68,0.12)",
      border: `1px solid ${up ? "rgba(0,232,122,0.25)" : "rgba(239,68,68,0.25)"}`,
      borderRadius: 20, padding: "3px 8px",
    }}>
      {up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
      {up ? `+${delta} Mais` : `${delta} Menos`}
    </span>
  );
}

// ─── Sort Dropdown ─────────────────────────────────────────────────────────────

function SortDropdown({ value, onChange }: { value: SortKey; onChange: (v: SortKey) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const options: { value: SortKey; label: string }[] = [
    { value: "priority", label: "Prioridade" },
    { value: "status",   label: "Status" },
    { value: "project",  label: "Projeto" },
    { value: "identifier", label: "ID" },
  ];

  const current = options.find((o) => o.value === value)?.label ?? "Ordenar";

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex", alignItems: "center", gap: 4,
          fontFamily: font, fontSize: 11, fontWeight: 500,
          color: "var(--text-muted)",
          background: open ? "var(--bg-active)" : "transparent",
          border: "1px solid var(--border-card)",
          borderRadius: 7, padding: "4px 8px",
          cursor: "pointer", transition: "all .15s",
        }}
      >
        {current}
        <ChevronDown size={10} />
      </button>
      {open && (
        <div style={{
          position: "absolute", top: 28, right: 0, zIndex: 300,
          background: "var(--bg-card)", border: "1px solid var(--border-card)",
          borderRadius: 10, boxShadow: "0 6px 20px rgba(0,0,0,0.35)",
          minWidth: 120, overflow: "hidden",
        }}>
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              style={{
                display: "block", width: "100%", textAlign: "left",
                fontFamily: font, fontSize: 12, fontWeight: opt.value === value ? 700 : 400,
                color: opt.value === value ? "var(--mk-purple)" : "var(--text-secondary)",
                background: opt.value === value ? "rgba(123,47,222,0.1)" : "transparent",
                border: "none", padding: "8px 12px", cursor: "pointer",
                transition: "background .1s",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Issue Card ───────────────────────────────────────────────────────────────

// ─── StatusDot (compact status dropdown for dashboard cards) ──────────────────

function StatusDot({
  issue, states, updating, onStatusChange,
}: {
  issue: LinearIssue; states: WorkflowState[]; updating: boolean;
  onStatusChange: (id: string, state: WorkflowState) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    function outside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", outside);
    return () => document.removeEventListener("mousedown", outside);
  }, [open]);
  return (
    <div ref={ref} style={{ position: "relative", flexShrink: 0 }}>
      <button
        title={`Status: ${issue.stateName}`}
        onClick={(e) => { e.stopPropagation(); if (!updating) setOpen((v) => !v); }}
        style={{
          width: 18, height: 18, padding: 0, border: "none", background: "transparent",
          borderRadius: "50%", cursor: updating ? "wait" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        {updating
          ? <Loader2 size={10} className="animate-spin" style={{ color: "var(--accent)" }} />
          : <span style={{ width: 9, height: 9, borderRadius: "50%", background: issue.stateColor, display: "inline-block" }} />
        }
      </button>
      {open && states.length > 0 && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 400,
          background: "var(--bg-sidebar)", border: "1px solid var(--border-card)",
          borderRadius: 10, padding: 4, minWidth: 180,
          boxShadow: "0 8px 40px rgba(0,0,0,0.55)",
        }}>
          {states.map((s) => (
            <button
              key={s.id}
              onClick={(e) => { e.stopPropagation(); onStatusChange(issue.id, s); setOpen(false); }}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                width: "100%", padding: "6px 10px", borderRadius: 6,
                background: s.id === issue.stateId ? "var(--bg-active)" : "transparent",
                border: "none", cursor: "pointer",
                color: "var(--text-primary)", fontSize: 12, textAlign: "left",
              }}
              onMouseEnter={(e) => { if (s.id !== issue.stateId) e.currentTarget.style.background = "var(--bg-card-hover)"; }}
              onMouseLeave={(e) => { if (s.id !== issue.stateId) e.currentTarget.style.background = "transparent"; }}
            >
              <span style={{ width: 9, height: 9, borderRadius: "50%", background: s.color, flexShrink: 0, display: "inline-block" }} />
              {s.name}
              {s.id === issue.stateId && <Check size={10} style={{ marginLeft: "auto", color: "var(--accent)" }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── IssueCard ────────────────────────────────────────────────────────────────

function IssueCard({
  issue, compact = false, states, updatingId,
  onStatusChange, onOpenModal, onMarkDone,
  dragOverId, onDragStart, onDragOver, onDrop,
}: {
  issue: LinearIssue; compact?: boolean; states: WorkflowState[];
  updatingId: string | null;
  onStatusChange: (id: string, state: WorkflowState) => void;
  onOpenModal: (id: string) => void;
  onMarkDone: (issue: LinearIssue) => void;
  dragOverId: string | null;
  onDragStart: (id: string) => void;
  onDragOver: (id: string) => void;
  onDrop: (targetId: string) => void;
}) {
  const isDone = issue.stateType === "completed" || issue.stateType === "cancelled";
  const borderColor = isDone ? "var(--mk-blue)" : issue.stateColor;
  const isOver = dragOverId === issue.id;
  return (
    <div
      draggable
      onDragStart={(e) => { e.dataTransfer.effectAllowed = "move"; onDragStart(issue.id); }}
      onDragOver={(e) => { e.preventDefault(); onDragOver(issue.id); }}
      onDrop={(e) => { e.preventDefault(); onDrop(issue.id); }}
      onClick={() => onOpenModal(issue.id)}
      style={{
        display: "flex", alignItems: "center", gap: 5,
        padding: compact ? "5px 7px 5px 8px" : "8px 10px 8px 10px",
        borderRadius: 8,
        background: isOver ? "var(--bg-card-hover)" : "var(--bg-active)",
        border: `1px solid ${isOver ? "var(--mk-purple)" : "var(--border-card)"}`,
        borderLeft: `3px solid ${borderColor}`,
        cursor: "pointer", transition: "background .1s, border-color .1s",
        userSelect: "none",
      }}
    >
      <GripVertical
        size={11}
        onClick={(e) => e.stopPropagation()}
        style={{ color: "var(--text-muted)", cursor: "grab", flexShrink: 0, opacity: 0.4 }}
      />
      <StatusDot issue={issue} states={states} updating={updatingId === issue.id} onStatusChange={onStatusChange} />
      <span style={{ fontFamily: "monospace", fontSize: 9, color: "var(--text-muted)", flexShrink: 0 }}>
        {issue.identifier}
      </span>
      <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
        <div style={{
          fontFamily: font, fontSize: compact ? 11 : 12, fontWeight: 500,
          color: "var(--text-primary)",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          textDecoration: isDone ? "line-through" : "none", opacity: isDone ? 0.65 : 1,
        }}>
          {issue.title}
        </div>
        {issue.projectName && (
          <div style={{
            fontFamily: font, fontSize: 9, color: "var(--mk-blue)", opacity: 0.8,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {issue.projectName}
          </div>
        )}
      </div>
      <span style={{
        fontFamily: font, fontSize: 9, fontWeight: 600,
        color: priorityColor[issue.priority], flexShrink: 0,
      }}>
        {priorityLabel[issue.priority]}
      </span>
      {!isDone && (
        <button
          onClick={(e) => { e.stopPropagation(); onMarkDone(issue); }}
          title="Marcar como pronto"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 18, height: 18, borderRadius: 5, flexShrink: 0,
            background: "transparent", border: "1px solid var(--border-card)",
            cursor: "pointer", color: "var(--text-muted)", transition: "all .12s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(20,136,216,0.15)";
            e.currentTarget.style.borderColor = "var(--mk-blue)";
            e.currentTarget.style.color = "var(--mk-blue)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.borderColor = "var(--border-card)";
            e.currentTarget.style.color = "var(--text-muted)";
          }}
        >
          <Check size={10} />
        </button>
      )}
    </div>
  );
}

// ─── Tasks Modal ──────────────────────────────────────────────────────────────

function TasksModal({
  issues, doneIssueIds, states, updatingId,
  onStatusChange, onMarkDone, onOpenModal, onClose,
}: {
  issues: LinearIssue[]; doneIssueIds: Set<string>; states: WorkflowState[];
  updatingId: string | null;
  onStatusChange: (id: string, state: WorkflowState) => void;
  onMarkDone: (issue: LinearIssue) => void;
  onOpenModal: (id: string) => void;
  onClose: () => void;
}) {
  const [sort, setSort] = useState<SortKey>("priority");
  const [colOrders, setColOrders] = useState<Record<string, string[]>>({});
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  function applyColOrder(items: LinearIssue[], colKey: string): LinearIssue[] {
    const order = colOrders[colKey];
    if (!order || order.length === 0) return items;
    const map = new Map(order.map((id, idx) => [id, idx]));
    return [...items].sort((a, b) => {
      const ai = map.has(a.id) ? map.get(a.id)! : 999;
      const bi = map.has(b.id) ? map.get(b.id)! : 999;
      return ai - bi;
    });
  }

  function handleDrop(targetId: string, colKey: string, items: LinearIssue[]) {
    if (!dragId || dragId === targetId) { setDragId(null); setDragOverId(null); return; }
    const current = (colOrders[colKey] && colOrders[colKey].length > 0) ? colOrders[colKey] : items.map((i) => i.id);
    const from = current.indexOf(dragId);
    const to = current.indexOf(targetId);
    if (from < 0 || to < 0) { setDragId(null); setDragOverId(null); return; }
    const next = [...current];
    next.splice(from, 1);
    next.splice(to, 0, dragId);
    setColOrders((prev) => ({ ...prev, [colKey]: next }));
    setDragId(null);
    setDragOverId(null);
  }

  const activeIssues = issues.filter((i) => !doneIssueIds.has(i.id) && i.stateType !== "completed" && i.stateType !== "cancelled");
  const doneItems    = issues.filter((i) => doneIssueIds.has(i.id) || i.stateType === "completed" || i.stateType === "cancelled");

  const todo     = applyColOrder(sortIssues(activeIssues.filter((i) => i.stateType === "unstarted" || i.stateType === "backlog" || i.stateType === "triage"), sort), "todo");
  const inReview = applyColOrder(sortIssues(activeIssues.filter((i) => i.stateType === "started" && /review/i.test(i.stateName)), sort), "review");
  const inProg   = applyColOrder(sortIssues(activeIssues.filter((i) => i.stateType === "started" && !/review/i.test(i.stateName)), sort), "inprog");

  const columns = [
    { key: "todo",   label: "📋 A Fazer",      color: "var(--text-secondary)", items: todo },
    { key: "inprog", label: "🔄 Em Andamento", color: "var(--mk-purple)",      items: inProg },
    { key: "review", label: "🔍 Em Revisão",   color: "var(--mk-blue)",        items: inReview },
  ];

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 500,
        background: "var(--bg-modal-overlay)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24,
      }}
    >
      <div style={{
        background: "var(--bg-modal)",
        backdropFilter: "blur(32px) saturate(180%)",
        WebkitBackdropFilter: "blur(32px) saturate(180%)",
        border: "1px solid var(--glass-border)",
        borderRadius: 18,
        boxShadow: "var(--shadow-modal)",
        width: "100%", maxWidth: 1040, maxHeight: "88vh",
        display: "flex", flexDirection: "column", overflow: "hidden",
      }}>
        {/* Modal header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 24px 14px",
          borderBottom: "1px solid var(--border-card)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <CheckSquare size={16} color="var(--mk-purple)" />
            <span style={{ fontFamily: font, fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>
              Todas as tasks
            </span>
            <span style={{
              fontFamily: font, fontSize: 11, fontWeight: 600,
              background: "rgba(123,47,222,0.15)", color: "var(--mk-purple)",
              borderRadius: 20, padding: "2px 8px",
            }}>
              {activeIssues.length}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <SortDropdown value={sort} onChange={(v) => { setSort(v); setColOrders({}); }} />
            <button
              onClick={onClose}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 28, height: 28, borderRadius: 8,
                background: "var(--bg-active)", border: "1px solid var(--border-card)",
                cursor: "pointer",
              }}
            >
              <X size={13} color="var(--text-muted)" />
            </button>
          </div>
        </div>

        <div style={{ overflowY: "auto", flex: 1, padding: 20, display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Kanban columns */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {columns.map(({ key, label, color, items }) => (
              <div key={key} style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
                {/* Column header */}
                <div style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "8px 10px", borderRadius: 8,
                  background: "var(--bg-active)",
                  border: "1px solid var(--border-card)",
                }}>
                  <span style={{ fontFamily: font, fontWeight: 700, fontSize: 11, color }}>{label}</span>
                  <span style={{
                    fontFamily: font, fontSize: 10, fontWeight: 600,
                    background: "var(--bg-modal)", color: "var(--text-muted)",
                    borderRadius: 12, padding: "1px 6px", marginLeft: "auto",
                  }}>
                    {items.length}
                  </span>
                </div>
                {/* Cards */}
                {items.length === 0 ? (
                  <p style={{ fontFamily: font, fontSize: 11, color: "var(--text-muted)", padding: "6px 2px", margin: 0 }}>
                    Nenhuma task aqui.
                  </p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {items.map((issue) => (
                      <IssueCard
                        key={issue.id}
                        issue={issue}
                        states={states}
                        updatingId={updatingId}
                        onStatusChange={onStatusChange}
                        onOpenModal={onOpenModal}
                        onMarkDone={onMarkDone}
                        dragOverId={dragOverId}
                        onDragStart={setDragId}
                        onDragOver={setDragOverId}
                        onDrop={(targetId) => handleDrop(targetId, key, items)}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Done section */}
          {doneItems.length > 0 && (
            <div style={{ borderTop: "1px solid var(--border-card)", paddingTop: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{
                  fontSize: 10, fontWeight: 700, color: "var(--mk-blue)",
                  letterSpacing: "0.06em", textTransform: "uppercase",
                }}>
                  ✅ Concluídas
                </span>
                <span style={{
                  fontSize: 10, color: "var(--text-muted)",
                  background: "rgba(20,136,216,0.12)", border: "1px solid rgba(20,136,216,0.25)",
                  padding: "1px 6px", borderRadius: 20,
                }}>
                  {doneItems.length}
                </span>
                <div style={{ flex: 1, height: 1, background: "var(--border-card)" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 5 }}>
                {doneItems.map((issue) => (
                  <IssueCard
                    key={issue.id}
                    issue={issue}
                    states={states}
                    updatingId={updatingId}
                    onStatusChange={onStatusChange}
                    onOpenModal={onOpenModal}
                    onMarkDone={onMarkDone}
                    dragOverId={null}
                    onDragStart={() => {}}
                    onDragOver={() => {}}
                    onDrop={() => {}}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Issue Detail Modal ────────────────────────────────────────────────────────

function IssueDetailModal({
  loading, detail, onClose,
}: {
  loading: boolean; detail: IssueDetail | null; onClose: () => void;
}) {
  const priorityLabelModal: Record<number, { label: string; color: string }> = {
    0: { label: "Sem prioridade", color: "var(--text-muted)" },
    1: { label: "Urgente",        color: "var(--mk-magenta)" },
    2: { label: "Alta",           color: "var(--mk-orange)"  },
    3: { label: "Média",          color: "var(--mk-yellow)"  },
    4: { label: "Baixa",          color: "var(--text-secondary)" },
  };
  function fmtDate(iso: string | null) {
    if (!iso) return null;
    return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
  }
  useEffect(() => {
    function handleEsc(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);
  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 600,
        background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--bg-sidebar)", borderRadius: 16,
          border: "1px solid var(--border-card)",
          width: "100%", maxWidth: 640, maxHeight: "82vh",
          overflow: "auto", position: "relative",
          boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 16, right: 16, zIndex: 10,
            background: "var(--bg-card)", border: "1px solid var(--border-card)",
            borderRadius: 8, padding: 6, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--text-muted)",
          }}
        >
          <X size={14} />
        </button>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 64 }}>
            <Loader2 size={28} className="animate-spin" style={{ color: "var(--accent)" }} />
          </div>
        ) : detail ? (
          <div style={{ padding: 28 }}>
            <div style={{ marginBottom: 20, paddingRight: 32 }}>
              <span style={{
                fontSize: 11, color: "var(--text-muted)", fontFamily: "monospace",
                background: "var(--bg-card)", border: "1px solid var(--border-card)",
                padding: "2px 8px", borderRadius: 6, display: "inline-block", marginBottom: 10,
              }}>
                {detail.identifier}
              </span>
              <h2 style={{ color: "var(--text-primary)", fontSize: 18, fontWeight: 700, lineHeight: 1.3, margin: 0 }}>
                {detail.title}
              </h2>
            </div>
            <div style={{
              display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
              padding: "10px 14px", background: "var(--bg-card)",
              border: "1px solid var(--border-card)", borderRadius: 10, marginBottom: 20,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: detail.stateColor, display: "inline-block" }} />
                <span style={{ fontSize: 12, color: "var(--text-primary)" }}>{detail.stateName}</span>
              </div>
              <span style={{ color: "var(--border-card)" }}>·</span>
              <span style={{ fontSize: 12, color: priorityLabelModal[detail.priority]?.color }}>
                {priorityLabelModal[detail.priority]?.label}
              </span>
              {detail.projectName && (
                <>
                  <span style={{ color: "var(--border-card)" }}>·</span>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{detail.projectName}</span>
                </>
              )}
            </div>
            {detail.description ? (
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                  Descrição
                </p>
                <div style={{
                  fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.65,
                  whiteSpace: "pre-wrap", wordBreak: "break-word",
                  background: "var(--bg-card)", border: "1px solid var(--border-card)",
                  borderRadius: 10, padding: "12px 14px",
                }}>
                  {detail.description}
                </div>
              </div>
            ) : (
              <div style={{ marginBottom: 20 }}>
                <div style={{ padding: "12px 14px", background: "var(--bg-card)", border: "1px solid var(--border-card)", borderRadius: 10 }}>
                  <p style={{ fontSize: 13, color: "var(--text-muted)", fontStyle: "italic", margin: 0 }}>Sem descrição.</p>
                </div>
              </div>
            )}
            <div style={{ borderTop: "1px solid var(--border-card)", paddingTop: 16, marginBottom: 20, display: "flex", flexDirection: "column", gap: 10 }}>
              {detail.assigneeName && (
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: "var(--text-muted)", width: 90, flexShrink: 0 }}>Atribuído a</span>
                  <span style={{ fontSize: 13, color: "var(--text-primary)" }}>{detail.assigneeName}</span>
                </div>
              )}
              {detail.labels.length > 0 && (
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: "var(--text-muted)", width: 90, flexShrink: 0 }}>Labels</span>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {detail.labels.map((l) => (
                      <span key={l.id} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: l.color + "22", border: `1px solid ${l.color}66`, color: l.color }}>
                        {l.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {detail.dueDate && (
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: "var(--text-muted)", width: 90, flexShrink: 0 }}>Vencimento</span>
                  <span style={{ fontSize: 13, color: "var(--mk-orange)" }}>{fmtDate(detail.dueDate)}</span>
                </div>
              )}
              {detail.createdAt && (
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: "var(--text-muted)", width: 90, flexShrink: 0 }}>Criado em</span>
                  <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{fmtDate(detail.createdAt)}</span>
                </div>
              )}
              {detail.updatedAt && (
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: "var(--text-muted)", width: 90, flexShrink: 0 }}>Atualizado</span>
                  <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{fmtDate(detail.updatedAt)}</span>
                </div>
              )}
            </div>
            <div style={{ borderTop: "1px solid var(--border-card)", paddingTop: 16 }}>
              <a
                href={detail.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500,
                  background: "var(--mk-purple)", color: "#fff",
                  textDecoration: "none", transition: "opacity 0.12s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                Abrir no Linear
                <ExternalLink size={13} />
              </a>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

// ─── Meeting Detail Modal ─────────────────────────────────────────────────────

const rsvpLabel: Record<string, { label: string; color: string }> = {
  accepted:    { label: "Aceito",   color: "var(--mk-green-text)" },
  declined:    { label: "Recusado", color: "#ef4444" },
  tentative:   { label: "Talvez",   color: "#f59e0b" },
  needsAction: { label: "Pendente", color: "var(--text-muted)" },
};

function MeetingDetailModal({
  event,
  isImportant,
  onToggleImportant,
  onArchive,
  onClose,
  onRsvp,
}: {
  event: CalendarEvent;
  isImportant: boolean;
  onToggleImportant: () => void;
  onArchive: () => void;
  onClose: () => void;
  onRsvp?: (eventId: string, status: "accepted" | "declined" | "tentative") => void;
}) {
  const [rsvpStatus, setRsvpStatus] = useState(event.selfStatus);
  const [rsvpLoading, setRsvpLoading] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  async function handleRsvp(status: "accepted" | "declined" | "tentative") {
    setRsvpLoading(true);
    try {
      const res = await fetch("/api/google/calendar", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: event.id, status }),
      });
      if (!res.ok) return;
      setRsvpStatus(status);
      onRsvp?.(event.id, status);
    } catch {
      // falha de rede — ignora
    } finally {
      setRsvpLoading(false);
    }
  }

  const duration = event.allDay ? null : (() => {
    const ms = new Date(event.end).getTime() - new Date(event.start).getTime();
    const h = Math.floor(ms / 3600000);
    const m = Math.round((ms % 3600000) / 60000);
    return h > 0 ? `${h}h${m > 0 ? ` ${m}min` : ""}` : `${m}min`;
  })();

  const dateLabel = new Date(event.start).toLocaleDateString("pt-BR", {
    weekday: "long", day: "numeric", month: "long",
  }).replace(/^\w/, (c) => c.toUpperCase());

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 500,
        background: "var(--bg-modal-overlay)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24,
      }}
    >
      <div style={{
        background: "var(--bg-modal)",
        border: "1px solid var(--border-card)",
        borderRadius: 16,
        boxShadow: "var(--shadow-modal)",
        width: "100%", maxWidth: 480,
        display: "flex", flexDirection: "column",
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "flex-start", justifyContent: "space-between",
          padding: "18px 20px 14px",
          borderBottom: "1px solid var(--border-card)",
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10, flex: 1, minWidth: 0 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10, flexShrink: 0,
              background: "rgba(20,136,216,0.12)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <ion-icon name={event.meetLink ? "videocam" : getEventIcon(event.title)} style={{ fontSize: 16, color: "#1488D8" }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{ fontFamily: font, fontWeight: 700, fontSize: 15, color: "var(--text-primary)", margin: 0, lineHeight: 1.35 }}>
                {event.title}
              </h2>
              {rsvpStatus && rsvpLabel[rsvpStatus] && (
                <span style={{
                  fontFamily: font, fontSize: 10, fontWeight: 600,
                  color: rsvpLabel[rsvpStatus].color,
                  background: `${rsvpLabel[rsvpStatus].color}18`,
                  border: `1px solid ${rsvpLabel[rsvpStatus].color}40`,
                  borderRadius: 6, padding: "1px 7px", marginTop: 5, display: "inline-block",
                }}>
                  {rsvpLabel[rsvpStatus].label}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 28, height: 28, borderRadius: 8, flexShrink: 0,
              background: "var(--bg-active)", border: "1px solid var(--border-card)",
              cursor: "pointer", color: "var(--text-secondary)", marginLeft: 8,
            }}
          >
            <ion-icon name="close-outline" style={{ fontSize: 16 }} />
          </button>
        </div>

        {/* Details */}
        <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
          {/* Date + time */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ion-icon name="time-outline" style={{ fontSize: 14, color: "var(--text-muted)", flexShrink: 0 }} />
            <span style={{ fontFamily: font, fontSize: 13, color: "var(--text-secondary)" }}>
              {dateLabel}
              {!event.allDay && (
                <> · <strong style={{ color: "var(--text-primary)" }}>{formatTime(event.start)}</strong> → {formatTime(event.end)}
                {duration && <span style={{ color: "var(--text-muted)" }}> ({duration})</span>}</>
              )}
              {event.allDay && <> · <span style={{ color: "var(--text-muted)" }}>Dia todo</span></>}
            </span>
          </div>

          {/* Location */}
          {event.location && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
              <ion-icon name="location-outline" style={{ fontSize: 14, color: "var(--text-muted)", flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontFamily: font, fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.4 }}>
                {event.location}
              </span>
            </div>
          )}

          {/* Attendees */}
          {event.attendeeCount > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <ion-icon name="people-outline" style={{ fontSize: 14, color: "var(--text-muted)", flexShrink: 0 }} />
              <span style={{ fontFamily: font, fontSize: 13, color: "var(--text-secondary)" }}>
                {event.attendeeCount} participante{event.attendeeCount !== 1 ? "s" : ""}
              </span>
            </div>
          )}

          {/* Description */}
          {event.description && (() => {
            const clean = event.description.replace(/<[^>]*>/g, "").trim();
            return clean.length > 0 ? (
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <ion-icon name="document-text-outline" style={{ fontSize: 14, color: "var(--text-muted)", flexShrink: 0, marginTop: 2 }} />
                <p style={{
                  fontFamily: font, fontSize: 12, color: "var(--text-muted)",
                  margin: 0, lineHeight: 1.5,
                  display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}>
                  {clean}
                </p>
              </div>
            ) : null;
          })()}
        </div>

        {/* RSVP + Actions */}
        <div style={{
          padding: "12px 20px 18px",
          borderTop: "1px solid var(--border-card)",
          display: "flex", flexDirection: "column", gap: 10,
        }}>
          {/* RSVP buttons (only if event has attendees and hasn't passed) */}
          {event.attendeeCount > 0 && new Date(event.end).getTime() > Date.now() && (
            <div>
              <p style={{ fontFamily: font, fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 8px 0" }}>
                Responder convite
              </p>
              <div style={{ display: "flex", gap: 6 }}>
                {([
                  { status: "accepted" as const,  label: "Aceitar",  icon: "checkmark-circle-outline", color: "var(--mk-green-text)",  bg: "var(--mk-green-subtle)",  border: "var(--mk-green-border)" },
                  { status: "tentative" as const, label: "Talvez",   icon: "help-circle-outline",      color: "#f59e0b",               bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.3)" },
                  { status: "declined" as const,  label: "Recusar",  icon: "close-circle-outline",     color: "#ef4444",               bg: "rgba(239,68,68,0.1)",    border: "rgba(239,68,68,0.25)" },
                ] as const).map(({ status, label, icon, color, bg, border }) => (
                  <button
                    key={status}
                    onClick={() => handleRsvp(status)}
                    disabled={rsvpLoading || rsvpStatus === status}
                    style={{
                      flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                      fontFamily: font, fontSize: 11, fontWeight: 600,
                      color: rsvpStatus === status ? color : "var(--text-secondary)",
                      background: rsvpStatus === status ? bg : "var(--bg-active)",
                      border: `1px solid ${rsvpStatus === status ? border : "var(--border-card)"}`,
                      borderRadius: 8, padding: "7px 6px",
                      cursor: rsvpLoading || rsvpStatus === status ? "default" : "pointer",
                      opacity: rsvpLoading ? 0.6 : 1,
                      transition: "all .15s",
                    }}
                  >
                    <ion-icon name={icon} style={{ fontSize: 13 }} />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Secondary actions */}
          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={onToggleImportant}
              style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                fontFamily: font, fontSize: 11, fontWeight: 600,
                color: isImportant ? "#f59e0b" : "var(--text-secondary)",
                background: isImportant ? "rgba(245,158,11,0.12)" : "var(--bg-active)",
                border: `1px solid ${isImportant ? "rgba(245,158,11,0.3)" : "var(--border-card)"}`,
                borderRadius: 8, padding: "7px 6px",
                cursor: "pointer", transition: "all .15s",
              }}
            >
              <ion-icon name={isImportant ? "star" : "star-outline"} style={{ fontSize: 13 }} />
              {isImportant ? "Importante" : "Marcar importante"}
            </button>
            <button
              onClick={() => { onArchive(); onClose(); }}
              style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                fontFamily: font, fontSize: 11, fontWeight: 600,
                color: "var(--text-secondary)",
                background: "var(--bg-active)",
                border: "1px solid var(--border-card)",
                borderRadius: 8, padding: "7px 6px",
                cursor: "pointer", transition: "all .15s",
              }}
            >
              <ion-icon name="archive-outline" style={{ fontSize: 13 }} />
              Arquivar
            </button>
            <a
              href={event.meetLink ?? event.htmlLink ?? "#"}
              target="_blank"
              rel="noreferrer"
              style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                fontFamily: font, fontSize: 11, fontWeight: 600,
                color: event.meetLink ? "var(--mk-green-text)" : "#1488D8",
                background: event.meetLink ? "var(--mk-green-subtle)" : "rgba(20,136,216,0.12)",
                border: `1px solid ${event.meetLink ? "var(--mk-green-border)" : "rgba(20,136,216,0.25)"}`,
                borderRadius: 8, padding: "7px 6px",
                textDecoration: "none", transition: "all .15s", textAlign: "center",
              }}
            >
              <ion-icon name={event.meetLink ? "videocam-outline" : "open-outline"} style={{ fontSize: 13 }} />
              {event.meetLink ? "Entrar" : "Abrir"}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Past Meetings Modal ──────────────────────────────────────────────────────

function PastMeetingsModal({ events, onClose }: { events: CalendarEvent[]; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Group by day, most recent first
  const groups: Record<string, CalendarEvent[]> = {};
  const today = new Date(); today.setHours(0, 0, 0, 0);
  [...events].sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime()).forEach((e) => {
    const d = new Date(e.start); d.setHours(0, 0, 0, 0);
    const diff = Math.round((today.getTime() - d.getTime()) / 86400000);
    const label = diff === 0 ? "Hoje" : diff === 1 ? "Ontem" :
      d.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "short" })
        .replace(/^\w/, (c) => c.toUpperCase());
    if (!groups[label]) groups[label] = [];
    groups[label].push(e);
  });
  const grouped = Object.entries(groups);

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 500,
        background: "var(--bg-modal-overlay)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24,
      }}
    >
      <div style={{
        background: "var(--bg-modal)",
        border: "1px solid var(--border-card)",
        borderRadius: 16,
        boxShadow: "var(--shadow-modal)",
        width: "100%", maxWidth: 520,
        maxHeight: "80vh",
        display: "flex", flexDirection: "column",
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 20px",
          borderBottom: "1px solid var(--border-card)",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ion-icon name="time-outline" style={{ fontSize: 16, color: "#1488D8" }} aria-hidden="true" />
            <span style={{ fontFamily: font, fontWeight: 600, fontSize: 14, color: "var(--text-primary)" }}>
              Reuniões da semana
            </span>
            <span style={{
              fontFamily: font, fontSize: 11, fontWeight: 500,
              color: "var(--text-muted)", background: "var(--bg-active)",
              borderRadius: 20, padding: "2px 8px",
            }}>
              {events.length}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 28, height: 28, borderRadius: 8,
              background: "var(--bg-active)", border: "1px solid var(--border-card)",
              cursor: "pointer", color: "var(--text-secondary)",
            }}
          >
            <ion-icon name="close-outline" style={{ fontSize: 16 }} />
          </button>
        </div>

        {/* Content */}
        <div style={{ overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 20 }}>
          {grouped.length === 0 ? (
            <p style={{ fontFamily: font, fontSize: 13, color: "var(--text-muted)", textAlign: "center", margin: "24px 0" }}>
              Nenhuma reunião realizada esta semana.
            </p>
          ) : grouped.map(([label, dayEvents]) => (
            <div key={label}>
              <p style={{
                fontFamily: font, fontSize: 10, fontWeight: 700,
                color: label === "Hoje" ? "var(--mk-blue)" : "var(--text-muted)",
                textTransform: "uppercase", letterSpacing: "0.1em",
                marginBottom: 8, marginTop: 0,
              }}>
                {label}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {dayEvents.map((event) => {
                  const hasMeet = !!event.meetLink;
                  const href = event.htmlLink ?? "#";
                  return (
                    <a
                      key={event.id}
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="mk-link"
                      title="Abrir no Google Agenda"
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "8px 10px", borderRadius: 8,
                        background: "var(--bg-active)",
                        border: "1px solid transparent",
                        textDecoration: "none", transition: "opacity .15s",
                        opacity: 0.75,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                        <ion-icon
                          name={hasMeet ? "videocam" : getEventIcon(event.title)}
                          style={{ fontSize: 14, color: "var(--text-muted)" }}
                          aria-hidden="true"
                        />
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, minWidth: 72 }}>
                        <span style={{ fontFamily: font, fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
                          {event.allDay ? "Dia todo" : formatTime(event.start)}
                        </span>
                      </div>
                      <span style={{ fontFamily: font, fontSize: 13, color: "var(--text-primary)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {event.title}
                      </span>
                      <span style={{
                        fontFamily: font, fontSize: 10, fontWeight: 600,
                        color: "var(--text-muted)",
                        background: "var(--bg-card)",
                        border: "1px solid var(--border-card)",
                        borderRadius: 6, padding: "2px 6px", flexShrink: 0,
                      }}>
                        Concluída
                      </span>
                    </a>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Email Modal ──────────────────────────────────────────────────────────────

type EmailTab = "recentes" | "principal" | "atualizacoes";

function EmailModal({
  initial,
  recentMessages,
  onClose,
}: {
  initial: EmailMessage | null;
  recentMessages: EmailMessage[];
  onClose: () => void;
}) {
  const [tab, setTab] = useState<EmailTab>("recentes");
  const [tabMessages, setTabMessages] = useState<EmailMessage[]>([]);
  const [tabLoading, setTabLoading] = useState(false);

  const [selectedId, setSelectedId] = useState<string | null>(initial?.id ?? null);
  const [detail, setDetail] = useState<EmailDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);
  const [replyDone, setReplyDone] = useState(false);

  // Load category tab
  useEffect(() => {
    if (tab === "recentes") return;
    setTabLoading(true);
    const cat = tab === "principal" ? "primary" : "updates";
    fetch(`/api/google/gmail?category=${cat}`)
      .then((r) => r.json())
      .then((d) => setTabMessages(d.messages ?? []))
      .catch(() => {})
      .finally(() => setTabLoading(false));
  }, [tab]);

  // Load detail when selectedId changes
  useEffect(() => {
    if (!selectedId) { setDetail(null); return; }
    setDetailLoading(true);
    setReplyText("");
    setReplyDone(false);
    fetch(`/api/google/gmail?id=${selectedId}`)
      .then((r) => r.json())
      .then((d) => setDetail(d.message ?? null))
      .catch(() => {})
      .finally(() => setDetailLoading(false));
  }, [selectedId]);

  // Auto mark as read when detail loads
  useEffect(() => {
    if (!detail || !detail.isUnread || readIds.has(detail.id)) return;
    fetch("/api/google/gmail", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: detail.id }),
    }).then(() => setReadIds((s) => new Set([...s, detail.id])));
  }, [detail, readIds]);

  async function sendReply() {
    if (!detail || !replyText.trim()) return;
    setReplying(true);
    try {
      await fetch("/api/google/gmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: detail.from,
          subject: detail.subject,
          body: replyText,
          threadId: detail.threadId,
          inReplyTo: detail.messageId,
        }),
      });
      setReplyDone(true);
      setReplyText("");
    } finally {
      setReplying(false);
    }
  }

  // Close on Escape
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") { if (selectedId) setSelectedId(null); else onClose(); } };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [selectedId, onClose]);

  const tabs: { key: EmailTab; label: string }[] = [
    { key: "recentes", label: "Recentes" },
    { key: "principal", label: "Principal" },
    { key: "atualizacoes", label: "Atualizações" },
  ];

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 500,
        background: "var(--bg-modal-overlay)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24,
      }}
    >
      <div style={{
        background: "var(--bg-modal)",
        backdropFilter: "blur(32px) saturate(180%)",
        WebkitBackdropFilter: "blur(32px) saturate(180%)",
        border: "1px solid var(--glass-border)",
        borderRadius: 18,
        boxShadow: "var(--shadow-modal)",
        width: "100%", maxWidth: 900, maxHeight: "90vh",
        display: "flex", flexDirection: "column", overflow: "hidden",
      }}>
        {/* ── Header ── */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 24px 0",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Mail size={16} color="var(--mk-green)" />
            <span style={{ fontFamily: font, fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>
              Emails
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 28, height: 28, borderRadius: 8,
              background: "var(--bg-active)", border: "1px solid var(--border-card)",
              cursor: "pointer",
            }}
          >
            <X size={13} color="var(--text-muted)" />
          </button>
        </div>

        {/* ── Tabs ── */}
        <div style={{
          display: "flex", gap: 4, padding: "14px 24px 0",
          borderBottom: "1px solid var(--border-card)",
        }}>
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => { setTab(key); setSelectedId(null); }}
              style={{
                fontFamily: font, fontSize: 12, fontWeight: tab === key ? 700 : 500,
                color: tab === key ? "var(--mk-green)" : "var(--text-muted)",
                background: tab === key ? "rgba(0,232,122,0.10)" : "transparent",
                border: "none",
                borderBottom: tab === key ? "2px solid var(--mk-green)" : "2px solid transparent",
                borderRadius: "6px 6px 0 0",
                padding: "6px 14px 8px",
                cursor: "pointer", transition: "all .15s",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── Body ── */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

          {/* List panel */}
          <div style={{
            width: selectedId ? 300 : "100%",
            flexShrink: 0,
            borderRight: selectedId ? "1px solid var(--border-card)" : "none",
            overflowY: "auto",
            padding: "12px 16px",
            display: "flex", flexDirection: "column", gap: 6,
            transition: "width .2s ease",
          }}>
            {tabLoading ? (
              [0, 1, 2, 3, 4].map((i) => (
                <div key={i} style={{ height: 64, borderRadius: 8, background: "var(--bg-active)", animation: "sk-pulse 1.5s ease-in-out infinite" }} />
              ))
            ) : (() => {
              const msgs = tab === "recentes" ? recentMessages : tabMessages;
              if (msgs.length === 0) {
                return (
                  <p style={{ fontFamily: font, fontSize: 12, color: "var(--text-muted)", padding: "20px 4px" }}>
                    Nenhum email nesta aba.
                  </p>
                );
              }
              return msgs.map((msg) => (
                <EmailListItem
                  key={msg.id}
                  msg={msg}
                  isRead={readIds.has(msg.id)}
                  onClick={() => setSelectedId(msg.id)}
                />
              ));
            })()}
          </div>

          {/* Detail panel */}
          {selectedId && (
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
              {/* Back */}
              <button
                onClick={() => setSelectedId(null)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  fontFamily: font, fontSize: 11, color: "var(--text-muted)",
                  background: "none", border: "none", cursor: "pointer", padding: 0, alignSelf: "flex-start",
                }}
              >
                ← Voltar
              </button>

              {detailLoading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[0, 1, 2, 3].map((i) => <div key={i} style={{ height: 20, borderRadius: 6, background: "var(--bg-active)", animation: "sk-pulse 1.5s ease-in-out infinite" }} />)}
                </div>
              ) : detail ? (
                <>
                  {/* Subject */}
                  <h2 style={{ fontFamily: font, fontSize: 15, fontWeight: 700, color: "var(--text-primary)", margin: 0, lineHeight: 1.4 }}>
                    {detail.subject}
                  </h2>

                  {/* Meta */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                    <span style={{
                      fontFamily: font, fontSize: 11, fontWeight: 700, color: "var(--mk-green)",
                      background: "rgba(0,232,122,0.10)", borderRadius: 6, padding: "3px 8px",
                    }}>
                      {parseFrom(detail.from)}
                    </span>
                    <span style={{ fontFamily: font, fontSize: 11, color: "var(--text-muted)" }}>
                      → {detail.to || "você"}
                    </span>
                    <span style={{ fontFamily: font, fontSize: 10, color: "var(--text-muted)", marginLeft: "auto" }}>
                      {new Date(detail.date).toLocaleString("pt-BR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {(detail.isUnread && !readIds.has(detail.id)) ? (
                      <span style={{ fontFamily: font, fontSize: 10, color: "var(--mk-blue)", background: "rgba(20,136,216,0.12)", borderRadius: 6, padding: "2px 6px" }}>
                        Não lido
                      </span>
                    ) : (
                      <span style={{ display: "flex", alignItems: "center", gap: 3, fontFamily: font, fontSize: 10, color: "var(--mk-green)" }}>
                        <CheckCheck size={11} /> Lido
                      </span>
                    )}
                  </div>

                  {/* Body */}
                  <div style={{
                    flex: 1, borderRadius: 10, overflow: "hidden",
                    border: "1px solid var(--border-card)",
                    background: "var(--bg-active)",
                  }}>
                    {detail.bodyHtml ? (
                      <iframe
                        srcDoc={detail.bodyHtml}
                        sandbox="allow-same-origin"
                        style={{ width: "100%", minHeight: 300, border: "none", display: "block", borderRadius: 10 }}
                        title="Email body"
                      />
                    ) : (
                      <pre style={{
                        fontFamily: "'JetBrains Mono', monospace", fontSize: 12,
                        color: "var(--text-secondary)", padding: 16, margin: 0,
                        whiteSpace: "pre-wrap", lineHeight: 1.6,
                      }}>
                        {detail.body || "(sem conteúdo)"}
                      </pre>
                    )}
                  </div>

                  {/* Reply */}
                  <div style={{
                    border: "1px solid var(--border-card)", borderRadius: 10,
                    overflow: "hidden", background: "var(--bg-active)",
                  }}>
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Escreva sua resposta..."
                      rows={3}
                      style={{
                        width: "100%", padding: "12px 14px",
                        fontFamily: font, fontSize: 12, color: "var(--text-primary)",
                        background: "transparent", border: "none", outline: "none",
                        resize: "vertical", boxSizing: "border-box",
                      }}
                    />
                    <div style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "8px 12px", borderTop: "1px solid var(--border-card)",
                    }}>
                      {replyDone ? (
                        <span style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: font, fontSize: 11, color: "var(--mk-green)" }}>
                          <CheckCheck size={12} /> Resposta enviada!
                        </span>
                      ) : (
                        <span style={{ fontFamily: font, fontSize: 11, color: "var(--text-muted)" }}>
                          Responder para {parseFrom(detail.from)}
                        </span>
                      )}
                      <button
                        onClick={sendReply}
                        disabled={!replyText.trim() || replying}
                        style={{
                          display: "flex", alignItems: "center", gap: 5,
                          fontFamily: font, fontSize: 11, fontWeight: 600,
                          color: "#fff",
                          background: replyText.trim() ? "var(--mk-green)" : "var(--bg-card)",
                          border: "none", borderRadius: 7, padding: "6px 12px",
                          cursor: replyText.trim() ? "pointer" : "not-allowed",
                          opacity: replying ? 0.6 : 1,
                          transition: "all .15s",
                        }}
                      >
                        {replying ? <RefreshCw size={11} style={{ animation: "spin .7s linear infinite" }} /> : <Reply size={11} />}
                        {replying ? "Enviando..." : "Responder"}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <p style={{ fontFamily: font, fontSize: 12, color: "var(--text-muted)" }}>Erro ao carregar email.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Email List Item ──────────────────────────────────────────────────────────

function EmailListItem({
  msg,
  isRead,
  onClick,
}: {
  msg: EmailMessage;
  isRead: boolean;
  onClick: () => void;
}) {
  const unread = msg.isUnread && !isRead;
  return (
    <button
      onClick={onClick}
      style={{
        display: "block", width: "100%", textAlign: "left",
        padding: "9px 12px 9px 14px", borderRadius: 8,
        background: "var(--bg-active)",
        border: "1px solid var(--border-card)",
        borderLeft: unread ? "3px solid var(--mk-green)" : "1px solid var(--border-card)",
        cursor: "pointer", transition: "opacity .15s",
      }}
      className="mk-link"
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 3 }}>
        <span style={{
          fontFamily: font, fontSize: 12,
          fontWeight: unread ? 700 : 500,
          color: "var(--text-primary)",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "65%",
        }}>
          {parseFrom(msg.from)}
        </span>
        <span style={{ fontFamily: font, fontSize: 10, color: "var(--text-muted)", flexShrink: 0, marginLeft: 6 }}>
          {timeAgo(msg.date)}
        </span>
      </div>
      <p style={{ fontFamily: font, fontSize: 12, fontWeight: unread ? 600 : 400, color: unread ? "var(--text-primary)" : "var(--text-secondary)", margin: "0 0 2px 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {msg.subject}
      </p>
      <p style={{ fontFamily: font, fontSize: 11, color: "var(--text-muted)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {msg.snippet}
      </p>
    </button>
  );
}

// ─── Notification Center ──────────────────────────────────────────────────────

function NotificationCenter({
  notifications, onMarkAllRead, onDismiss,
}: {
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
  onDismiss: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const unread = notifications.filter((n) => !n.read).length;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => { setOpen((v) => !v); if (!open && unread > 0) onMarkAllRead(); }}
        style={{
          position: "relative", display: "flex", alignItems: "center", justifyContent: "center",
          width: 34, height: 34, borderRadius: 10,
          background: open ? "var(--bg-active)" : "transparent",
          border: "1px solid", borderColor: open ? "var(--border-card)" : "transparent",
          cursor: "pointer", transition: "all .15s",
        }}
      >
        <Bell size={15} color={unread > 0 ? "var(--mk-purple)" : "var(--text-muted)"} />
        {unread > 0 && (
          <span style={{
            position: "absolute", top: 4, right: 4,
            width: 8, height: 8, borderRadius: "50%",
            background: "var(--mk-magenta)", boxShadow: "0 0 6px var(--mk-magenta)",
            display: "block",
          }} />
        )}
      </button>

      {open && (
        <div style={{
          position: "absolute", top: 40, right: 0, zIndex: 200,
          width: 340, maxHeight: 480,
          background: "var(--bg-card)", border: "1px solid var(--border-card)",
          borderRadius: 14, boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          display: "flex", flexDirection: "column", overflow: "hidden",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px 10px", borderBottom: "1px solid var(--border)" }}>
            <span style={{ fontFamily: font, fontWeight: 700, fontSize: 13, color: "var(--text-primary)" }}>Notificações</span>
            {notifications.length > 0 && (
              <button
                onClick={() => notifications.forEach((n) => onDismiss(n.id))}
                style={{ fontFamily: font, fontSize: 11, color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer", padding: "2px 6px", borderRadius: 6 }}
              >
                Limpar tudo
              </button>
            )}
          </div>
          <div style={{ overflowY: "auto", flex: 1 }}>
            {notifications.length === 0 ? (
              <div style={{ padding: "28px 16px", textAlign: "center" }}>
                <Bell size={24} color="var(--text-muted)" style={{ margin: "0 auto 8px", display: "block" }} />
                <p style={{ fontFamily: font, fontSize: 12, color: "var(--text-muted)", margin: 0 }}>Nenhuma notificação</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  style={{
                    display: "flex", gap: 10, padding: "10px 14px",
                    borderBottom: "1px solid var(--border)",
                    background: n.read ? "transparent" : `${notifTypeColor[n.type]}08`,
                  }}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                    background: `${notifTypeColor[n.type]}18`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <ion-icon
                      name={notifTypeIcon[n.type]}
                      style={{ fontSize: 14, color: notifTypeColor[n.type] }}
                      aria-hidden="true"
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 2 }}>
                      {n.href ? (
                        <a href={n.href} target="_blank" rel="noreferrer" style={{ fontFamily: font, fontSize: 12, fontWeight: 600, color: "var(--text-primary)", textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "80%" }}>
                          {n.title}
                        </a>
                      ) : (
                        <span style={{ fontFamily: font, fontSize: 12, fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {n.title}
                        </span>
                      )}
                      <span style={{ fontFamily: font, fontSize: 10, color: "var(--text-muted)", flexShrink: 0, marginLeft: 6 }}>
                        {timeAgo(new Date(n.timestamp).toISOString())}
                      </span>
                    </div>
                    <p style={{ fontFamily: font, fontSize: 11, color: "var(--text-muted)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {n.body}
                    </p>
                  </div>
                  <button
                    onClick={() => onDismiss(n.id)}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 2, flexShrink: 0, opacity: 0.5, display: "flex", alignItems: "flex-start" }}
                  >
                    <X size={11} color="var(--text-muted)" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showTasksModal, setShowTasksModal] = useState(false);
  const [showPastMeetingsModal, setShowPastMeetingsModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<CalendarEvent | null>(null);
  const [importantEventIds, setImportantEventIds] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try { return new Set(JSON.parse(localStorage.getItem("mk-important-events") ?? "[]")); } catch { return new Set(); }
  });
  const [archivedEventIds, setArchivedEventIds] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try { return new Set(JSON.parse(localStorage.getItem("mk-archived-events") ?? "[]")); } catch { return new Set(); }
  });
  const [taskSort, setTaskSort] = useState<SortKey>("priority");
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailModalInitial, setEmailModalInitial] = useState<EmailMessage | null>(null);
  const [readEmailIds, setReadEmailIds] = useState<Set<string>>(new Set());

  function toggleImportant(id: string) {
    setImportantEventIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      localStorage.setItem("mk-important-events", JSON.stringify([...next]));
      return next;
    });
  }

  function archiveEvent(id: string) {
    setArchivedEventIds((prev) => {
      const next = new Set([...prev, id]);
      localStorage.setItem("mk-archived-events", JSON.stringify([...next]));
      return next;
    });
  }

  const [rsvpOverrides, setRsvpOverrides] = useState<Record<string, "accepted" | "declined" | "tentative">>({});

  // ── Linear task state ──
  const [linearStates, setLinearStates] = useState<WorkflowState[]>([]);
  const [statesLoaded, setStatesLoaded] = useState(false);
  const [issueOverrides, setIssueOverrides] = useState<Record<string, Partial<LinearIssue>>>({});
  const [doneIssueIds, setDoneIssueIds] = useState<Set<string>>(new Set());
  const [issueOrder, setIssueOrder] = useState<string[]>([]);
  const [dashDragId, setDashDragId] = useState<string | null>(null);
  const [dashDragOverId, setDashDragOverId] = useState<string | null>(null);
  const [updatingIssueId, setUpdatingIssueId] = useState<string | null>(null);
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [issueModalDetail, setIssueModalDetail] = useState<IssueDetail | null>(null);
  const [issueModalLoading, setIssueModalLoading] = useState(false);

  useEffect(() => {
    fetch("/api/linear")
      .then((r) => r.json())
      .then((d) => { if (d.states) { setLinearStates(d.states); setStatesLoaded(true); } })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleIssueStatusChange(issueId: string, newState: WorkflowState) {
    const prev = issueOverrides[issueId];
    setIssueOverrides((o) => ({
      ...o,
      [issueId]: { stateId: newState.id, stateName: newState.name, stateColor: newState.color, stateType: newState.type },
    }));
    setUpdatingIssueId(issueId);
    try {
      const res = await fetch("/api/linear", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issueId, stateId: newState.id }),
      });
      if (!res.ok) throw new Error();
      if (newState.type === "completed" || newState.type === "cancelled") {
        setDoneIssueIds((s) => new Set([...s, issueId]));
      } else {
        setDoneIssueIds((s) => { const n = new Set(s); n.delete(issueId); return n; });
      }
    } catch {
      setIssueOverrides((o) => {
        const n = { ...o };
        if (prev) n[issueId] = prev; else delete n[issueId];
        return n;
      });
    } finally {
      setUpdatingIssueId(null);
    }
  }

  async function handleMarkDone(issue: LinearIssue) {
    if (!statesLoaded || linearStates.length === 0) {
      setDoneIssueIds((s) => new Set([...s, issue.id]));
      return;
    }
    // Filtra estados pelo time do issue para evitar stateId de outro time
    const teamStates = issue.teamId
      ? linearStates.filter((s) => s.teamId === issue.teamId)
      : linearStates;
    const doneState = teamStates.find((s) => s.type === "completed") ?? linearStates.find((s) => s.type === "completed");
    if (!doneState) { setDoneIssueIds((s) => new Set([...s, issue.id])); return; }
    await handleIssueStatusChange(issue.id, doneState);
  }

  async function openIssueModal(issueId: string) {
    setIssueModalOpen(true);
    setIssueModalDetail(null);
    setIssueModalLoading(true);
    try {
      const res = await fetch(`/api/linear?issueId=${issueId}`);
      const d = await res.json();
      setIssueModalDetail(d);
    } finally {
      setIssueModalLoading(false);
    }
  }

  function handleDashDrop(targetId: string, allActive: LinearIssue[]) {
    if (!dashDragId || dashDragId === targetId) { setDashDragId(null); setDashDragOverId(null); return; }
    const current = issueOrder.length > 0 ? issueOrder : allActive.map((i) => i.id);
    const from = current.indexOf(dashDragId);
    const to = current.indexOf(targetId);
    if (from < 0 || to < 0) { setDashDragId(null); setDashDragOverId(null); return; }
    const next = [...current];
    next.splice(from, 1);
    next.splice(to, 0, dashDragId);
    setIssueOrder(next);
    setDashDragId(null);
    setDashDragOverId(null);
  }

  function quickRsvp(eventId: string, status: "accepted" | "declined" | "tentative") {
    setRsvpOverrides((prev) => ({ ...prev, [eventId]: status }));
    fetch("/api/google/calendar", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId, status }),
    }).then((res) => {
      if (!res.ok) throw new Error(`Erro ${res.status}`);
    }).catch(() => {
      setRsvpOverrides((prev) => { const next = { ...prev }; delete next[eventId]; return next; });
    });
  }

  const seenMentionTs = useRef<Set<string>>(new Set());
  const seenLinearIds = useRef<Set<string>>(new Set());
  const seenEmailIds  = useRef<Set<string>>(new Set());
  const seenEventIds  = useRef<Set<string>>(new Set());
  const isFirstFetch  = useRef(true);
  const prevCounts    = useRef<PrevCounts | null>(null);

  const fireNotification = (title: string, body: string) => {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body, icon: "/favicon.ico" });
    }
  };

  const addNotification = useCallback((item: Omit<NotificationItem, "id" | "timestamp" | "read">) => {
    const newItem: NotificationItem = {
      ...item,
      id: `${item.type}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      timestamp: Date.now(),
      read: false,
    };
    setNotifications((prev) => [newItem, ...prev].slice(0, 50));
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard");
      if (!res.ok) return;
      const fresh: DashboardData = await res.json();

      if (!isFirstFetch.current) {
        fresh.mentions.forEach((m) => {
          if (!seenMentionTs.current.has(m.ts)) {
            fireNotification(`💬 Nova menção — #${m.channelName}`, slackText(m.text, 100));
            addNotification({ type: "mention", title: `#${m.channelName}`, body: slackText(m.text, 100), href: m.permalink });
          }
        });
        fresh.linearIssues.forEach((i) => {
          if (!seenLinearIds.current.has(i.id)) {
            fireNotification(`✅ Nova task — ${i.identifier}`, i.title);
            addNotification({ type: "linear", title: `${i.identifier} — ${i.stateName}`, body: i.title, href: i.url });
          }
        });
        fresh.gmailMessages.forEach((m) => {
          if (!seenEmailIds.current.has(m.id)) {
            fireNotification(`📧 Email — ${parseFrom(m.from)}`, m.subject);
            addNotification({ type: "email", title: parseFrom(m.from), body: m.subject });
          }
        });
        fresh.calendarEvents.forEach((e) => {
          if (!seenEventIds.current.has(e.id)) {
            const eventDate = new Date(e.start).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
            fireNotification(`📅 Novo evento — ${eventDate}`, e.title);
            addNotification({ type: "calendar", title: e.title, body: e.allDay ? "Dia todo" : `${formatTime(e.start)} · ${eventDate}`, href: e.htmlLink ?? undefined });
          }
        });
      }

      seenMentionTs.current = new Set(fresh.mentions.map((m) => m.ts));
      seenLinearIds.current = new Set(fresh.linearIssues.map((i) => i.id));
      seenEmailIds.current  = new Set(fresh.gmailMessages.map((m) => m.id));
      seenEventIds.current  = new Set(fresh.calendarEvents.map((e) => e.id));
      isFirstFetch.current  = false;

      setData(fresh);
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  const handleRefresh = useCallback(async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      await fetchData();
    } finally {
      setRefreshing(false);
    }
  }, [refreshing, fetchData]);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      Notification.requestPermission();
    }
    fetchData();
    const id = setInterval(fetchData, 3_600_000);
    return () => clearInterval(id);
  }, [fetchData]);

  // ── Derived ──
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const eventsToday = (data?.calendarEvents ?? []).filter((e) => {
    const d = new Date(e.start); d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  });
  const allIssues = (data?.linearIssues ?? []).map((i) => {
    const ov = issueOverrides[i.id];
    return ov ? { ...i, ...ov } : i;
  });
  const activeIssues = allIssues.filter((i) => !doneIssueIds.has(i.id) && i.stateType !== "completed" && i.stateType !== "cancelled");
  const doneIssues   = allIssues.filter((i) => doneIssueIds.has(i.id) || i.stateType === "completed" || i.stateType === "cancelled");
  const inProgress = activeIssues.filter((i) => i.stateType === "started");
  const todo       = activeIssues.filter((i) => i.stateType === "unstarted" || i.stateType === "backlog" || i.stateType === "triage");

  function applyOrder(issues: LinearIssue[]): LinearIssue[] {
    if (issueOrder.length === 0) return issues;
    const map = new Map(issueOrder.map((id, idx) => [id, idx]));
    return [...issues].sort((a, b) => {
      const ai = map.has(a.id) ? map.get(a.id)! : Number.MAX_SAFE_INTEGER;
      const bi = map.has(b.id) ? map.get(b.id)! : Number.MAX_SAFE_INTEGER;
      return ai - bi;
    });
  }

  const nowMs = new Date().getTime();
  const allCalendarEvents = (data?.calendarEvents ?? []).filter((e) => !archivedEventIds.has(e.id));
  const upcomingEvents = allCalendarEvents.filter((e) => {
    if (e.allDay) {
      const d = new Date(e.start); d.setHours(0, 0, 0, 0);
      const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
      return d.getTime() >= todayStart.getTime();
    }
    return new Date(e.end ?? e.start).getTime() > nowMs;
  });
  const pastWeekEvents = allCalendarEvents.filter((e) => {
    if (e.allDay) return false;
    return new Date(e.end ?? e.start).getTime() <= nowMs;
  });
  const groupedEvents = groupByDay(upcomingEvents);

  // Split into this week vs next week
  const endOfThisWeek = new Date(today);
  const dayOfToday = today.getDay();
  const daysToSunday = dayOfToday === 0 ? 0 : 7 - dayOfToday;
  endOfThisWeek.setDate(today.getDate() + daysToSunday);
  endOfThisWeek.setHours(23, 59, 59, 999);
  const thisWeekGroups = groupedEvents.filter((g) => new Date(g.events[0].start).getTime() <= endOfThisWeek.getTime());
  const nextWeekGroups = groupedEvents.filter((g) => new Date(g.events[0].start).getTime() > endOfThisWeek.getTime());

  // ── Delta tracking ──
  const currentCounts: PrevCounts = {
    tasks: inProgress.length,
    mentions: data?.mentions.length ?? 0,
    events: eventsToday.length,
    emails: data?.gmailMessages.length ?? 0,
  };

  const deltas: PrevCounts = prevCounts.current
    ? {
        tasks:    currentCounts.tasks    - prevCounts.current.tasks,
        mentions: currentCounts.mentions - prevCounts.current.mentions,
        events:   currentCounts.events   - prevCounts.current.events,
        emails:   currentCounts.emails   - prevCounts.current.emails,
      }
    : { tasks: 0, mentions: 0, events: 0, emails: 0 };

  useEffect(() => {
    if (!loading && data) {
      prevCounts.current = currentCounts;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, data?.mentions.length, inProgress.length, eventsToday.length, data?.gmailMessages.length]);

  // ── Stats ──
  const stats = [
    { label: "Emails não lidos",   value: loading ? "—" : String(data?.gmailMessages.length ?? 0), icon: Mail,          color: "var(--mk-green)",   bg: "rgba(0,232,122,0.12)",   delta: deltas.emails   },
    { label: "Menções no Slack",   value: loading ? "—" : String(data?.mentions.length ?? 0),       icon: MessageSquare, color: "var(--mk-blue)",    bg: "rgba(20,136,216,0.12)",  delta: deltas.mentions },
    { label: "Eventos hoje",       value: loading ? "—" : String(eventsToday.length),               icon: Calendar,      color: "var(--mk-magenta)", bg: "rgba(229,19,142,0.12)",  delta: deltas.events   },
    { label: "Tasks em andamento", value: loading ? "—" : String(inProgress.length),                icon: CheckSquare,   color: "var(--mk-purple)",  bg: "rgba(123,47,222,0.12)",  delta: deltas.tasks    },
  ];

  // ── Sorted task list (inline preview) ──
  const sortedInProgress = applyOrder(sortIssues(inProgress, taskSort));
  const sortedTodo       = applyOrder(sortIssues(todo, taskSort));

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden", background: "var(--bg-app)" }}>
      <Header title="Dashboard" subtitle="Visão geral do seu dia" />

      {/* Status bar */}
      <div style={{ padding: "4px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {lastUpdated && (
            <>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--mk-green)", boxShadow: "0 0 6px var(--mk-green-glow)", display: "inline-block", animation: "sk-pulse 2s ease-in-out infinite" }} />
              <span style={{ fontFamily: font, fontSize: 11, color: "var(--text-muted)" }}>
                {refreshing ? "Atualizando..." : `Atualizado às ${lastUpdated.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`}
              </span>
            </>
          )}
          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            title="Atualizar agora"
            style={{
              display: "flex", alignItems: "center", gap: 5,
              fontFamily: font, fontSize: 11, fontWeight: 600,
              color: refreshing ? "var(--text-muted)" : "var(--text-secondary)",
              background: "var(--bg-active)",
              border: "1px solid var(--border-card)",
              borderRadius: 7, padding: "4px 9px",
              cursor: refreshing || loading ? "not-allowed" : "pointer",
              opacity: refreshing || loading ? 0.6 : 1,
              transition: "all .15s",
            }}
          >
            <ion-icon
              name="refresh-outline"
              style={{
                fontSize: 13,
                display: "block",
                animation: refreshing ? "spin 0.7s linear infinite" : "none",
              }}
              aria-hidden="true"
            />
            Atualizar
          </button>
        </div>
        <NotificationCenter
          notifications={notifications}
          onMarkAllRead={() => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))}
          onDismiss={(id) => setNotifications((prev) => prev.filter((n) => n.id !== id))}
        />
      </div>

      <style>{`
        @keyframes sk-pulse { 0%,100%{opacity:1} 50%{opacity:.35} }
        @keyframes spin { to { transform: rotate(360deg); } }
        .mk-row-hover:hover { background: var(--bg-card-hover) !important; }
        .mk-link:hover { opacity: .75; }
        .mk-qbtn { transition: background .12s, transform .1s; }
        .mk-qbtn:hover { transform: scale(1.18); }
        .mk-qbtn.accept:hover { background: var(--mk-green-subtle) !important; }
        .mk-qbtn.decline:hover { background: rgba(239,68,68,0.15) !important; }
        .mk-qbtn.fav:hover    { background: rgba(245,158,11,0.15) !important; }
      `}</style>

      <div style={{ flex: 1, overflowY: "auto", padding: "12px 28px 24px", display: "flex", flexDirection: "column", gap: 14 }}>

        {/* ── Google reconnect banner ── */}
        {!loading && (data?.errors?.google_calendar || data?.errors?.google_gmail || !data?.authenticated) && (
          <div style={{ background: "rgba(20,136,216,0.08)", border: "1px solid rgba(20,136,216,0.22)", borderRadius: 10, padding: "12px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <p style={{ fontFamily: font, fontSize: 13, color: "var(--text-secondary)", margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
              {data?.errors?.google_calendar || data?.errors?.google_gmail ? (
                <><ion-icon name="refresh-outline" style={{ fontSize: 15, flexShrink: 0 }} aria-hidden="true" /> Sessão Google expirada — reconecte para ver agenda e emails</>
              ) : (
                <><ion-icon name="calendar-outline" style={{ fontSize: 15, flexShrink: 0 }} aria-hidden="true" /> Conecte sua conta Google para ver agenda e emails</>
              )}
            </p>
            <a href="/login" style={{ fontFamily: font, fontWeight: 600, fontSize: 12, color: "#fff", background: "var(--mk-blue)", padding: "6px 14px", borderRadius: 8, textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0 }}>
              {data?.errors?.google_calendar || data?.errors?.google_gmail ? "Reconectar Google" : "Entrar com Google"}
            </a>
          </div>
        )}

        {/* ── Non-Google errors ── */}
        {!loading && data?.errors && Object.keys(data.errors).some((k) => !k.startsWith("google")) && (
          <div style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.18)", borderRadius: 10, padding: "10px 16px" }}>
            <p style={{ fontFamily: font, fontWeight: 700, fontSize: 11, color: "#ef4444", margin: "0 0 6px 0", display: "flex", alignItems: "center", gap: 5 }}>
              <ion-icon name="warning-outline" style={{ fontSize: 13 }} aria-hidden="true" /> Erros de integração:
            </p>
            {Object.entries(data.errors).filter(([k]) => !k.startsWith("google")).map(([key, msg]) => (
              <p key={key} style={{ fontFamily: "monospace", fontSize: 10, color: "var(--text-secondary)", margin: "1px 0" }}>
                <span style={{ color: "#ef4444", fontWeight: 700 }}>{key}:</span> {msg}
              </p>
            ))}
          </div>
        )}

        {/* ── Row 1: Stats ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
          {stats.map(({ label, value, icon: Icon, color, bg, delta }) => (
            <Card key={label} style={{ padding: "16px 18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={14} color={color} />
                </div>
                <span style={{ fontFamily: font, fontSize: 12, fontWeight: 500, color: "var(--text-secondary)" }}>{label}</span>
              </div>
              {loading
                ? <Skeleton height={34} style={{ width: 64 }} />
                : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <p style={{ fontFamily: font, fontWeight: 700, fontSize: 34, color: "var(--text-primary)", margin: 0, lineHeight: 1, letterSpacing: "-1.5px" }}>
                      {value}
                    </p>
                    <DeltaBadge delta={delta} />
                  </div>
                )
              }
            </Card>
          ))}
        </div>

        {/* ── Row 2: Agenda + Tasks ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 14 }}>

          {/* Agenda da Semana */}
          <Card>
            <SectionHeader
              icon="calendar-outline"
              title="Agenda da semana"
              count={upcomingEvents.length}
              color="#1488D8"
              action={pastWeekEvents.length > 0 ? (
                <button
                  onClick={() => setShowPastMeetingsModal(true)}
                  style={{
                    display: "flex", alignItems: "center", gap: 4,
                    fontFamily: font, fontSize: 11, fontWeight: 600,
                    color: "#1488D8",
                    background: "rgba(20,136,216,0.12)",
                    border: "1px solid rgba(20,136,216,0.25)",
                    borderRadius: 7, padding: "4px 9px",
                    cursor: "pointer", transition: "all .15s",
                  }}
                >
                  <ion-icon name="time-outline" style={{ fontSize: 12 }} />
                  {pastWeekEvents.length} realizadas
                </button>
              ) : undefined}
            />
            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[0, 1, 2].map((i) => <Skeleton key={i} height={48} />)}
              </div>
            ) : !data?.authenticated ? (
              <EmptyState text="⚠️ Faça login com Google para ver sua agenda." />
            ) : groupedEvents.length === 0 ? (
              <EmptyState text="Nenhum evento esta semana." />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

                {/* — Esta semana — */}
                {thisWeekGroups.length > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontFamily: font, fontSize: 10, fontWeight: 700, color: "var(--mk-blue)", textTransform: "uppercase", letterSpacing: "0.12em", whiteSpace: "nowrap" }}>
                      Esta semana
                    </span>
                    <div style={{ flex: 1, height: 1, background: "rgba(20,136,216,0.2)" }} />
                  </div>
                )}
                {thisWeekGroups.map(({ label, events }) => (
                  <div key={`tw-${label}`}>
                    <p style={{
                      fontFamily: font, fontSize: 10, fontWeight: 700,
                      color: label === "Hoje" ? "var(--mk-blue)" : "var(--text-muted)",
                      textTransform: "uppercase", letterSpacing: "0.1em",
                      marginBottom: 8, marginTop: 0,
                    }}>
                      {label}
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      {events.map((event) => {
                        const hasMeet = !!event.meetLink;
                        const isImportant = importantEventIds.has(event.id);
                        const effectiveStatus = rsvpOverrides[event.id] ?? event.selfStatus;
                        const hasRsvp = event.attendeeCount > 0;
                        return (
                          <div
                            key={event.id}
                            style={{
                              display: "flex", alignItems: "center",
                              borderRadius: 8,
                              background: "var(--bg-active)",
                              border: `1px solid ${isImportant ? "rgba(245,158,11,0.4)" : "transparent"}`,
                              overflow: "hidden",
                            }}
                          >
                            {/* Área clicável — abre modal */}
                            <div
                              onClick={() => setSelectedMeeting({ ...event, selfStatus: effectiveStatus })}
                              className="mk-link"
                              style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0, padding: "8px 8px 8px 10px", cursor: "pointer" }}
                            >
                              <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                                {isImportant
                                  ? <ion-icon name="star" style={{ fontSize: 13, color: "#f59e0b" }} />
                                  : hasMeet
                                    ? <ion-icon name="videocam" style={{ fontSize: 14, color: "var(--mk-green-text)" }} />
                                    : <ion-icon name={getEventIcon(event.title)} style={{ fontSize: 14, color: "var(--text-muted)" }} />
                                }
                              </div>
                              <span style={{ fontFamily: font, fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", whiteSpace: "nowrap", minWidth: 40 }}>
                                {event.allDay ? "Dia todo" : formatTime(event.start)}
                              </span>
                              <span style={{ fontFamily: font, fontSize: 13, color: "var(--text-primary)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {event.title}
                              </span>
                            </div>

                            {/* Ações rápidas */}
                            <div style={{ display: "flex", alignItems: "center", gap: 2, padding: "0 8px", flexShrink: 0 }}>
                              {hasRsvp && (
                                <>
                                  <button
                                    onClick={() => quickRsvp(event.id, "accepted")}
                                    title="Aceitar"
                                    className="mk-qbtn accept"
                                    style={{
                                      width: 26, height: 26, borderRadius: 6, border: "none",
                                      display: "flex", alignItems: "center", justifyContent: "center",
                                      background: effectiveStatus === "accepted" ? "var(--mk-green-subtle)" : "transparent",
                                      cursor: "pointer",
                                    }}
                                  >
                                    <ion-icon name="checkmark-outline" style={{ fontSize: 14, color: effectiveStatus === "accepted" ? "var(--mk-green-text)" : "var(--text-muted)" }} />
                                  </button>
                                  <button
                                    onClick={() => quickRsvp(event.id, "declined")}
                                    title="Recusar"
                                    className="mk-qbtn decline"
                                    style={{
                                      width: 26, height: 26, borderRadius: 6, border: "none",
                                      display: "flex", alignItems: "center", justifyContent: "center",
                                      background: effectiveStatus === "declined" ? "rgba(239,68,68,0.12)" : "transparent",
                                      cursor: "pointer",
                                    }}
                                  >
                                    <ion-icon name="close-outline" style={{ fontSize: 14, color: effectiveStatus === "declined" ? "#ef4444" : "var(--text-muted)" }} />
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => toggleImportant(event.id)}
                                title={isImportant ? "Remover dos favoritos" : "Favoritar"}
                                className="mk-qbtn fav"
                                style={{
                                  width: 26, height: 26, borderRadius: 6, border: "none",
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  background: isImportant ? "rgba(245,158,11,0.12)" : "transparent",
                                  cursor: "pointer",
                                }}
                              >
                                <ion-icon name={isImportant ? "star" : "star-outline"} style={{ fontSize: 13, color: isImportant ? "#f59e0b" : "var(--text-muted)" }} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* — Próxima semana — */}
                {nextWeekGroups.length > 0 && (
                  <>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontFamily: font, fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.12em", whiteSpace: "nowrap" }}>
                        Próxima semana
                      </span>
                      <div style={{ flex: 1, height: 1, background: "var(--border-card)" }} />
                    </div>
                    {nextWeekGroups.map(({ label, events }) => (
                      <div key={`nw-${label}`}>
                        <p style={{
                          fontFamily: font, fontSize: 10, fontWeight: 700,
                          color: "var(--text-muted)",
                          textTransform: "uppercase", letterSpacing: "0.1em",
                          marginBottom: 8, marginTop: 0,
                        }}>
                          {label}
                        </p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                          {events.map((event) => {
                            const hasMeet = !!event.meetLink;
                            const isImportant = importantEventIds.has(event.id);
                            const effectiveStatus = rsvpOverrides[event.id] ?? event.selfStatus;
                            const hasRsvp = event.attendeeCount > 0;
                            return (
                              <div
                                key={event.id}
                                style={{
                                  display: "flex", alignItems: "center",
                                  borderRadius: 8, opacity: 0.85,
                                  background: "var(--bg-active)",
                                  border: `1px solid ${isImportant ? "rgba(245,158,11,0.4)" : "transparent"}`,
                                  overflow: "hidden",
                                }}
                              >
                                <div
                                  onClick={() => setSelectedMeeting({ ...event, selfStatus: effectiveStatus })}
                                  className="mk-link"
                                  style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0, padding: "8px 8px 8px 10px", cursor: "pointer" }}
                                >
                                  <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                                    {isImportant
                                      ? <ion-icon name="star" style={{ fontSize: 13, color: "#f59e0b" }} />
                                      : hasMeet
                                        ? <ion-icon name="videocam" style={{ fontSize: 14, color: "var(--mk-green-text)" }} />
                                        : <ion-icon name={getEventIcon(event.title)} style={{ fontSize: 14, color: "var(--text-muted)" }} />
                                    }
                                  </div>
                                  <span style={{ fontFamily: font, fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", whiteSpace: "nowrap", minWidth: 40 }}>
                                    {event.allDay ? "Dia todo" : formatTime(event.start)}
                                  </span>
                                  <span style={{ fontFamily: font, fontSize: 13, color: "var(--text-primary)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {event.title}
                                  </span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 2, padding: "0 8px", flexShrink: 0 }}>
                                  {hasRsvp && (
                                    <>
                                      <button
                                        onClick={() => quickRsvp(event.id, "accepted")}
                                        title="Aceitar"
                                        className="mk-qbtn accept"
                                        style={{ width: 26, height: 26, borderRadius: 6, border: "none", display: "flex", alignItems: "center", justifyContent: "center", background: effectiveStatus === "accepted" ? "var(--mk-green-subtle)" : "transparent", cursor: "pointer" }}
                                      >
                                        <ion-icon name="checkmark-outline" style={{ fontSize: 14, color: effectiveStatus === "accepted" ? "var(--mk-green-text)" : "var(--text-muted)" }} />
                                      </button>
                                      <button
                                        onClick={() => quickRsvp(event.id, "declined")}
                                        title="Recusar"
                                        className="mk-qbtn decline"
                                        style={{ width: 26, height: 26, borderRadius: 6, border: "none", display: "flex", alignItems: "center", justifyContent: "center", background: effectiveStatus === "declined" ? "rgba(239,68,68,0.12)" : "transparent", cursor: "pointer" }}
                                      >
                                        <ion-icon name="close-outline" style={{ fontSize: 14, color: effectiveStatus === "declined" ? "#ef4444" : "var(--text-muted)" }} />
                                      </button>
                                    </>
                                  )}
                                  <button
                                    onClick={() => toggleImportant(event.id)}
                                    title={isImportant ? "Remover dos favoritos" : "Favoritar"}
                                    className="mk-qbtn fav"
                                    style={{ width: 26, height: 26, borderRadius: 6, border: "none", display: "flex", alignItems: "center", justifyContent: "center", background: isImportant ? "rgba(245,158,11,0.12)" : "transparent", cursor: "pointer" }}
                                  >
                                    <ion-icon name={isImportant ? "star" : "star-outline"} style={{ fontSize: 13, color: isImportant ? "#f59e0b" : "var(--text-muted)" }} />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </>
                )}

              </div>
            )}
          </Card>

          {/* Tasks — inline mini-view */}
          <Card>
            <SectionHeader
              icon="checkmark-circle-outline"
              title="Minhas tasks"
              count={activeIssues.length}
              color="#7B2FDE"
              action={
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <SortDropdown value={taskSort} onChange={(v) => { setTaskSort(v); setIssueOrder([]); }} />
                  <button
                    onClick={() => setShowTasksModal(true)}
                    style={{
                      display: "flex", alignItems: "center", gap: 4,
                      fontFamily: font, fontSize: 11, fontWeight: 600,
                      color: "var(--mk-purple)",
                      background: "rgba(123,47,222,0.12)",
                      border: "1px solid rgba(123,47,222,0.25)",
                      borderRadius: 7, padding: "4px 9px",
                      cursor: "pointer", transition: "all .15s",
                    }}
                  >
                    <LayoutGrid size={11} />
                    Ver todas
                  </button>
                </div>
              }
            />

            {/* Em andamento */}
            <div style={{ marginBottom: 12 }}>
              <p style={{ fontFamily: font, fontSize: 10, fontWeight: 700, color: "var(--mk-purple)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8, marginTop: 0, filter: "brightness(1.3)" }}>
                🔄 Em andamento · {loading ? "—" : inProgress.length}
              </p>
              {loading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {[0, 1].map((i) => <Skeleton key={i} height={40} />)}
                </div>
              ) : inProgress.length === 0 ? (
                <EmptyState text="Nenhuma em andamento." />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }} onDragLeave={() => setDashDragOverId(null)}>
                  {sortedInProgress.slice(0, 4).map((issue) => (
                    <IssueCard
                      key={issue.id} issue={issue} compact
                      states={linearStates} updatingId={updatingIssueId}
                      onStatusChange={handleIssueStatusChange}
                      onOpenModal={openIssueModal}
                      onMarkDone={handleMarkDone}
                      dragOverId={dashDragOverId}
                      onDragStart={setDashDragId}
                      onDragOver={setDashDragOverId}
                      onDrop={(targetId) => handleDashDrop(targetId, activeIssues)}
                    />
                  ))}
                  {inProgress.length > 4 && (
                    <button
                      onClick={() => setShowTasksModal(true)}
                      style={{ fontFamily: font, fontSize: 10, color: "var(--mk-purple)", padding: "4px 2px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
                    >
                      +{inProgress.length - 4} mais →
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* A fazer */}
            <div style={{ marginBottom: doneIssues.length > 0 ? 12 : 0 }}>
              <p style={{ fontFamily: font, fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8, marginTop: 0 }}>
                📋 A fazer · {loading ? "—" : todo.length}
              </p>
              {loading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {[0, 1].map((i) => <Skeleton key={i} height={40} />)}
                </div>
              ) : todo.length === 0 ? (
                <EmptyState text="Nenhuma pendente." />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }} onDragLeave={() => setDashDragOverId(null)}>
                  {sortedTodo.slice(0, 4).map((issue) => (
                    <IssueCard
                      key={issue.id} issue={issue} compact
                      states={linearStates} updatingId={updatingIssueId}
                      onStatusChange={handleIssueStatusChange}
                      onOpenModal={openIssueModal}
                      onMarkDone={handleMarkDone}
                      dragOverId={dashDragOverId}
                      onDragStart={setDashDragId}
                      onDragOver={setDashDragOverId}
                      onDrop={(targetId) => handleDashDrop(targetId, activeIssues)}
                    />
                  ))}
                  {todo.length > 4 && (
                    <button
                      onClick={() => setShowTasksModal(true)}
                      style={{ fontFamily: font, fontSize: 10, color: "var(--text-muted)", padding: "4px 2px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
                    >
                      +{todo.length - 4} mais →
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Concluídas */}
            {doneIssues.length > 0 && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, paddingTop: 8, borderTop: "1px solid var(--border-card)" }}>
                  <span style={{ fontFamily: font, fontSize: 10, fontWeight: 700, color: "var(--mk-blue)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    ✅ Concluídas
                  </span>
                  <span style={{
                    fontSize: 10, color: "var(--text-muted)",
                    background: "rgba(20,136,216,0.12)", border: "1px solid rgba(20,136,216,0.25)",
                    padding: "1px 6px", borderRadius: 20,
                  }}>
                    {doneIssues.length}
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {doneIssues.map((issue) => (
                    <IssueCard
                      key={issue.id} issue={issue} compact
                      states={linearStates} updatingId={updatingIssueId}
                      onStatusChange={handleIssueStatusChange}
                      onOpenModal={openIssueModal}
                      onMarkDone={handleMarkDone}
                      dragOverId={null}
                      onDragStart={() => {}} onDragOver={() => {}} onDrop={() => {}}
                    />
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* ── Row 3: Emails + Menções ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>

          {/* Emails recentes */}
          <Card>
            <SectionHeader
              icon="mail-outline"
              title="Emails recentes"
              count={data?.gmailMessages.length}
              color="#00E87A"
              action={
                <button
                  onClick={() => { setEmailModalInitial(null); setEmailModalOpen(true); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 4,
                    fontFamily: font, fontSize: 11, fontWeight: 600,
                    color: "var(--mk-green)",
                    background: "rgba(0,232,122,0.12)",
                    border: "1px solid rgba(0,232,122,0.25)",
                    borderRadius: 7, padding: "4px 9px",
                    cursor: "pointer", transition: "all .15s",
                  }}
                >
                  <Inbox size={11} />
                  Ver todos
                </button>
              }
            />
            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[0, 1, 2, 3].map((i) => <Skeleton key={i} height={52} />)}
              </div>
            ) : !data?.authenticated ? (
              <EmptyState text="⚠️ Faça login com Google para ver seus emails." />
            ) : (data?.gmailMessages.length ?? 0) === 0 ? (
              <EmptyState text="Nenhum email não lido." />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {data!.gmailMessages.slice(0, 6).map((msg) => (
                  <EmailListItem
                    key={msg.id}
                    msg={msg}
                    isRead={readEmailIds.has(msg.id)}
                    onClick={() => {
                      setEmailModalInitial(msg);
                      setEmailModalOpen(true);
                    }}
                  />
                ))}
                {data!.gmailMessages.length > 6 && (
                  <button
                    onClick={() => { setEmailModalInitial(null); setEmailModalOpen(true); }}
                    style={{ fontFamily: font, fontSize: 10, color: "var(--mk-green)", padding: "4px 2px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
                  >
                    +{data!.gmailMessages.length - 6} mais →
                  </button>
                )}
              </div>
            )}
          </Card>

          {/* Minhas menções */}
          <Card>
            <SectionHeader icon="chatbubble-ellipses-outline" title="Minhas menções" count={data?.mentions.length} color="#1488D8" />
            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[0, 1, 2, 3].map((i) => <Skeleton key={i} height={56} />)}
              </div>
            ) : (data?.mentions.length ?? 0) === 0 ? (
              <EmptyState text="Nenhuma menção recente." />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {data!.mentions.slice(0, 6).map((msg) => (
                  <a
                    key={msg.ts}
                    href={msg.permalink}
                    target="_blank"
                    rel="noreferrer"
                    className="mk-link"
                    style={{ display: "block", padding: "8px 10px", borderRadius: 8, background: "var(--bg-active)", border: "1px solid var(--border-card)", textDecoration: "none", transition: "opacity .15s" }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontFamily: font, fontSize: 11, fontWeight: 700, color: "var(--mk-blue)" }}>
                        #{msg.channelName}
                      </span>
                      <span style={{ fontFamily: font, fontSize: 10, color: "var(--text-muted)" }}>{timeAgo(msg.date)}</span>
                    </div>
                    <p style={{ fontFamily: font, fontSize: 11, color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
                      {slackText(msg.text, 120)}
                    </p>
                  </a>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* ── Row 4: Golden Pizza | WooW ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>

          {/* Golden Pizza */}
          <Card>
            <SectionHeader icon="pizza-outline" title="Golden Pizza" color="#f59e0b" />
            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[0, 1, 2].map((i) => <Skeleton key={i} height={70} />)}
              </div>
            ) : data?.goldenPizzaMessages.length === 0 ? (
              <EmptyState text="Nenhuma mensagem recente." />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {(data?.goldenPizzaMessages ?? []).map((msg) => (
                  <div key={msg.ts} style={{ padding: "10px 12px", borderRadius: 8, background: "var(--bg-active)", border: "1px solid var(--border-card)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontFamily: font, fontSize: 12, fontWeight: 700, color: "#f59e0b" }}>{msg.userName}</span>
                      <span style={{ fontFamily: font, fontSize: 10, color: "var(--text-muted)" }}>{timeAgo(msg.date)}</span>
                    </div>
                    <p style={{ fontFamily: font, fontSize: 12, color: "var(--text-secondary)", margin: 0, lineHeight: 1.55 }}>
                      {slackText(msg.text)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* WooW do mês */}
          <Card>
            <SectionHeader icon="trophy-outline" title="WooW do mês" count={data?.woowMessages.length} color="var(--mk-green-text)" />
            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[0, 1, 2, 3].map((i) => <Skeleton key={i} height={56} />)}
              </div>
            ) : (data?.woowMessages.length ?? 0) === 0 ? (
              <EmptyState text="Nenhuma indicação recente encontrada." />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {data!.woowMessages.slice(0, 8).map((msg) => (
                  <div key={msg.ts} style={{ padding: "8px 10px", borderRadius: 8, background: "var(--bg-active)", border: "1px solid var(--border-card)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, flexWrap: "wrap" }}>
                      <span style={{ fontFamily: font, fontSize: 11, fontWeight: 600, color: "var(--text-secondary)" }}>{msg.userName}</span>
                      <span style={{ fontSize: 10, color: "var(--text-muted)" }}>→</span>
                      <span style={{ fontFamily: font, fontSize: 11, fontWeight: 700, color: "var(--mk-green)" }}>
                        {msg.nominees.join(", ")}
                      </span>
                    </div>
                    <p style={{ fontFamily: font, fontSize: 11, color: "var(--text-muted)", margin: 0, lineHeight: 1.5 }}>
                      {slackText(msg.text, 120)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

      </div>

      {/* ── Tasks Modal ── */}
      {showTasksModal && (
        <TasksModal
          issues={allIssues}
          doneIssueIds={doneIssueIds}
          states={linearStates}
          updatingId={updatingIssueId}
          onStatusChange={handleIssueStatusChange}
          onMarkDone={handleMarkDone}
          onOpenModal={openIssueModal}
          onClose={() => setShowTasksModal(false)}
        />
      )}

      {/* ── Issue Detail Modal ── */}
      {issueModalOpen && (
        <IssueDetailModal
          loading={issueModalLoading}
          detail={issueModalDetail}
          onClose={() => { setIssueModalOpen(false); setIssueModalDetail(null); }}
        />
      )}

      {/* ── Meeting Detail Modal ── */}
      {selectedMeeting && (
        <MeetingDetailModal
          event={selectedMeeting}
          isImportant={importantEventIds.has(selectedMeeting.id)}
          onToggleImportant={() => toggleImportant(selectedMeeting.id)}
          onArchive={() => archiveEvent(selectedMeeting.id)}
          onClose={() => setSelectedMeeting(null)}
          onRsvp={(id, status) => setRsvpOverrides((prev) => ({ ...prev, [id]: status }))}
        />
      )}

      {/* ── Past Meetings Modal ── */}
      {showPastMeetingsModal && (
        <PastMeetingsModal
          events={pastWeekEvents}
          onClose={() => setShowPastMeetingsModal(false)}
        />
      )}

      {/* ── Email Modal ── */}
      {emailModalOpen && (
        <EmailModal
          initial={emailModalInitial}
          recentMessages={data?.gmailMessages ?? []}
          onClose={() => { setEmailModalOpen(false); setEmailModalInitial(null); }}
        />
      )}
    </div>
  );
}
